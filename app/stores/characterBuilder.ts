// app/stores/characterBuilder.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AbilityScores, Character, CharacterStats, Race, CharacterClass, Background, CharacterSpell, CharacterClassEntry } from '~/types'
import type { ProficiencyChoicesResponse } from '~/types/proficiencies'

/**
 * Character Builder Wizard Store
 *
 * Manages state for the multi-step character creation wizard.
 * Character is created as draft on step 1, updated as user progresses.
 */
export const useCharacterBuilderStore = defineStore('characterBuilder', () => {
  // API client
  const { apiFetch } = useApi()
  // ══════════════════════════════════════════════════════════════
  // WIZARD NAVIGATION
  // ══════════════════════════════════════════════════════════════
  const currentStep = ref(1)
  const totalSteps = computed(() => {
    let steps = 7 // Base: Name, Race, Class, Abilities, Background, Equipment, Review
    if (needsSubrace.value) steps++ // Subrace step (after Race)
    if (hasPendingChoices.value) steps++
    if (isCaster.value) steps++
    return steps
  })
  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === totalSteps.value)

  // ══════════════════════════════════════════════════════════════
  // CHARACTER DATA (mirrors API fields)
  // ══════════════════════════════════════════════════════════════
  const characterId = ref<number | null>(null)
  const name = ref('')
  const raceId = ref<number | null>(null)
  const subraceId = ref<number | null>(null)
  // Array of character classes (supports multiclass, but level 1 uses just one)
  const characterClasses = ref<CharacterClassEntry[]>([])
  const backgroundId = ref<number | null>(null)
  const abilityScores = ref<AbilityScores>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  })
  const abilityScoreMethod = ref<'standard_array' | 'point_buy' | 'manual'>('manual')

  // Equipment choices (choice_group → selected item_id)
  const equipmentChoices = ref<Map<string, number>>(new Map())

  // Race spell choices (choice_group → selected spell_id)
  const raceSpellChoices = ref<Map<string, number>>(new Map())

  // Equipment item selections within compound choices
  // Key: "choice_group:choice_option:choice_item_index"
  const equipmentItemSelections = ref<Map<string, number>>(new Map())

  // Pending spell selections (local state until saved)
  // Set of spell IDs the user has selected but not yet saved
  const pendingSpellIds = ref<Set<number>>(new Set())

  // Proficiency choices from API
  const proficiencyChoices = ref<ProficiencyChoicesResponse | null>(null)

  // User's pending proficiency selections: Map<"source:choice_group", Set<skillId>>
  const pendingProficiencySelections = ref<Map<string, Set<number>>>(new Map())

  // ══════════════════════════════════════════════════════════════
  // FETCHED REFERENCE DATA (for display without re-fetching)
  // ══════════════════════════════════════════════════════════════
  const selectedBaseRace = ref<Race | null>(null) // Always the base race (e.g., Elf)
  const selectedRace = ref<Race | null>(null) // The subrace if selected, otherwise base race
  const selectedBackground = ref<Background | null>(null)
  const selectedSpells = ref<CharacterSpell[]>([])

  // ══════════════════════════════════════════════════════════════
  // MULTICLASS COMPUTED PROPERTIES
  // ══════════════════════════════════════════════════════════════

  // Primary class (first/only class for level 1 characters)
  const primaryClass = computed(() =>
    characterClasses.value.find(c => c.isPrimary) ?? null
  )

  // Backwards-compatible classId (for existing code)
  const classId = computed(() => primaryClass.value?.classId ?? null)

  // Backwards-compatible selectedClass (for existing code)
  const selectedClass = computed(() => primaryClass.value?.classData ?? null)

  // ══════════════════════════════════════════════════════════════
  // COMPUTED STATS (from API)
  // ══════════════════════════════════════════════════════════════
  const characterData = ref<Character | null>(null)
  const characterStats = ref<CharacterStats | null>(null)

  // ══════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ══════════════════════════════════════════════════════════════

  // Check if class has spells to choose at level 1
  // A class is only considered a "caster" for wizard purposes if they
  // actually have cantrips or spells to select (e.g., Paladins/Rangers
  // have spellcasting_ability but get 0 spells at level 1)
  const isCaster = computed(() => {
    if (!selectedClass.value?.spellcasting_ability) return false

    // Check level 1 progression for spells_known or cantrips_known
    const progression = selectedClass.value.level_progression
    if (!progression || progression.length === 0) return false

    const level1 = progression.find(p => p.level === 1)
    if (!level1) return false

    const cantrips = level1.cantrips_known ?? 0
    const spells = level1.spells_known ?? 0

    return cantrips > 0 || spells > 0
  })

  // Does the selected race have subraces? (checks selectedRace for backwards compatibility)
  const hasSubraces = computed(() =>
    (selectedRace.value?.subraces?.length ?? 0) > 0
  )

  // Does this character have any proficiency choice groups?
  // Returns true if ANY choice groups exist (whether or not choices have been made)
  // This determines if the Proficiency step appears in the wizard
  const hasPendingChoices = computed(() => {
    if (!proficiencyChoices.value) return false
    const { class: cls, race, background } = proficiencyChoices.value.data

    // Check if any choice groups exist (user can edit even if already selected)
    return Object.keys(cls).length > 0
      || Object.keys(race).length > 0
      || Object.keys(background).length > 0
  })

  // Does the selected base race have subraces?
  // This determines if the Subrace step appears in the wizard
  // Returns true if base race exists and has subraces (regardless of whether one is selected)
  const needsSubrace = computed(() => {
    if (!selectedBaseRace.value) return false
    return (selectedBaseRace.value.subraces?.length ?? 0) > 0
  })

  // Are all required proficiency choices complete?
  // With the new API format, we check:
  // 1. If selected_skills has required quantity → complete (already saved)
  // 2. If pending selections has required quantity → complete (ready to save)
  // This handles both fresh selections and editing existing choices
  const allProficiencyChoicesComplete = computed(() => {
    if (!proficiencyChoices.value) return true
    if (!hasPendingChoices.value) return true

    const { class: cls, race, background } = proficiencyChoices.value.data

    // Helper to check if a group is complete
    const isGroupComplete = (source: string, groupName: string, group: { quantity: number, selected_skills?: number[], selected_proficiency_types?: number[] }): boolean => {
      const pendingCount = pendingProficiencySelections.value.get(`${source}:${groupName}`)?.size ?? 0
      const savedSkillCount = group.selected_skills?.length ?? 0
      const savedProfTypeCount = group.selected_proficiency_types?.length ?? 0
      const savedTotal = savedSkillCount + savedProfTypeCount

      // Complete if pending selections match quantity (user is actively selecting/editing)
      if (pendingCount === group.quantity) return true

      // Complete if already saved and no pending changes (user hasn't modified)
      if (savedTotal === group.quantity && pendingCount === 0) return true

      return false
    }

    for (const [groupName, group] of Object.entries(cls)) {
      if (!isGroupComplete('class', groupName, group)) return false
    }

    for (const [groupName, group] of Object.entries(race)) {
      if (!isGroupComplete('race', groupName, group)) return false
    }

    for (const [groupName, group] of Object.entries(background)) {
      if (!isGroupComplete('background', groupName, group)) return false
    }

    return true
  })

  const validationStatus = computed(() =>
    characterData.value?.validation_status ?? { is_complete: false, missing: [] }
  )

  const isComplete = computed(() =>
    validationStatus.value.is_complete
  )

  const racialBonuses = computed(() =>
    selectedRace.value?.modifiers?.filter(m => m.modifier_category === 'ability_score') ?? []
  )

  // Combined equipment from class + background
  const allEquipment = computed(() => [
    ...(selectedClass.value?.equipment ?? []),
    ...(selectedBackground.value?.equipment ?? [])
  ])

  // Equipment grouped by choice_group
  const equipmentByChoiceGroup = computed(() => {
    const groups = new Map<string, typeof allEquipment.value>()
    for (const item of allEquipment.value) {
      if (item.is_choice && item.choice_group) {
        const existing = groups.get(item.choice_group) ?? []
        groups.set(item.choice_group, [...existing, item])
      }
    }
    return groups
  })

  // Fixed equipment (no choice required)
  const fixedEquipment = computed(() =>
    allEquipment.value.filter(item => !item.is_choice)
  )

  // Enhanced validation: all equipment choices made including item selections
  const allEquipmentChoicesMade = computed(() => {
    // Check each choice group has a selection
    for (const [group] of equipmentByChoiceGroup.value) {
      if (!equipmentChoices.value.has(group)) return false

      // Find the selected option
      const selectedOptionId = equipmentChoices.value.get(group)
      const allItems = [...(selectedClass.value?.equipment ?? []), ...(selectedBackground.value?.equipment ?? [])]
      const selectedOption = allItems.find(item => item.id === selectedOptionId)

      if (!selectedOption?.choice_items?.length) continue

      // Check all category items have selections
      for (const [index, choiceItem] of selectedOption.choice_items.entries()) {
        // Only category items need selection (proficiency_type set, item not set)
        if (choiceItem.proficiency_type && !choiceItem.item) {
          const key = `${group}:${selectedOption.choice_option}:${index}`
          if (!equipmentItemSelections.value.has(key)) return false
        }
      }
    }
    return true
  })

  // ══════════════════════════════════════════════════════════════
  // SPELL COMPUTED PROPERTIES
  // ══════════════════════════════════════════════════════════════

  // Filter selectedSpells to only cantrips (level 0)
  const selectedCantrips = computed(() =>
    selectedSpells.value.filter(s => s.spell?.level === 0)
  )

  // Filter selectedSpells to only leveled spells (level > 0)
  const selectedLeveledSpells = computed(() =>
    selectedSpells.value.filter(s => (s.spell?.level ?? 0) > 0)
  )

  // ══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════════════════════════
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ══════════════════════════════════════════════════════════════
  // NAVIGATION ACTIONS
  // ══════════════════════════════════════════════════════════════
  function nextStep(): void {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
    }
  }

  function previousStep(): void {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function goToStep(step: number): void {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step
    }
  }

  // ══════════════════════════════════════════════════════════════
  // API ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Step 1: Create a draft character with just a name
   */
  async function createDraft(characterName: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiFetch<{ data: { id: number, name: string } }>('/characters', {
        method: 'POST',
        body: { name: characterName }
      })

      characterId.value = response.data.id
      name.value = characterName
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create character'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh character stats from API
   */
  async function refreshStats(): Promise<void> {
    if (!characterId.value) return

    const response = await apiFetch<{ data: CharacterStats }>(
      `/characters/${characterId.value}/stats`
    )
    characterStats.value = response.data
  }

  /**
   * Step 2: Select race (base race only, subrace selected in separate step)
   * API expects race_id to be the base race ID at this point
   * Fetches full race detail to get subraces array (for hasSubraces computed)
   */
  async function selectRace(race: Race, subrace?: Race): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { race_id: subrace?.id ?? race.id }
      })

      raceId.value = race.id
      subraceId.value = subrace?.id ?? null

      // Fetch full race detail to get subraces array (not included in list endpoint)
      // This is needed for needsSubrace computed to work correctly
      const raceDetail = await apiFetch<{ data: Race }>(`/races/${race.slug}`)
      selectedBaseRace.value = raceDetail.data
      selectedRace.value = subrace ?? raceDetail.data

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save race'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 2b: Select subrace (separate step when race has subraces)
   * API receives the subrace ID as race_id (overwrites base race)
   */
  async function selectSubrace(subrace: Race): Promise<void> {
    if (!selectedBaseRace.value) {
      error.value = 'No base race selected'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { race_id: subrace.id }
      })

      subraceId.value = subrace.id
      selectedRace.value = subrace

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save subrace'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear subrace selection (used when user changes race)
   */
  function clearSubrace(): void {
    subraceId.value = null
  }

  /**
   * Step 3: Select class
   * Uses new /classes endpoints for multiclass support
   * Clears existing classes first (level 1 characters have exactly one class)
   */
  async function selectClass(cls: CharacterClass): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Clear existing classes first (for re-selection)
      for (const entry of characterClasses.value) {
        await apiFetch(`/characters/${characterId.value}/classes/${entry.classId}`, {
          method: 'DELETE'
        })
      }

      // Add the new class
      await apiFetch(`/characters/${characterId.value}/classes`, {
        method: 'POST',
        body: { class_id: cls.id }
      })

      // Fetch full class detail to get equipment data
      const fullClass = await apiFetch<{ data: CharacterClass }>(`/classes/${cls.slug}`)

      // Update characterClasses array
      characterClasses.value = [{
        classId: cls.id,
        subclassId: null,
        level: 1,
        isPrimary: true,
        order: 0,
        classData: fullClass.data
      }]

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save class'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 4: Assign ability scores
   */
  async function saveAbilityScores(
    method: 'standard_array' | 'point_buy' | 'manual',
    scores: AbilityScores
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: {
          ability_score_method: method,
          strength: scores.strength,
          dexterity: scores.dexterity,
          constitution: scores.constitution,
          intelligence: scores.intelligence,
          wisdom: scores.wisdom,
          charisma: scores.charisma
        }
      })

      abilityScores.value = scores
      abilityScoreMethod.value = method
      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save ability scores'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 5: Select background
   * Fetches full background detail to get equipment data
   * Also fetches proficiency choices (all sources are now selected)
   */
  async function selectBackground(background: Background): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { background_id: background.id }
      })

      backgroundId.value = background.id

      // Fetch full background detail to get equipment data
      const fullBackground = await apiFetch<{ data: Background }>(`/backgrounds/${background.slug}`)
      selectedBackground.value = fullBackground.data

      await refreshStats()

      // Fetch proficiency choices now that all sources (race, class, background) are selected
      // This determines if the Proficiency Choices step will appear
      await fetchProficiencyChoices()
    } catch (err: unknown) {
      error.value = 'Failed to save background'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set equipment choice (local state only)
   */
  function setEquipmentChoice(choiceGroup: string, itemId: number): void {
    equipmentChoices.value.set(choiceGroup, itemId)
  }

  /**
   * Build selection key for equipment item within a compound choice
   */
  function makeEquipmentSelectionKey(choiceGroup: string, choiceOption: number, choiceItemIndex: number): string {
    return `${choiceGroup}:${choiceOption}:${choiceItemIndex}`
  }

  /**
   * Set selected item for a compound choice item
   */
  function setEquipmentItemSelection(
    choiceGroup: string,
    choiceOption: number,
    choiceItemIndex: number,
    itemId: number
  ): void {
    const key = makeEquipmentSelectionKey(choiceGroup, choiceOption, choiceItemIndex)
    equipmentItemSelections.value.set(key, itemId)
  }

  /**
   * Get selected item for a compound choice item
   */
  function getEquipmentItemSelection(
    choiceGroup: string,
    choiceOption: number,
    choiceItemIndex: number
  ): number | undefined {
    const key = makeEquipmentSelectionKey(choiceGroup, choiceOption, choiceItemIndex)
    return equipmentItemSelections.value.get(key)
  }

  /**
   * Clear all item selections for a choice group (when user changes option)
   */
  function clearEquipmentItemSelections(choiceGroup: string): void {
    for (const key of equipmentItemSelections.value.keys()) {
      if (key.startsWith(`${choiceGroup}:`)) {
        equipmentItemSelections.value.delete(key)
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SPELL ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Toggle spell selection (local state only)
   * Does NOT call API - selections are saved when moving to next step
   */
  function toggleSpell(spellId: number): void {
    const newSet = new Set(pendingSpellIds.value)
    if (newSet.has(spellId)) {
      newSet.delete(spellId)
    } else {
      newSet.add(spellId)
    }
    pendingSpellIds.value = newSet
  }

  /**
   * Check if a spell is selected (in pending selections)
   */
  function isSpellSelected(spellId: number): boolean {
    return pendingSpellIds.value.has(spellId)
  }

  /**
   * Initialize pending spells from character's saved spells
   * Called when entering the spell step
   */
  async function initializePendingSpells(): Promise<void> {
    if (!characterId.value) return

    try {
      const response = await apiFetch<{ data: CharacterSpell[] }>(`/characters/${characterId.value}/spells`)
      const spellIds = (response.data ?? [])
        .map(s => s.spell?.id)
        .filter((id): id is number => id !== undefined)
      pendingSpellIds.value = new Set(spellIds)
    } catch {
      // No existing spells - start with empty set
      pendingSpellIds.value = new Set()
    }
  }

  /**
   * Save all pending spell selections to the character
   * Called when moving from spell step to next step
   * Clears existing spells first to avoid duplicates (like equipment)
   */
  async function saveSpellChoices(): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      // First, clear existing spells
      const existingResponse = await apiFetch<{ data: CharacterSpell[] }>(
        `/characters/${characterId.value}/spells`
      )
      const existingSpells = existingResponse?.data ?? []

      for (const spell of existingSpells) {
        if (spell.spell?.id) {
          await apiFetch(`/characters/${characterId.value}/spells/${spell.spell.id}`, {
            method: 'DELETE'
          })
        }
      }

      // Then add all pending spells
      for (const spellId of pendingSpellIds.value) {
        await apiFetch(`/characters/${characterId.value}/spells`, {
          method: 'POST',
          body: { spell_id: spellId }
        })
      }
    } catch (err: unknown) {
      error.value = 'Failed to save spells'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set race spell choice (local state only, e.g., High Elf cantrip)
   */
  function setRaceSpellChoice(choiceGroup: string, spellId: number): void {
    raceSpellChoices.value.set(choiceGroup, spellId)
  }

  // ══════════════════════════════════════════════════════════════
  // PROFICIENCY CHOICE ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Fetch pending proficiency choices from API
   */
  async function fetchProficiencyChoices(): Promise<void> {
    if (!characterId.value) return

    const response = await apiFetch<ProficiencyChoicesResponse>(
      `/characters/${characterId.value}/proficiency-choices`
    )
    proficiencyChoices.value = response
  }

  /**
   * Toggle a skill selection in pending state
   */
  function toggleProficiencySelection(
    source: 'class' | 'race' | 'background',
    choiceGroup: string,
    skillId: number
  ): void {
    const key = `${source}:${choiceGroup}`
    const current = pendingProficiencySelections.value.get(key) ?? new Set<number>()

    // Create new Set to ensure Vue reactivity triggers
    const updated = new Set(current)
    if (updated.has(skillId)) {
      updated.delete(skillId)
    } else {
      updated.add(skillId)
    }

    // Create new Map to ensure reactivity
    const newMap = new Map(pendingProficiencySelections.value)
    newMap.set(key, updated)
    pendingProficiencySelections.value = newMap
  }

  /**
   * Initialize pending selections from API's selected_skills
   * Used when editing existing character - pre-populates selections
   */
  function initializeProficiencySelections(
    source: 'class' | 'race' | 'background',
    choiceGroup: string,
    skillIds: Set<number>
  ): void {
    const key = `${source}:${choiceGroup}`
    const newMap = new Map(pendingProficiencySelections.value)
    newMap.set(key, new Set(skillIds))
    pendingProficiencySelections.value = newMap
  }

  /**
   * Save all pending proficiency selections to API
   */
  async function saveProficiencyChoices(): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      for (const [key, skillIds] of pendingProficiencySelections.value) {
        if (skillIds.size === 0) continue

        const [source, choiceGroup] = key.split(':')
        await apiFetch(`/characters/${characterId.value}/proficiency-choices`, {
          method: 'POST',
          body: {
            source,
            choice_group: choiceGroup,
            skill_ids: [...skillIds]
          }
        })
      }

      // Refresh choices to update remaining counts
      await fetchProficiencyChoices()
    } catch (err: unknown) {
      error.value = 'Failed to save proficiency choices'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear all existing equipment from character
   * Used before re-saving equipment to avoid duplicates
   */
  async function clearExistingEquipment(): Promise<void> {
    if (!characterId.value) return

    try {
      // Fetch current equipment
      const response = await apiFetch<{ data: Array<{ id: number }> }>(
        `/characters/${characterId.value}/equipment`
      )

      // Delete each item (if any exist)
      const items = response?.data ?? []
      for (const item of items) {
        await apiFetch(`/characters/${characterId.value}/equipment/${item.id}`, {
          method: 'DELETE'
        })
      }
    } catch {
      // If fetching equipment fails (e.g., no equipment yet), continue with save
      // This is expected for new characters
    }
  }

  /**
   * Save all equipment choices to the character
   * Called when moving from equipment step to next step
   *
   * When editing, clears existing equipment first to avoid duplicates
   */
  async function saveEquipmentChoices(): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      // First, clear any existing equipment to avoid duplicates on re-save
      await clearExistingEquipment()

      const allItems = [...(selectedClass.value?.equipment ?? []), ...(selectedBackground.value?.equipment ?? [])]

      for (const [group, optionId] of equipmentChoices.value) {
        const selectedOption = allItems.find(item => item.id === optionId)
        if (!selectedOption) continue

        // If option has choice_items, process each
        if (selectedOption.choice_items?.length) {
          for (const [index, choiceItem] of selectedOption.choice_items.entries()) {
            let itemId: number
            const quantity = choiceItem.quantity

            if (choiceItem.item) {
              // Fixed item - use directly
              itemId = choiceItem.item.id
            } else if (choiceItem.proficiency_type) {
              // Category item - get user's selection
              const key = `${group}:${selectedOption.choice_option}:${index}`
              const selectedItemId = equipmentItemSelections.value.get(key)
              if (!selectedItemId) continue
              itemId = selectedItemId
            } else {
              continue
            }

            await apiFetch(`/characters/${characterId.value}/equipment`, {
              method: 'POST',
              body: { item_id: itemId, quantity }
            })
          }
        } else if (selectedOption.item) {
          // Simple choice with direct item reference
          await apiFetch(`/characters/${characterId.value}/equipment`, {
            method: 'POST',
            body: { item_id: selectedOption.item.id, quantity: selectedOption.quantity }
          })
        }
      }

      // Also add fixed equipment (both database items and flavor items)
      const fixedEquipment = allItems.filter(item => !item.is_choice)
      for (const item of fixedEquipment) {
        if (item.item) {
          // Database item at top level - save with item_id
          await apiFetch(`/characters/${characterId.value}/equipment`, {
            method: 'POST',
            body: { item_id: item.item.id, quantity: item.quantity }
          })
        } else if (item.choice_items?.[0]?.item) {
          // Database item inside choice_items (e.g., Leather armor, Dagger)
          // These have item: null at top level but item data in choice_items
          const choiceItem = item.choice_items[0]
          const choiceItemRef = choiceItem.item! // Safe - already checked above
          await apiFetch(`/characters/${characterId.value}/equipment`, {
            method: 'POST',
            body: { item_id: choiceItemRef.id, quantity: choiceItem.quantity ?? item.quantity }
          })
        } else if (item.description) {
          // Flavor item - save with custom_name (truly has no item reference)
          await apiFetch(`/characters/${characterId.value}/equipment`, {
            method: 'POST',
            body: { custom_name: item.description, quantity: item.quantity }
          })
        }
      }
    } catch (err: unknown) {
      error.value = 'Failed to save equipment'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ══════════════════════════════════════════════════════════════
  // EDIT MODE ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Load an existing character for editing
   * Fetches character data and populates all wizard state
   */
  async function loadCharacterForEditing(id: number): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // 1. Fetch character data
      const response = await apiFetch<{ data: Character }>(`/characters/${id}`)
      const character = response.data

      // 2. Check level constraint
      if (character.level > 1) {
        throw new Error('Only level 1 characters can be edited')
      }

      // 3. Populate basic fields
      characterId.value = character.id
      name.value = character.name

      // 4. Map ability scores (API uses STR/DEX, store uses strength/dexterity)
      if (character.ability_scores) {
        abilityScores.value = {
          strength: character.ability_scores.STR ?? 10,
          dexterity: character.ability_scores.DEX ?? 10,
          constitution: character.ability_scores.CON ?? 10,
          intelligence: character.ability_scores.INT ?? 10,
          wisdom: character.ability_scores.WIS ?? 10,
          charisma: character.ability_scores.CHA ?? 10
        }
      }

      // 5. Fetch full reference data if relations exist
      if (character.race) {
        const raceResponse = await apiFetch<{ data: Race }>(`/races/${character.race.slug}`)
        const loadedRace = raceResponse.data

        // Handle subrace detection and set selectedBaseRace
        if (loadedRace.parent_race) {
          // Character has a subrace selected - fetch the parent (base) race
          subraceId.value = character.race.id
          raceId.value = loadedRace.parent_race.id
          selectedRace.value = loadedRace
          // Fetch the base race to get its full data (including subraces array)
          const baseRaceResponse = await apiFetch<{ data: Race }>(`/races/${loadedRace.parent_race.slug}`)
          selectedBaseRace.value = baseRaceResponse.data
        } else {
          // Character has a base race (no subrace) - this race IS the base race
          selectedBaseRace.value = loadedRace
          selectedRace.value = loadedRace
          raceId.value = loadedRace.id
          subraceId.value = null
        }
      }

      // Load classes from character.classes array (new multiclass API)
      if (character.classes && character.classes.length > 0) {
        characterClasses.value = await Promise.all(
          character.classes.map(async (pivot) => {
            const fullClass = await apiFetch<{ data: CharacterClass }>(`/classes/${pivot.class.slug}`)
            return {
              classId: pivot.class.id,
              subclassId: pivot.subclass?.id ?? null,
              level: typeof pivot.level === 'string' ? parseInt(pivot.level, 10) : pivot.level,
              isPrimary: pivot.is_primary === 'true' || pivot.is_primary === '1',
              order: typeof pivot.order === 'string' ? parseInt(pivot.order, 10) : pivot.order,
              classData: fullClass.data
            }
          })
        )
      }

      if (character.background) {
        const bgResponse = await apiFetch<{ data: Background }>(`/backgrounds/${character.background.slug}`)
        selectedBackground.value = bgResponse.data
        backgroundId.value = character.background.id
      }

      // 6. Initialize pending spells if caster
      if (selectedClass.value?.spellcasting_ability) {
        await initializePendingSpells()
      }

      // 7. Fetch proficiency choices for existing character
      if (character.background) {
        await fetchProficiencyChoices()
      }

      // 8. Determine starting step
      currentStep.value = determineStartingStep(character)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load character'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update character name (for edit mode)
   */
  async function updateName(newName: string): Promise<void> {
    if (!characterId.value) return

    await apiFetch(`/characters/${characterId.value}`, {
      method: 'PATCH',
      body: { name: newName }
    })

    name.value = newName
  }

  /**
   * Determine which step to start on based on what's filled
   */
  function determineStartingStep(character: Character): number {
    if (!character.name) return 1
    if (!character.race) return 2
    if (!character.class) return 3
    if (!character.ability_scores?.STR) return 4
    if (!character.background) return 5
    return 6 // Start at equipment for mostly-complete characters
  }

  // ══════════════════════════════════════════════════════════════
  // RESET ACTION
  // ══════════════════════════════════════════════════════════════
  function reset(): void {
    characterId.value = null
    name.value = ''
    raceId.value = null
    subraceId.value = null
    characterClasses.value = [] // Clears classId and selectedClass (computed)
    backgroundId.value = null
    abilityScores.value = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
    abilityScoreMethod.value = 'manual'
    equipmentChoices.value = new Map()
    raceSpellChoices.value = new Map()
    equipmentItemSelections.value = new Map()
    pendingSpellIds.value = new Set()
    proficiencyChoices.value = null
    pendingProficiencySelections.value = new Map()
    selectedBaseRace.value = null
    selectedRace.value = null
    selectedBackground.value = null
    selectedSpells.value = []
    characterData.value = null
    characterStats.value = null
    currentStep.value = 1
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    characterId,
    name,
    raceId,
    subraceId,
    characterClasses,
    primaryClass,
    classId,
    backgroundId,
    abilityScores,
    abilityScoreMethod,
    equipmentChoices,
    raceSpellChoices,
    equipmentItemSelections,
    selectedBaseRace,
    selectedRace,
    selectedClass,
    selectedBackground,
    selectedSpells,
    characterData,
    characterStats,
    isCaster,
    hasSubraces,
    needsSubrace,
    validationStatus,
    isComplete,
    racialBonuses,
    allEquipment,
    equipmentByChoiceGroup,
    fixedEquipment,
    allEquipmentChoicesMade,
    selectedCantrips,
    selectedLeveledSpells,
    isLoading,
    error,
    // Proficiency choices
    proficiencyChoices,
    pendingProficiencySelections,
    hasPendingChoices,
    allProficiencyChoicesComplete,
    // Actions
    nextStep,
    previousStep,
    goToStep,
    createDraft,
    refreshStats,
    selectRace,
    selectSubrace,
    clearSubrace,
    selectClass,
    saveAbilityScores,
    selectBackground,
    setEquipmentChoice,
    setEquipmentItemSelection,
    getEquipmentItemSelection,
    clearEquipmentItemSelections,
    saveEquipmentChoices,
    pendingSpellIds,
    toggleSpell,
    isSpellSelected,
    initializePendingSpells,
    saveSpellChoices,
    setRaceSpellChoice,
    fetchProficiencyChoices,
    toggleProficiencySelection,
    initializeProficiencySelections,
    saveProficiencyChoices,
    loadCharacterForEditing,
    updateName,
    reset
  }
})

// app/stores/characterBuilder.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AbilityScores, Character, CharacterStats, Race, CharacterClass, Background, CharacterSpell } from '~/types'

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
  const totalSteps = computed(() => isCaster.value ? 8 : 7)
  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === totalSteps.value)

  // ══════════════════════════════════════════════════════════════
  // CHARACTER DATA (mirrors API fields)
  // ══════════════════════════════════════════════════════════════
  const characterId = ref<number | null>(null)
  const name = ref('')
  const raceId = ref<number | null>(null)
  const subraceId = ref<number | null>(null)
  const classId = ref<number | null>(null)
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

  // ══════════════════════════════════════════════════════════════
  // FETCHED REFERENCE DATA (for display without re-fetching)
  // ══════════════════════════════════════════════════════════════
  const selectedRace = ref<Race | null>(null)
  const selectedClass = ref<CharacterClass | null>(null)
  const selectedBackground = ref<Background | null>(null)
  const selectedSpells = ref<CharacterSpell[]>([])

  // ══════════════════════════════════════════════════════════════
  // COMPUTED STATS (from API)
  // ══════════════════════════════════════════════════════════════
  const characterData = ref<Character | null>(null)
  const characterStats = ref<CharacterStats | null>(null)

  // ══════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ══════════════════════════════════════════════════════════════
  const isCaster = computed(() =>
    selectedClass.value?.spellcasting_ability !== null
    && selectedClass.value?.spellcasting_ability !== undefined
  )

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
   * Step 2: Select race (and optional subrace)
   * API expects race_id to be the subrace ID when a subrace is selected
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
      selectedRace.value = subrace ?? race

      await refreshStats()
    } catch (err: unknown) {
      error.value = 'Failed to save race'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 3: Select class
   * This updates isCaster computed which affects totalSteps
   * Fetches full class detail to get equipment data
   */
  async function selectClass(cls: CharacterClass): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { class_id: cls.id }
      })

      classId.value = cls.id

      // Fetch full class detail to get equipment data
      const fullClass = await apiFetch<{ data: CharacterClass }>(`/classes/${cls.slug}`)
      selectedClass.value = fullClass.data

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
        selectedRace.value = raceResponse.data
        raceId.value = character.race.id

        // Handle subrace detection
        if (raceResponse.data.parent_race) {
          subraceId.value = character.race.id
          raceId.value = raceResponse.data.parent_race.id
        }
      }

      if (character.class) {
        const classResponse = await apiFetch<{ data: CharacterClass }>(`/classes/${character.class.slug}`)
        selectedClass.value = classResponse.data
        classId.value = character.class.id
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

      // 7. Determine starting step
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
    classId.value = null
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
    selectedRace.value = null
    selectedClass.value = null
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
    classId,
    backgroundId,
    abilityScores,
    abilityScoreMethod,
    equipmentChoices,
    raceSpellChoices,
    equipmentItemSelections,
    selectedRace,
    selectedClass,
    selectedBackground,
    selectedSpells,
    characterData,
    characterStats,
    isCaster,
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
    // Actions
    nextStep,
    previousStep,
    goToStep,
    createDraft,
    refreshStats,
    selectRace,
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
    loadCharacterForEditing,
    updateName,
    reset
  }
})

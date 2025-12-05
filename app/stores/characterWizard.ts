// app/stores/characterWizard.ts
/**
 * Character Builder Wizard Store (v2)
 *
 * Lean store pattern - backend is source of truth for calculations.
 * This store only holds:
 * 1. Local selections (before saving)
 * 2. UI state (loading, errors)
 * 3. Cached backend data (stats, summary)
 */
import { defineStore } from 'pinia'
import type {
  Race,
  CharacterClass,
  Background,
  CharacterAlignment,
  CharacterStats
} from '~/types'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export type AbilityMethod = 'standard_array' | 'point_buy' | 'manual'

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface Subclass {
  id: number
  name: string
  slug: string
  description?: string
  source?: { code: string, name: string }
}

export interface WizardSelections {
  race: Race | null
  subrace: Race | null
  class: CharacterClass | null
  subclass: Subclass | null
  background: Background | null
  abilityScores: AbilityScores
  abilityMethod: AbilityMethod
  name: string
  alignment: CharacterAlignment | null
}

export interface PendingChoices {
  proficiencies: Map<string, Set<number>>
  languages: Map<string, Set<number>>
  equipment: Map<string, number>
  equipmentItems: Map<string, number>
  spells: Set<number>
}

export interface CharacterSummaryData {
  character: {
    id: number
    name: string
    total_level: number
  }
  pending_choices: {
    proficiencies: number
    languages: number
    spells: number
    optional_features: number
    asi: number
  }
  creation_complete: boolean
  missing_required: string[]
}

// ════════════════════════════════════════════════════════════════
// DEFAULTS
// ════════════════════════════════════════════════════════════════

function defaultAbilityScores(): AbilityScores {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  }
}

function defaultSelections(): WizardSelections {
  return {
    race: null,
    subrace: null,
    class: null,
    subclass: null,
    background: null,
    abilityScores: defaultAbilityScores(),
    abilityMethod: 'standard_array',
    name: '',
    alignment: null
  }
}

function defaultPendingChoices(): PendingChoices {
  return {
    proficiencies: new Map(),
    languages: new Map(),
    equipment: new Map(),
    equipmentItems: new Map(),
    spells: new Set()
  }
}

// ════════════════════════════════════════════════════════════════
// STORE
// ════════════════════════════════════════════════════════════════

export const useCharacterWizardStore = defineStore('characterWizard', () => {
  const { apiFetch } = useApi()

  // ══════════════════════════════════════════════════════════════
  // CHARACTER IDENTITY
  // ══════════════════════════════════════════════════════════════

  /** Character ID - null until first save (on race selection) */
  const characterId = ref<number | null>(null)

  /** Selected sourcebook codes for filtering (e.g., ['PHB', 'XGE']) */
  const selectedSources = ref<string[]>([])

  // ══════════════════════════════════════════════════════════════
  // LOCAL SELECTIONS (before saving to backend)
  // ══════════════════════════════════════════════════════════════

  const selections = ref<WizardSelections>(defaultSelections())

  // ══════════════════════════════════════════════════════════════
  // PENDING CHOICES (multi-select before save)
  // ══════════════════════════════════════════════════════════════

  const pendingChoices = ref<PendingChoices>(defaultPendingChoices())

  // ══════════════════════════════════════════════════════════════
  // BACKEND DATA (fetched, read-only for display)
  // ══════════════════════════════════════════════════════════════

  /** Calculated stats from /characters/{id}/stats */
  const stats = ref<CharacterStats | null>(null)

  /** Summary data from /characters/{id}/summary */
  const summary = ref<CharacterSummaryData | null>(null)

  // ══════════════════════════════════════════════════════════════
  // UI STATE
  // ══════════════════════════════════════════════════════════════

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Step Visibility
  // ══════════════════════════════════════════════════════════════

  /**
   * Should the subrace step be shown?
   * True if race has subraces (required or optional)
   */
  const needsSubraceStep = computed(() => {
    const race = selections.value.race
    if (!race) return false
    // Show step if race has any subraces
    return (race.subraces?.length ?? 0) > 0
  })

  /**
   * Is the subrace required (vs optional)?
   * Used to determine if "None" option should be shown
   */
  const isSubraceRequired = computed(() => {
    const race = selections.value.race
    if (!race) return false
    return race.subrace_required === true
  })

  /**
   * Should the subclass step be shown?
   * True for classes that choose subclass at level 1 (Cleric, Sorcerer, Warlock)
   */
  const needsSubclassStep = computed(() => {
    const cls = selections.value.class
    if (!cls) return false
    return cls.subclass_level === 1
  })

  /**
   * Is this character a spellcaster with spells to choose at level 1?
   */
  const isSpellcaster = computed(() => {
    const cls = selections.value.class
    if (!cls?.spellcasting_ability) return false

    // Check level 1 progression for cantrips or spells
    const progression = cls.level_progression
    if (!progression?.length) return false

    const level1 = progression.find(p => p.level === 1)
    if (!level1) return false

    const cantrips = level1.cantrips_known ?? 0
    const spells = level1.spells_known ?? 0

    return cantrips > 0 || spells > 0
  })

  /**
   * Does this character have proficiency choices to make?
   */
  const hasProficiencyChoices = computed(() => {
    if (!summary.value) return false
    return summary.value.pending_choices.proficiencies > 0
  })

  /**
   * Does this character have language choices to make?
   */
  const hasLanguageChoices = computed(() => {
    if (!summary.value) return false
    return summary.value.pending_choices.languages > 0
  })

  /**
   * Is character creation complete?
   */
  const isComplete = computed(() => {
    return summary.value?.creation_complete ?? false
  })

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Source Filtering
  // ══════════════════════════════════════════════════════════════

  /**
   * Meilisearch filter string for selected sources
   */
  const sourceFilterString = computed(() => {
    if (selectedSources.value.length === 0) return ''
    const codes = selectedSources.value.map(s => `"${s}"`).join(', ')
    return `source_codes IN [${codes}]`
  })

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Derived Data
  // ══════════════════════════════════════════════════════════════

  /**
   * The effective race (subrace if selected, otherwise base race)
   */
  const effectiveRace = computed(() => {
    return selections.value.subrace ?? selections.value.race
  })

  /**
   * Racial ability score bonuses
   */
  const racialBonuses = computed(() => {
    const race = effectiveRace.value
    if (!race?.modifiers) return []
    return race.modifiers.filter(m => m.modifier_category === 'ability_score')
  })

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Backend Sync
  // ══════════════════════════════════════════════════════════════

  /**
   * Fetch stats and summary from backend
   * Called after each save to keep UI in sync
   */
  async function syncWithBackend(): Promise<void> {
    if (!characterId.value) return

    try {
      const [statsRes, summaryRes] = await Promise.all([
        apiFetch<{ data: CharacterStats }>(`/characters/${characterId.value}/stats`),
        apiFetch<{ data: CharacterSummaryData }>(`/characters/${characterId.value}/summary`)
      ])

      stats.value = statsRes.data
      summary.value = summaryRes.data
    } catch (err) {
      console.error('Failed to sync with backend:', err)
      // Don't throw - UI should still work with stale data
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Selection Updates
  // ══════════════════════════════════════════════════════════════

  /**
   * Select or create character with race
   * This is the first save point - creates the character draft
   */
  async function selectRace(race: Race): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      if (!characterId.value) {
        // First save - create character with race
        // Provide a default name that can be changed later in Details step
        const defaultName = selections.value.name || `New ${race.name}`
        const response = await apiFetch<{ data: { id: number } }>('/characters', {
          method: 'POST',
          body: {
            name: defaultName,
            race_id: race.id
          }
        })
        characterId.value = response.data.id
        // Store the default name in selections
        if (!selections.value.name) {
          selections.value.name = defaultName
        }
      } else {
        // Update existing character
        await apiFetch(`/characters/${characterId.value}`, {
          method: 'PATCH',
          body: { race_id: race.id }
        })
      }

      // Fetch full race data with subraces
      const raceDetail = await apiFetch<{ data: Race }>(`/races/${race.slug}`)
      selections.value.race = raceDetail.data
      selections.value.subrace = null // Clear subrace when race changes

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select race'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select subrace (or null for "None" on optional subraces)
   */
  async function selectSubrace(subrace: Race | null): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      const raceId = subrace?.id ?? selections.value.race?.id
      if (!raceId) throw new Error('No race selected')

      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { race_id: raceId }
      })

      selections.value.subrace = subrace
      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select subrace'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select class
   */
  async function selectClass(cls: CharacterClass): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      // Clear existing classes first (level 1 = single class)
      // Then add the new class
      await apiFetch(`/characters/${characterId.value}/classes`, {
        method: 'POST',
        body: { class_id: cls.id }
      })

      // Fetch full class data
      const classDetail = await apiFetch<{ data: CharacterClass }>(`/classes/${cls.slug}`)
      selections.value.class = classDetail.data
      selections.value.subclass = null // Clear subclass when class changes

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select class'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select subclass
   */
  async function selectSubclass(subclass: Subclass): Promise<void> {
    if (!characterId.value || !selections.value.class) return

    isLoading.value = true
    error.value = null

    try {
      await apiFetch(
        `/characters/${characterId.value}/classes/${selections.value.class.id}/subclass`,
        {
          method: 'PUT',
          body: { subclass_id: subclass.id }
        }
      )

      selections.value.subclass = subclass
      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select subclass'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select background
   */
  async function selectBackground(background: Background): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { background_id: background.id }
      })

      // Fetch full background data
      const bgDetail = await apiFetch<{ data: Background }>(`/backgrounds/${background.slug}`)
      selections.value.background = bgDetail.data

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select background'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save ability scores
   */
  async function saveAbilityScores(
    method: AbilityMethod,
    scores: AbilityScores
  ): Promise<void> {
    if (!characterId.value) return

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

      selections.value.abilityScores = { ...scores }
      selections.value.abilityMethod = method

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save ability scores'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save character name and alignment
   */
  async function saveDetails(name: string, alignment: CharacterAlignment | null): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { name, alignment }
      })

      selections.value.name = name
      selections.value.alignment = alignment

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Save Pending Choices to Backend
  // ══════════════════════════════════════════════════════════════

  /**
   * Save proficiency choices to backend
   * Transforms pendingChoices.proficiencies Map into the API format
   */
  async function saveProficiencyChoices(): Promise<void> {
    if (!characterId.value) return
    if (pendingChoices.value.proficiencies.size === 0) return

    isLoading.value = true
    error.value = null

    try {
      // Transform Map<string, Set<number>> to API format
      // API expects: { choices: { [key]: number[] } }
      const choices: Record<string, number[]> = {}
      for (const [key, ids] of pendingChoices.value.proficiencies) {
        choices[key] = Array.from(ids)
      }

      await apiFetch(`/characters/${characterId.value}/proficiency-choices`, {
        method: 'POST',
        body: { choices }
      })

      // Clear pending choices after successful save
      pendingChoices.value.proficiencies = new Map()

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save proficiency choices'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save language choices to backend
   * Makes separate API calls for each source (race, background)
   * API expects: { source: 'race'|'background', language_ids: number[] }
   */
  async function saveLanguageChoices(): Promise<void> {
    if (!characterId.value) return
    if (pendingChoices.value.languages.size === 0) return

    isLoading.value = true
    error.value = null

    try {
      // Make separate API calls for each source
      const promises: Promise<unknown>[] = []
      for (const [source, ids] of pendingChoices.value.languages) {
        if (ids.size > 0) {
          promises.push(
            apiFetch(`/characters/${characterId.value}/language-choices`, {
              method: 'POST',
              body: {
                source,
                language_ids: Array.from(ids)
              }
            })
          )
        }
      }

      await Promise.all(promises)

      // Clear pending choices after successful save
      pendingChoices.value.languages = new Map()

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save language choices'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear existing equipment before re-saving
   * Used to avoid duplicates when saving equipment choices
   */
  async function clearExistingEquipment(): Promise<void> {
    if (!characterId.value) return

    try {
      const response = await apiFetch<{ data: Array<{ id: number }> }>(
        `/characters/${characterId.value}/equipment`
      )

      const items = response?.data ?? []
      for (const item of items) {
        await apiFetch(`/characters/${characterId.value}/equipment/${item.id}`, {
          method: 'DELETE'
        })
      }
    } catch {
      // If fetching equipment fails (e.g., no equipment yet), continue with save
    }
  }

  /**
   * Save equipment choices to backend
   * Iterates through selected equipment options and saves each item individually
   */
  async function saveEquipmentChoices(): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      // First, clear any existing equipment to avoid duplicates on re-save
      await clearExistingEquipment()

      // Combine equipment from class and background
      const allItems = [
        ...(selections.value.class?.equipment ?? []),
        ...(selections.value.background?.equipment ?? [])
      ]

      // Process choice equipment
      for (const [group, optionId] of pendingChoices.value.equipment) {
        const selectedOption = allItems.find(item => item.id === optionId)
        if (!selectedOption) continue

        // If option has choice_items, process each
        if (selectedOption.choice_items?.length) {
          for (const [index, choiceItem] of selectedOption.choice_items.entries()) {
            let itemId: number | undefined
            const quantity = choiceItem.quantity

            if (choiceItem.item) {
              // Fixed item - use directly
              itemId = choiceItem.item.id
            } else if (choiceItem.proficiency_type) {
              // Category item - get user's selection
              const key = `${group}:${selectedOption.choice_option}:${index}`
              itemId = pendingChoices.value.equipmentItems.get(key)
              if (!itemId) continue
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
          const choiceItem = item.choice_items[0]
          const choiceItemRef = choiceItem.item!
          await apiFetch(`/characters/${characterId.value}/equipment`, {
            method: 'POST',
            body: { item_id: choiceItemRef.id, quantity: choiceItem.quantity ?? item.quantity }
          })
        } else if (item.description) {
          // Flavor item - save with custom_name
          await apiFetch(`/characters/${characterId.value}/equipment`, {
            method: 'POST',
            body: { custom_name: item.description, quantity: item.quantity }
          })
        }
      }

      // Clear pending choices after successful save
      pendingChoices.value.equipment = new Map()
      pendingChoices.value.equipmentItems = new Map()

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save equipment choices'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save spell choices to backend
   * Posts each selected spell to the character's spell list
   */
  async function saveSpellChoices(): Promise<void> {
    if (!characterId.value) return
    if (pendingChoices.value.spells.size === 0) return

    isLoading.value = true
    error.value = null

    try {
      // Post all selected spells
      const spellIds = Array.from(pendingChoices.value.spells)

      // Send all spell IDs in a single request
      await apiFetch(`/characters/${characterId.value}/spells`, {
        method: 'POST',
        body: { spell_ids: spellIds }
      })

      // Clear pending choices after successful save
      pendingChoices.value.spells = new Set()

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save spell choices'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Pending Choices (Local State)
  // ══════════════════════════════════════════════════════════════

  /**
   * Toggle a proficiency selection
   */
  function toggleProficiencyChoice(key: string, id: number): void {
    const current = pendingChoices.value.proficiencies.get(key) ?? new Set()
    const updated = new Set(current)

    if (updated.has(id)) {
      updated.delete(id)
    } else {
      updated.add(id)
    }

    pendingChoices.value.proficiencies = new Map(
      pendingChoices.value.proficiencies.set(key, updated)
    )
  }

  /**
   * Toggle a language selection
   */
  function toggleLanguageChoice(source: string, id: number): void {
    const current = pendingChoices.value.languages.get(source) ?? new Set()
    const updated = new Set(current)

    if (updated.has(id)) {
      updated.delete(id)
    } else {
      updated.add(id)
    }

    pendingChoices.value.languages = new Map(
      pendingChoices.value.languages.set(source, updated)
    )
  }

  /**
   * Set equipment choice
   */
  function setEquipmentChoice(choiceGroup: string, optionId: number): void {
    pendingChoices.value.equipment = new Map(
      pendingChoices.value.equipment.set(choiceGroup, optionId)
    )
  }

  /**
   * Toggle spell selection
   */
  function toggleSpellChoice(spellId: number): void {
    const updated = new Set(pendingChoices.value.spells)
    if (updated.has(spellId)) {
      updated.delete(spellId)
    } else {
      updated.add(spellId)
    }
    pendingChoices.value.spells = updated
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Source Selection
  // ══════════════════════════════════════════════════════════════

  /**
   * Set selected sourcebooks
   */
  function setSelectedSources(sources: string[]): void {
    selectedSources.value = sources
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Reset
  // ══════════════════════════════════════════════════════════════

  /**
   * Reset all wizard state
   */
  function reset(): void {
    characterId.value = null
    selectedSources.value = []
    selections.value = defaultSelections()
    pendingChoices.value = defaultPendingChoices()
    stats.value = null
    summary.value = null
    isLoading.value = false
    error.value = null
  }

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // State
    characterId,
    selectedSources,
    selections,
    pendingChoices,
    stats,
    summary,
    isLoading,
    error,

    // Computed: Step visibility
    needsSubraceStep,
    isSubraceRequired,
    needsSubclassStep,
    isSpellcaster,
    hasProficiencyChoices,
    hasLanguageChoices,
    isComplete,

    // Computed: Filtering
    sourceFilterString,

    // Computed: Derived
    effectiveRace,
    racialBonuses,

    // Actions: Backend sync
    syncWithBackend,

    // Actions: Selections
    selectRace,
    selectSubrace,
    selectClass,
    selectSubclass,
    selectBackground,
    saveAbilityScores,
    saveDetails,

    // Actions: Pending choices (local state)
    toggleProficiencyChoice,
    toggleLanguageChoice,
    setEquipmentChoice,
    toggleSpellChoice,

    // Actions: Save pending choices to backend
    saveProficiencyChoices,
    saveLanguageChoices,
    saveEquipmentChoices,
    saveSpellChoices,

    // Actions: Sources
    setSelectedSources,

    // Actions: Reset
    reset
  }
})

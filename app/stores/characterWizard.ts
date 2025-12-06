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

// Note: PendingChoices interface removed - choices are now managed by useUnifiedChoices composable

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

// Note: defaultPendingChoices removed - choices are now managed by useUnifiedChoices composable

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

  // Note: pendingChoices removed - choices are now managed by useUnifiedChoices composable

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
   * If character already has a class, uses PUT to replace it.
   * If no class exists, uses POST to add it.
   */
  async function selectClass(cls: CharacterClass): Promise<void> {
    if (!characterId.value) return

    // Skip if selecting the same class (user went back and clicked same option)
    if (selections.value.class?.id === cls.id) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      if (selections.value.class) {
        // Replace existing class using PUT endpoint
        await apiFetch(`/characters/${characterId.value}/classes/${selections.value.class.id}`, {
          method: 'PUT',
          body: { class_id: cls.id }
        })
      } else {
        // Add new class using POST endpoint
        await apiFetch(`/characters/${characterId.value}/classes`, {
          method: 'POST',
          body: { class_id: cls.id }
        })
      }

      // Fetch full class data
      const classDetail = await apiFetch<{ data: CharacterClass }>(`/classes/${cls.slug}`)
      selections.value.class = classDetail.data
      selections.value.subclass = null // Clear subclass when class changes

      // Note: Pending choices are now managed by useUnifiedChoices composable
      // Backend automatically regenerates choices when class changes

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

  // Note: Save pending choices methods removed - choices are now managed by useUnifiedChoices composable
  // The following methods were removed:
  // - saveProficiencyChoices, saveLanguageChoices, saveEquipmentChoices, saveSpellChoices
  // - toggleProficiencyChoice, toggleLanguageChoice, setEquipmentChoice, toggleSpellChoice
  // - clearExistingEquipment

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
    // Note: pendingChoices removed - choices are managed by useUnifiedChoices composable
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
    // Note: pendingChoices removed - choices managed by useUnifiedChoices composable
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

    // Note: Pending choice actions removed - use useUnifiedChoices composable instead
    // Removed: toggleProficiencyChoice, toggleLanguageChoice, setEquipmentChoice, toggleSpellChoice
    // Removed: saveProficiencyChoices, saveLanguageChoices, saveEquipmentChoices, saveSpellChoices

    // Actions: Sources
    setSelectedSources,

    // Actions: Reset
    reset
  }
})

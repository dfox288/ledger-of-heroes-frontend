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
import { logger } from '~/utils/logger'
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
  /** Full slug for API references (e.g., "phb:evoker") - see #318 */
  full_slug: string
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
    feats: number
    size: number
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
  const { generateSlug } = useCharacterSlug()

  // ══════════════════════════════════════════════════════════════
  // HELPERS: Character Creation
  // ══════════════════════════════════════════════════════════════

  /**
   * Create a character with retry logic for public_id collisions
   *
   * Generates a public_id client-side and sends it to the backend.
   * If collision occurs (422), regenerates and retries up to 3 times.
   *
   * @param name - Character name
   * @param raceSlug - Full slug for race (e.g., "phb:human") - see #318
   */
  async function createCharacterWithRetry(
    name: string,
    raceSlug: string,
    maxRetries = 3
  ): Promise<{ id: number, public_id: string }> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const newPublicId = generateSlug()

      try {
        const response = await apiFetch<{ data: { id: number, public_id: string } }>('/characters', {
          method: 'POST',
          body: {
            public_id: newPublicId,
            name,
            race_slug: raceSlug
          }
        })
        return response.data
      } catch (err: unknown) {
        // Check if it's a collision error (422 with public_id error)
        const isCollision = err instanceof Error
          && 'status' in err
          && (err as { status: number }).status === 422
          && err.message.includes('public_id')

        if (isCollision && attempt < maxRetries - 1) {
          // Collision detected, retry with new public_id
          logger.warn(`public_id collision on attempt ${attempt + 1}, retrying...`)
          lastError = err as Error
          continue
        }

        throw err
      }
    }

    throw lastError || new Error('Failed to create character after max retries')
  }

  // ══════════════════════════════════════════════════════════════
  // CHARACTER IDENTITY
  // ══════════════════════════════════════════════════════════════

  /** Character ID - null until first save (on race selection) */
  const characterId = ref<number | null>(null)

  /**
   * Public ID for URL-safe character identification
   * Format: {adjective}-{noun}-{suffix} (e.g., "shadow-warden-q3x9")
   * Generated client-side, sent to backend on creation
   */
  const publicId = ref<string | null>(null)

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
   * Does this character have feat choices (pending or resolved)?
   * Returns true if:
   * 1. Race grants bonus feat (Variant Human, Custom Lineage) - always show step
   * 2. There are pending feat choices from other sources (ASI, etc.)
   */
  const hasFeatChoices = computed(() => {
    // Always show feats step if race grants bonus feat (even if already selected)
    if (raceGrantsBonusFeat.value) return true

    // Fall back to checking pending feats count
    if (!summary.value) return false
    return (summary.value.pending_choices.feats ?? 0) > 0
  })

  /**
   * Does this character have size choices to make?
   * True for races like Custom Lineage that allow choosing Small or Medium
   */
  const hasSizeChoices = computed(() => {
    if (!summary.value) return false
    return (summary.value.pending_choices.size ?? 0) > 0
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

  /**
   * Does the effective race grant a bonus feat?
   * Used to determine if feats step should be shown (even if feat already selected)
   */
  const raceGrantsBonusFeat = computed(() => {
    const race = effectiveRace.value
    if (!race?.modifiers) return false
    return race.modifiers.some(m => m.modifier_category === 'bonus_feat')
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
      logger.error('Failed to sync with backend:', err)
      // Don't throw - UI should still work with stale data
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Selection Updates
  // ══════════════════════════════════════════════════════════════

  /**
   * Select or create character with race
   * This is the first save point - creates the character draft
   *
   * Note: Uses full_slug for API requests (see #318)
   */
  async function selectRace(race: Race): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Use full_slug if available, fall back to slug for base races without full_slug (#318)
      const raceSlug = race.full_slug ?? race.slug
      if (!raceSlug) {
        throw new Error('Race missing slug - cannot save')
      }

      if (!characterId.value) {
        // First save - create character with race and public_id
        // Provide a default name that can be changed later in Details step
        const defaultName = selections.value.name || `New ${race.name}`

        // Generate public_id with collision retry, using race_slug (#318)
        const response = await createCharacterWithRetry(defaultName, raceSlug)
        characterId.value = response.id
        publicId.value = response.public_id

        // Store the default name in selections
        if (!selections.value.name) {
          selections.value.name = defaultName
        }
      } else {
        // Update existing character using race_slug (#318)
        await apiFetch(`/characters/${characterId.value}`, {
          method: 'PATCH',
          body: { race_slug: raceSlug }
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
   *
   * Note: Uses full_slug for API requests (see #318)
   */
  async function selectSubrace(subrace: Race | null): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      // Use subrace's slug if selected, otherwise fall back to base race's slug (#318)
      // Prefer full_slug when available, fall back to slug for base races without full_slug
      const raceSlug = subrace?.full_slug ?? subrace?.slug ?? selections.value.race?.full_slug ?? selections.value.race?.slug
      if (!raceSlug) throw new Error('No race selected or race missing slug')

      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { race_slug: raceSlug }
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
   *
   * Note: Uses full_slug for API requests (see #318)
   */
  async function selectClass(cls: CharacterClass): Promise<void> {
    if (!characterId.value) return

    // Skip if selecting the same class (user went back and clicked same option)
    if (selections.value.class?.full_slug === cls.full_slug) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Class must have full_slug for slug-based references (#318)
      const newClassSlug = cls.full_slug
      if (!newClassSlug) {
        throw new Error('Class missing full_slug - cannot save')
      }

      if (selections.value.class?.full_slug) {
        // Replace existing class using PUT endpoint
        // URL uses current class full_slug, body contains new class_slug (#318)
        const currentClassSlug = selections.value.class.full_slug
        await apiFetch(`/characters/${characterId.value}/classes/${currentClassSlug}`, {
          method: 'PUT',
          body: { class_slug: newClassSlug }
        })
      } else {
        // Add new class using POST endpoint with class_slug (#318)
        // force: true skips multiclass prereq checks (this is initial class, not multiclass)
        await apiFetch(`/characters/${characterId.value}/classes`, {
          method: 'POST',
          body: { class_slug: newClassSlug, force: true }
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
   *
   * Note: Uses full_slug for API requests (see #318)
   */
  async function selectSubclass(subclass: Subclass): Promise<void> {
    if (!characterId.value || !selections.value.class?.full_slug) return

    // Validate full_slug exists (required for API - see #318)
    if (!subclass.full_slug) {
      throw new Error('Subclass missing full_slug - cannot save')
    }

    isLoading.value = true
    error.value = null

    try {
      // URL uses class full_slug, body uses subclass_slug (#318)
      await apiFetch(
        `/characters/${characterId.value}/classes/${selections.value.class.full_slug}/subclass`,
        {
          method: 'PUT',
          body: { subclass_slug: subclass.full_slug }
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
   *
   * Note: Uses full_slug for API requests (see #318)
   */
  async function selectBackground(background: Background): Promise<void> {
    if (!characterId.value) return

    isLoading.value = true
    error.value = null

    try {
      // Background must have full_slug for slug-based references (#318)
      const backgroundSlug = background.full_slug
      if (!backgroundSlug) {
        throw new Error('Background missing full_slug - cannot save')
      }

      await apiFetch(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: { background_slug: backgroundSlug }
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
  // ACTIONS: Load Character
  // ══════════════════════════════════════════════════════════════

  /**
   * Load an existing character by publicId (for page refresh/navigation)
   *
   * Called when navigating to a wizard step URL with a publicId.
   * Fetches the character data and then fetches FULL entity details
   * (race, class, background) to restore equipment, proficiencies, etc.
   */
  async function loadCharacter(charPublicId: string): Promise<void> {
    // Skip if already loaded
    if (publicId.value === charPublicId && characterId.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Fetch character data by publicId (backend accepts both id and public_id)
      const response = await apiFetch<{
        data: {
          id: number
          public_id: string
          name: string
          alignment?: CharacterAlignment
          race?: { slug: string, full_slug?: string }
          background?: { slug: string, full_slug?: string }
          class?: { slug: string, full_slug?: string }
          classes?: Array<{ subclass?: { id: number, name: string, slug: string, full_slug?: string } }>
          ability_score_method?: AbilityMethod
          ability_scores?: {
            STR: number | null
            DEX: number | null
            CON: number | null
            INT: number | null
            WIS: number | null
            CHA: number | null
          }
        }
      }>(`/characters/${charPublicId}`)

      characterId.value = response.data.id
      publicId.value = response.data.public_id

      // Populate name from character data
      if (response.data.name) {
        selections.value.name = response.data.name
      }

      // Restore alignment
      if (response.data.alignment) {
        selections.value.alignment = response.data.alignment
      }

      // Restore ability score method
      if (response.data.ability_score_method) {
        selections.value.abilityMethod = response.data.ability_score_method
      }

      // Restore ability scores (map API format STR/DEX to store format strength/dexterity)
      if (response.data.ability_scores) {
        const scores = response.data.ability_scores
        selections.value.abilityScores = {
          strength: scores.STR ?? 10,
          dexterity: scores.DEX ?? 10,
          constitution: scores.CON ?? 10,
          intelligence: scores.INT ?? 10,
          wisdom: scores.WIS ?? 10,
          charisma: scores.CHA ?? 10
        }
      }

      // Fetch FULL entity details in parallel for equipment, proficiencies, etc.
      // The character endpoint returns lightweight data; we need full details.
      const fetchPromises: Promise<void>[] = []

      if (response.data.race?.slug) {
        fetchPromises.push(
          apiFetch<{ data: Race }>(`/races/${response.data.race.slug}`)
            .then((raceRes) => {
              selections.value.race = raceRes.data
            })
        )
      }

      if (response.data.class?.slug) {
        fetchPromises.push(
          apiFetch<{ data: CharacterClass }>(`/classes/${response.data.class.slug}`)
            .then((classRes) => {
              selections.value.class = classRes.data
            })
        )
      }

      if (response.data.background?.slug) {
        fetchPromises.push(
          apiFetch<{ data: Background }>(`/backgrounds/${response.data.background.slug}`)
            .then((bgRes) => {
              selections.value.background = bgRes.data
            })
        )
      }

      // Wait for all entity fetches to complete
      await Promise.all(fetchPromises)

      // Restore subclass from classes array (first entry is primary class)
      const apiSubclass = response.data.classes?.[0]?.subclass
      if (apiSubclass) {
        selections.value.subclass = {
          id: apiSubclass.id,
          name: apiSubclass.name,
          slug: apiSubclass.slug,
          full_slug: apiSubclass.full_slug ?? apiSubclass.slug
        }
      }

      await syncWithBackend()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load character'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIONS: Reset
  // ══════════════════════════════════════════════════════════════

  /**
   * Reset all wizard state
   */
  function reset(): void {
    characterId.value = null
    publicId.value = null
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
    publicId,
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
    hasFeatChoices,
    hasSizeChoices,
    isComplete,

    // Computed: Filtering
    sourceFilterString,

    // Computed: Derived
    effectiveRace,
    racialBonuses,
    raceGrantsBonusFeat,

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

    // Actions: Load/Reset
    loadCharacter,
    reset
  }
})

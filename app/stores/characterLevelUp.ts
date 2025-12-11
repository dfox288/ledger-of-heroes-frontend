// app/stores/characterLevelUp.ts
/**
 * Level-Up Wizard Store
 *
 * Manages state for the level-up modal wizard.
 * Separate from characterWizard store because:
 * 1. Different lifecycle (modal vs. page)
 * 2. Cleaner separation of concerns
 * 3. Level-up has unique data (LevelUpResult, selected class for multiclass)
 */
import { defineStore } from 'pinia'
import type { LevelUpResult } from '~/types/character'
import type { CharacterClass } from '~/types'
import type { components } from '~/types/api/generated'
import { logger } from '~/utils/logger'

type PendingChoice = components['schemas']['PendingChoiceResource']

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface CharacterClassEntry {
  class: CharacterClass | null
  level: number
  subclass?: { name: string, slug: string } | null
  is_primary: boolean
}

// ════════════════════════════════════════════════════════════════
// STORE
// ════════════════════════════════════════════════════════════════

export const useCharacterLevelUpStore = defineStore('characterLevelUp', () => {
  const { apiFetch } = useApi()

  // ══════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════

  /** Character being leveled up */
  const characterId = ref<number | null>(null)
  const publicId = ref<string | null>(null)

  /** Is the wizard modal open? */
  const isOpen = ref(false)

  /** Result from level-up API call */
  const levelUpResult = ref<LevelUpResult | null>(null)

  /** Class selected for level-up (for multiclass scenarios) */
  const selectedClassSlug = ref<string | null>(null)

  /** Character's current classes (for multiclass selection) */
  const characterClasses = ref<CharacterClassEntry[]>([])

  /** Character's total level */
  const totalLevel = ref<number>(0)

  /** Pending choices for this level-up */
  const pendingChoices = ref<PendingChoice[]>([])

  /** Loading state */
  const isLoading = ref(false)

  /** Error state */
  const error = ref<string | null>(null)

  // ══════════════════════════════════════════════════════════════
  // COMPUTED
  // ══════════════════════════════════════════════════════════════

  /** Is this a multiclass character? */
  const isMulticlass = computed(() => characterClasses.value.length > 1)

  /** Is this the first opportunity to multiclass (level 1 -> 2)? */
  const isFirstMulticlassOpportunity = computed(() => totalLevel.value === 1)

  /** Should we show class selection step? */
  const needsClassSelection = computed(() =>
    isMulticlass.value || isFirstMulticlassOpportunity.value
  )

  /** Is level-up complete (all choices resolved)? */
  const isComplete = computed(() => {
    if (!levelUpResult.value) return false
    return !levelUpResult.value.hp_choice_pending && !levelUpResult.value.asi_pending
  })

  /** Does character have pending subclass choice? */
  const hasSubclassChoice = computed(() =>
    pendingChoices.value.some(c => c.type === 'subclass')
  )

  /** Does character have pending spell choices? */
  const hasSpellChoices = computed(() =>
    pendingChoices.value.some(c => c.type === 'spell')
  )

  /** Does character have pending feature choices (fighting_style, expertise, optional_feature)? */
  const hasFeatureChoices = computed(() =>
    pendingChoices.value.some(c =>
      ['fighting_style', 'expertise', 'optional_feature'].includes(c.type)
    )
  )

  /** Does character have pending language choices? */
  const hasLanguageChoices = computed(() =>
    pendingChoices.value.some(c => c.type === 'language')
  )

  /** Does character have pending proficiency choices? */
  const hasProficiencyChoices = computed(() =>
    pendingChoices.value.some(c => c.type === 'proficiency')
  )

  /** Is a level-up in progress? (API called, awaiting choices) */
  const isLevelUpInProgress = computed(() => levelUpResult.value !== null)

  // ══════════════════════════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════════════════════════

  /**
   * Open the level-up wizard for a character
   */
  function openWizard(
    charId: number,
    charPublicId: string,
    classes: CharacterClassEntry[] = [],
    level: number = 1
  ) {
    characterId.value = charId
    publicId.value = charPublicId
    characterClasses.value = classes
    totalLevel.value = level
    levelUpResult.value = null
    selectedClassSlug.value = null
    error.value = null
    isOpen.value = true
  }

  /**
   * Close the wizard (but preserve state for potential reopening)
   */
  function closeWizard() {
    isOpen.value = false
  }

  /**
   * Trigger level-up for a class
   */
  async function levelUp(classSlug: string): Promise<LevelUpResult> {
    if (!characterId.value) throw new Error('No character selected')

    isLoading.value = true
    error.value = null

    try {
      const response = await apiFetch<{ data: LevelUpResult }>(
        `/characters/${publicId.value}/classes/${classSlug}/level-up`,
        { method: 'POST' }
      )

      // API returns { data: { ... } }, extract the inner data
      levelUpResult.value = response.data
      selectedClassSlug.value = classSlug

      // Fetch pending choices after successful level-up
      await fetchPendingChoices()

      return response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to level up'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch pending choices for the character
   * Called after level-up and after each choice is resolved
   */
  async function fetchPendingChoices(): Promise<void> {
    if (!publicId.value) return

    try {
      const response = await apiFetch<{ data: { choices: PendingChoice[], summary: unknown } }>(
        `/characters/${publicId.value}/pending-choices`
      )
      // API returns { data: { choices: [...], summary: {...} } }
      pendingChoices.value = response.data?.choices ?? []
    } catch (e) {
      // Don't fail silently - log but don't throw
      logger.error('Failed to fetch pending choices:', e)
    }
  }

  /**
   * Refresh choices - alias for fetchPendingChoices
   * Used after completing a step to update visibility of downstream steps
   */
  async function refreshChoices(): Promise<void> {
    await fetchPendingChoices()
  }

  /**
   * Reset all wizard state
   */
  function reset() {
    characterId.value = null
    publicId.value = null
    characterClasses.value = []
    totalLevel.value = 0
    isOpen.value = false
    levelUpResult.value = null
    selectedClassSlug.value = null
    pendingChoices.value = []
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
    isOpen,
    levelUpResult,
    selectedClassSlug,
    characterClasses,
    totalLevel,
    pendingChoices,
    isLoading,
    error,

    // Computed
    isMulticlass,
    isFirstMulticlassOpportunity,
    needsClassSelection,
    isComplete,
    hasSubclassChoice,
    hasSpellChoices,
    hasFeatureChoices,
    hasLanguageChoices,
    hasProficiencyChoices,
    isLevelUpInProgress,

    // Actions
    openWizard,
    closeWizard,
    levelUp,
    reset,
    fetchPendingChoices,
    refreshChoices
  }
})

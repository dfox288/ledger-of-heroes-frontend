// app/composables/useWizardChoiceSelection.ts
import type { ComputedRef, Ref } from 'vue'
import type { components } from '~/types/api/generated'
import { normalizeEndpoint } from '~/composables/useApi'
import { logger } from '~/utils/logger'

type PendingChoice = components['schemas']['PendingChoiceResource']

/**
 * Display option returned by getDisplayOptions
 */
export interface DisplayOption {
  id: string
  name: string
  description?: string
}

/**
 * Configuration for the choice selection composable
 */
export interface ChoiceSelectionConfig {
  /** Function to resolve a choice (from useUnifiedChoices) */
  resolveChoice: (choiceId: string, payload: { selected: string[] }) => Promise<void>

  /** IDs already granted (e.g., racial languages) - disabled in selection */
  alreadyGrantedIds?: ComputedRef<Set<string>>
}

/**
 * Return type for the choice selection composable
 */
export interface ChoiceSelectionReturn {
  // State
  localSelections: Ref<Map<string, Set<string>>>
  isSaving: Ref<boolean>

  // Selection helpers
  getSelectedCount: (choiceId: string) => number
  isOptionSelected: (choiceId: string, optionId: string) => boolean
  isOptionDisabled: (choiceId: string, optionId: string) => boolean
  getDisabledReason: (choiceId: string, optionId: string) => string | null

  // Validation
  allComplete: ComputedRef<boolean>

  // Actions
  handleToggle: (choice: PendingChoice, optionId: string) => void
  saveAllChoices: () => Promise<void>

  // Dynamic options fetching
  fetchOptionsIfNeeded: (choice: PendingChoice) => Promise<void>
  getDisplayOptions: (choice: PendingChoice) => DisplayOption[]
  isOptionsLoading: (choice: PendingChoice) => boolean
}

/**
 * Composable for choice selection in wizard steps
 *
 * Consolidates the common pattern used by StepProficiencies, StepLanguages,
 * StepSpells, and StepFeats:
 * - Local selection state management via Map<choiceId, Set<optionId>>
 * - Cross-choice validation (prevents selecting same option in multiple choices)
 * - Already-granted validation (prevents selecting options already known)
 * - Quantity limit enforcement
 * - Save flow with resolveChoice calls
 * - Dynamic options fetching from options_endpoint
 *
 * @param choices - Computed ref containing the pending choices to select from
 * @param config - Configuration including resolveChoice and optional alreadyGrantedIds
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * // Component fetches choices via useUnifiedChoices
 * const { choicesByType, resolveChoice } = useUnifiedChoices(characterId)
 *
 * // Composable handles selection logic
 * const {
 *   localSelections,
 *   isSaving,
 *   getSelectedCount,
 *   isOptionSelected,
 *   isOptionDisabled,
 *   getDisabledReason,
 *   allComplete,
 *   handleToggle,
 *   saveAllChoices
 * } = useWizardChoiceSelection(
 *   computed(() => choicesByType.value.languages),
 *   { resolveChoice, alreadyGrantedIds: knownLanguageIds }
 * )
 *
 * // Component handles navigation
 * async function handleContinue() {
 *   await saveAllChoices()
 *   nextStep()
 * }
 * </script>
 * ```
 */
export function useWizardChoiceSelection(
  choices: ComputedRef<PendingChoice[]>,
  config: ChoiceSelectionConfig
): ChoiceSelectionReturn {
  const { resolveChoice, alreadyGrantedIds } = config
  const { apiFetch } = useApi()

  // ═══════════════════════════════════════════════════════════════════════════
  // State
  // ═══════════════════════════════════════════════════════════════════════════

  // Local selections: Map<choiceId, Set<optionId>>
  const localSelections = ref<Map<string, Set<string>>>(new Map())
  const isSaving = ref(false)

  // Options cache for dynamic endpoints
  const optionsCache = ref<Map<string, unknown[]>>(new Map())
  const loadingOptions = ref<Set<string>>(new Set())

  // ═══════════════════════════════════════════════════════════════════════════
  // Initialize from existing selections
  // ═══════════════════════════════════════════════════════════════════════════

  // Watch for choices changes and initialize localSelections from already-selected
  watch(choices, (newChoices) => {
    for (const choice of newChoices) {
      if (!localSelections.value.has(choice.id) && choice.selected.length > 0) {
        const selected = new Set<string>()
        for (const slug of choice.selected) {
          selected.add(String(slug))
        }
        localSelections.value.set(choice.id, selected)
      }
    }
  }, { immediate: true })

  // ═══════════════════════════════════════════════════════════════════════════
  // Selection helpers
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get the number of options selected for a choice
   */
  function getSelectedCount(choiceId: string): number {
    return localSelections.value.get(choiceId)?.size ?? 0
  }

  /**
   * Check if an option is selected in a specific choice
   */
  function isOptionSelected(choiceId: string, optionId: string): boolean {
    return localSelections.value.get(choiceId)?.has(optionId) ?? false
  }

  /**
   * Check if an option is selected in any OTHER choice (cross-choice conflict)
   */
  function isSelectedElsewhere(choiceId: string, optionId: string): boolean {
    for (const [otherChoiceId, selectedOptions] of localSelections.value.entries()) {
      if (otherChoiceId !== choiceId && selectedOptions.has(optionId)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if an option is already granted (from alreadyGrantedIds)
   */
  function isAlreadyGranted(optionId: string): boolean {
    return alreadyGrantedIds?.value.has(optionId) ?? false
  }

  /**
   * Check if an option should be disabled
   */
  function isOptionDisabled(choiceId: string, optionId: string): boolean {
    return isAlreadyGranted(optionId) || isSelectedElsewhere(choiceId, optionId)
  }

  /**
   * Get the reason why an option is disabled
   */
  function getDisabledReason(choiceId: string, optionId: string): string | null {
    if (isAlreadyGranted(optionId)) {
      return 'Already known'
    }
    if (isSelectedElsewhere(choiceId, optionId)) {
      return 'Already selected in another choice'
    }
    return null
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Toggle handler
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Toggle an option selection
   * Respects quantity limits and disabled state
   */
  function handleToggle(choice: PendingChoice, optionId: string): void {
    const current = localSelections.value.get(choice.id) ?? new Set<string>()
    const isSelected = current.has(optionId)

    // Don't allow selecting disabled options
    if (!isSelected && isOptionDisabled(choice.id, optionId)) {
      return
    }

    // Don't allow selecting more than quantity (unless deselecting)
    if (!isSelected && current.size >= choice.quantity) {
      return
    }

    // Toggle the selection
    const updated = new Set(current)
    if (updated.has(optionId)) {
      updated.delete(optionId)
    } else {
      updated.add(optionId)
    }

    localSelections.value.set(choice.id, updated)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Validation
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if all choices are complete (all have required quantity selected)
   */
  const allComplete = computed(() => {
    for (const choice of choices.value) {
      const selectedCount = getSelectedCount(choice.id)
      const alreadySelected = choice.selected.length

      // A choice initialized from already-selected has those in localSelections,
      // but we also need to handle the case where the choice was partially selected
      // before and we need to add more
      if (selectedCount < choice.quantity) {
        return false
      }
    }
    return true
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // Save
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save all choices that have selections
   */
  async function saveAllChoices(): Promise<void> {
    isSaving.value = true

    try {
      for (const [choiceId, selectedOptions] of localSelections.value.entries()) {
        if (selectedOptions.size === 0) continue

        // Find the choice to check if selections changed
        const choice = choices.value.find(c => c.id === choiceId)
        if (!choice) continue

        // Only resolve if there are changes from what's already selected
        const currentSelected = new Set(choice.selected.map(String))
        const hasChanges = selectedOptions.size !== currentSelected.size
          || [...selectedOptions].some(id => !currentSelected.has(id))

        if (hasChanges) {
          await resolveChoice(choiceId, {
            selected: Array.from(selectedOptions)
          })
        }
      }
    } finally {
      isSaving.value = false
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Dynamic options fetching
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Fetch options from endpoint if needed
   */
  async function fetchOptionsIfNeeded(choice: PendingChoice): Promise<void> {
    // If options are already provided, no need to fetch
    if (choice.options && choice.options.length > 0) return

    // If no endpoint provided, nothing to fetch
    if (!choice.options_endpoint) return

    // Check cache
    if (optionsCache.value.has(choice.id)) return

    // Already loading
    if (loadingOptions.value.has(choice.id)) return

    loadingOptions.value.add(choice.id)

    try {
      // Normalize endpoint: backend returns /api/v1/... but Nitro expects /...
      const endpoint = normalizeEndpoint(choice.options_endpoint)
      const response = await apiFetch<{ data: unknown[] }>(endpoint)
      if (response?.data) {
        optionsCache.value.set(choice.id, response.data)
      }
    } catch (err) {
      logger.warn(`Failed to fetch options for choice ${choice.id}:`, err)
    } finally {
      loadingOptions.value.delete(choice.id)
    }
  }

  /**
   * Get effective options (from choice or cache)
   */
  function getEffectiveOptions(choice: PendingChoice): unknown[] {
    if (choice.options && choice.options.length > 0) {
      return choice.options
    }
    return optionsCache.value.get(choice.id) ?? []
  }

  /**
   * Get display options for a choice
   */
  function getDisplayOptions(choice: PendingChoice): DisplayOption[] {
    const options = getEffectiveOptions(choice)
    return options.map((rawOpt: unknown) => {
      const opt = rawOpt as Record<string, unknown>

      // Handle nested skill options (from endpoint fetch)
      if (opt.skill) {
        const skill = opt.skill as { slug: string, name: string }
        return { id: skill.slug, name: skill.name }
      }

      // Handle nested proficiency_type options (from endpoint fetch)
      if (opt.proficiency_type) {
        const profType = opt.proficiency_type as { slug: string, name: string }
        return { id: profType.slug, name: profType.name }
      }

      // Handle flat options from API - slug contains source-prefixed value (#506)
      const slug = opt.slug as string
      return {
        id: slug,
        name: (opt.name as string) ?? 'Unknown',
        description: opt.description as string | undefined
      }
    })
  }

  /**
   * Check if options are currently being fetched for a choice
   */
  function isOptionsLoading(choice: PendingChoice): boolean {
    return loadingOptions.value.has(choice.id)
  }

  return {
    // State
    localSelections,
    isSaving,

    // Selection helpers
    getSelectedCount,
    isOptionSelected,
    isOptionDisabled,
    getDisabledReason,

    // Validation
    allComplete,

    // Actions
    handleToggle,
    saveAllChoices,

    // Dynamic options fetching
    fetchOptionsIfNeeded,
    getDisplayOptions,
    isOptionsLoading
  }
}

// app/composables/useWizardNavigation.ts
/**
 * Base Wizard Navigation Composable
 *
 * Shared navigation logic for both character creation and level-up wizards.
 * Handles step progression, progress tracking, and navigation with skip logic.
 *
 * @see Issue #625 - Wizard consolidation
 */

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface WizardStep {
  name: string
  label: string
  icon: string
  visible: () => boolean
  /**
   * Optional function to determine if this step should be auto-skipped during navigation.
   * Use this for steps that are always visible but may have no choices to make.
   */
  shouldSkip?: () => boolean
}

export interface UseWizardNavigationOptions {
  /** Full step registry with visibility functions */
  stepRegistry: WizardStep[]
  /** Current step name (reactive) */
  currentStepName: ComputedRef<string>
  /** Function to build URL for a step */
  getStepUrl: (stepName: string) => string
}

// ════════════════════════════════════════════════════════════════
// COMPOSABLE
// ════════════════════════════════════════════════════════════════

export function useWizardNavigation(options: UseWizardNavigationOptions) {
  const { stepRegistry, currentStepName, getStepUrl } = options

  // ══════════════════════════════════════════════════════════════
  // COMPUTED: Active Steps
  // ══════════════════════════════════════════════════════════════

  /**
   * Only visible steps (filtered by visibility functions)
   */
  const activeSteps = computed(() =>
    stepRegistry.filter(step => step.visible())
  )

  /**
   * Current step index within active steps
   */
  const currentStepIndex = computed(() =>
    activeSteps.value.findIndex(s => s.name === currentStepName.value)
  )

  /**
   * Current step object
   */
  const currentStep = computed(() =>
    activeSteps.value[currentStepIndex.value] ?? null
  )

  /**
   * Total number of visible steps
   */
  const totalSteps = computed(() =>
    activeSteps.value.length
  )

  /**
   * Is this the first step?
   */
  const isFirstStep = computed(() =>
    currentStepIndex.value === 0
  )

  /**
   * Is this the last step?
   */
  const isLastStep = computed(() =>
    currentStepIndex.value === totalSteps.value - 1
  )

  /**
   * Progress percentage (0-100)
   */
  const progressPercent = computed(() => {
    if (totalSteps.value <= 1) return 100
    return Math.round((currentStepIndex.value / (totalSteps.value - 1)) * 100)
  })

  // ══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ══════════════════════════════════════════════════════════════

  /**
   * Navigate to next step, skipping any steps that should be skipped
   */
  async function nextStep(): Promise<void> {
    let nextIndex = currentStepIndex.value + 1

    while (nextIndex < activeSteps.value.length) {
      const next = activeSteps.value[nextIndex]
      if (next && !next.shouldSkip?.()) {
        await navigateTo(getStepUrl(next.name))
        return
      }
      nextIndex++
    }
  }

  /**
   * Navigate to previous step, skipping any steps that should be skipped
   */
  async function previousStep(): Promise<void> {
    let prevIndex = currentStepIndex.value - 1

    while (prevIndex >= 0) {
      const prev = activeSteps.value[prevIndex]
      if (prev && !prev.shouldSkip?.()) {
        await navigateTo(getStepUrl(prev.name))
        return
      }
      prevIndex--
    }
  }

  /**
   * Navigate to specific step by name
   */
  async function goToStep(stepName: string): Promise<void> {
    const step = activeSteps.value.find(s => s.name === stepName)
    if (step) {
      await navigateTo(getStepUrl(stepName))
    }
  }

  /**
   * Get the next step (without navigating), respecting shouldSkip
   */
  const nextStepInfo = computed(() => {
    let nextIndex = currentStepIndex.value + 1
    while (nextIndex < activeSteps.value.length) {
      const next = activeSteps.value[nextIndex]
      if (next && !next.shouldSkip?.()) {
        return next
      }
      nextIndex++
    }
    return null
  })

  /**
   * Get the previous step (without navigating), respecting shouldSkip
   */
  const previousStepInfo = computed(() => {
    let prevIndex = currentStepIndex.value - 1
    while (prevIndex >= 0) {
      const prev = activeSteps.value[prevIndex]
      if (prev && !prev.shouldSkip?.()) {
        return prev
      }
      prevIndex--
    }
    return null
  })

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // Step registry
    stepRegistry,
    activeSteps,

    // Current step
    currentStep,
    currentStepName,
    currentStepIndex,

    // Progress
    totalSteps,
    progressPercent,
    isFirstStep,
    isLastStep,

    // Navigation
    nextStep,
    previousStep,
    goToStep,
    getStepUrl,
    nextStepInfo,
    previousStepInfo
  }
}

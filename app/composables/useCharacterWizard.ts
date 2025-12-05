// app/composables/useCharacterWizard.ts
/**
 * Character Wizard Navigation Composable
 *
 * Manages wizard step navigation, visibility, and validation.
 * Uses URL as source of truth for current step.
 */
import { useCharacterWizardStore } from '~/stores/characterWizard'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface WizardStep {
  name: string
  label: string
  icon: string
  visible: () => boolean
}

// ════════════════════════════════════════════════════════════════
// STEP REGISTRY
// ════════════════════════════════════════════════════════════════

/**
 * Create the step registry with visibility functions
 * Must be called inside a composable/component context for store access
 */
function createStepRegistry(store: ReturnType<typeof useCharacterWizardStore>): WizardStep[] {
  return [
    {
      name: 'sourcebooks',
      label: 'Sources',
      icon: 'i-heroicons-book-open',
      visible: () => true,
    },
    {
      name: 'race',
      label: 'Race',
      icon: 'i-heroicons-globe-alt',
      visible: () => true,
    },
    {
      name: 'subrace',
      label: 'Subrace',
      icon: 'i-heroicons-sparkles',
      visible: () => store.needsSubraceStep,
    },
    {
      name: 'class',
      label: 'Class',
      icon: 'i-heroicons-shield-check',
      visible: () => true,
    },
    {
      name: 'subclass',
      label: 'Subclass',
      icon: 'i-heroicons-star',
      visible: () => store.needsSubclassStep,
    },
    {
      name: 'background',
      label: 'Background',
      icon: 'i-heroicons-book-open',
      visible: () => true,
    },
    {
      name: 'abilities',
      label: 'Abilities',
      icon: 'i-heroicons-chart-bar',
      visible: () => true,
    },
    {
      name: 'proficiencies',
      label: 'Skills',
      icon: 'i-heroicons-academic-cap',
      visible: () => store.hasProficiencyChoices,
    },
    {
      name: 'languages',
      label: 'Languages',
      icon: 'i-heroicons-language',
      visible: () => store.hasLanguageChoices,
    },
    {
      name: 'equipment',
      label: 'Equipment',
      icon: 'i-heroicons-briefcase',
      visible: () => true,
    },
    {
      name: 'spells',
      label: 'Spells',
      icon: 'i-heroicons-sparkles',
      visible: () => store.isSpellcaster,
    },
    {
      name: 'details',
      label: 'Details',
      icon: 'i-heroicons-user',
      visible: () => true,
    },
    {
      name: 'review',
      label: 'Review',
      icon: 'i-heroicons-check-circle',
      visible: () => true,
    },
  ]
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Extract step name from route path
 * Handles /characters/new/[step] pattern
 */
function extractStepFromPath(path: string): string {
  // Match /characters/new/step or /characters/123/edit/step
  const newMatch = path.match(/\/characters\/new\/([^/?]+)/)
  if (newMatch?.[1]) return newMatch[1]

  const editMatch = path.match(/\/characters\/\d+\/edit\/([^/?]+)/)
  if (editMatch?.[1]) return editMatch[1]

  return 'sourcebooks' // Default to first step
}

// ════════════════════════════════════════════════════════════════
// COMPOSABLE
// ════════════════════════════════════════════════════════════════

export interface UseCharacterWizardOptions {
  /** Optional route object for testing. Defaults to useRoute(). */
  route?: { path: string }
}

export function useCharacterWizard(options: UseCharacterWizardOptions = {}) {
  const store = useCharacterWizardStore()
  const route = options.route ?? useRoute()

  // Create step registry with store access
  const stepRegistry = createStepRegistry(store)

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
   * Current step name from URL
   */
  const currentStepName = computed(() =>
    extractStepFromPath(route.path)
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
   * Is this the last step (review)?
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
  // COMPUTED: Validation
  // ══════════════════════════════════════════════════════════════

  /**
   * Can proceed to next step?
   * Each step has its own validation requirements
   */
  const canProceed = computed(() => {
    const stepName = currentStepName.value

    switch (stepName) {
      case 'sourcebooks':
        // Can always proceed from sourcebooks (defaults to all)
        return true

      case 'race':
        return store.selections.race !== null

      case 'subrace':
        // Can proceed if subrace selected OR if subrace is optional
        return store.selections.subrace !== null || !store.isSubraceRequired

      case 'class':
        return store.selections.class !== null

      case 'subclass':
        return store.selections.subclass !== null

      case 'background':
        return store.selections.background !== null

      case 'abilities':
        // All scores should be set (not default 10s for standard array)
        // For now, just check we have a valid method
        return true

      case 'proficiencies':
        // TODO: Check all required choices made
        return true

      case 'languages':
        // TODO: Check all required choices made
        return true

      case 'equipment':
        // TODO: Check all required choices made
        return true

      case 'spells':
        // TODO: Check correct number of spells selected
        return true

      case 'details':
        // Name is required
        return store.selections.name.trim().length > 0

      case 'review':
        // Always can "proceed" (finish) from review
        return true

      default:
        return true
    }
  })

  // ══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ══════════════════════════════════════════════════════════════

  /**
   * Determine if we're in "new character" mode based on current URL
   */
  const isNewCharacterMode = computed(() =>
    route.path.includes('/characters/new/')
  )

  /**
   * Build the URL for a step
   * Uses current route to determine mode (new vs edit)
   */
  function getStepUrl(stepName: string): string {
    // Stay in the same mode we're currently in
    if (isNewCharacterMode.value) {
      return `/characters/new/${stepName}`
    }
    // Edit mode - use character ID in URL
    if (store.characterId) {
      return `/characters/${store.characterId}/edit/${stepName}`
    }
    // Fallback to new mode
    return `/characters/new/${stepName}`
  }

  /**
   * Navigate to next step
   */
  async function nextStep(): Promise<void> {
    const nextIndex = currentStepIndex.value + 1
    const next = activeSteps.value[nextIndex]
    if (next) {
      await navigateTo(getStepUrl(next.name))
    }
  }

  /**
   * Navigate to previous step
   */
  async function previousStep(): Promise<void> {
    const prevIndex = currentStepIndex.value - 1
    const prev = activeSteps.value[prevIndex]
    if (prev) {
      await navigateTo(getStepUrl(prev.name))
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
   * Get the next step (without navigating)
   */
  const nextStepInfo = computed(() => {
    const nextIndex = currentStepIndex.value + 1
    return activeSteps.value[nextIndex] ?? null
  })

  /**
   * Get the previous step (without navigating)
   */
  const previousStepInfo = computed(() => {
    const prevIndex = currentStepIndex.value - 1
    return activeSteps.value[prevIndex] ?? null
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

    // Validation
    canProceed,

    // Navigation
    nextStep,
    previousStep,
    goToStep,
    getStepUrl,
    nextStepInfo,
    previousStepInfo,
  }
}

// app/composables/useLevelUpWizard.ts
/**
 * Level-Up Wizard Navigation Composable
 *
 * Manages wizard step navigation, visibility, and validation for level-up flow.
 * Similar to useCharacterWizard but adapted for level-up's different step structure.
 */
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import type { LevelUpStep } from '~/types/character'

/**
 * Create the step registry with visibility functions
 *
 * Steps are shown dynamically based on the level-up context:
 * - class-selection: Only for multiclass or first multiclass opportunity
 * - subclass: When reaching subclass level (placeholder for now)
 * - hit-points: Always shown (every level-up needs HP choice)
 * - asi-feat: At ASI levels (4, 8, 12, 16, 19)
 * - feature-choices: For class features (fighting style, expertise, optional features)
 * - spells: For spellcasters gaining new spells
 * - languages: For language choices
 * - proficiencies: For proficiency choices
 * - summary: Always shown as final step
 */
function createStepRegistry(store: ReturnType<typeof useCharacterLevelUpStore>): LevelUpStep[] {
  return [
    {
      name: 'class-selection',
      label: 'Class',
      icon: 'i-heroicons-shield-check',
      visible: () => store.needsClassSelection,
      shouldSkip: () => !store.needsClassSelection
    },
    {
      name: 'subclass',
      label: 'Subclass',
      icon: 'i-heroicons-star',
      visible: () => store.hasSubclassChoice,
      shouldSkip: () => !store.hasSubclassChoice
    },
    {
      name: 'hit-points',
      label: 'Hit Points',
      icon: 'i-heroicons-heart',
      visible: () => true,
      shouldSkip: () => !(store.levelUpResult?.hp_choice_pending ?? true)
    },
    {
      name: 'asi-feat',
      label: 'ASI / Feat',
      icon: 'i-heroicons-arrow-trending-up',
      visible: () => true,
      shouldSkip: () => !(store.levelUpResult?.asi_pending ?? false)
    },
    {
      name: 'feature-choices',
      label: 'Features',
      icon: 'i-heroicons-puzzle-piece',
      visible: () => store.hasFeatureChoices,
      shouldSkip: () => !store.hasFeatureChoices
    },
    {
      name: 'spells',
      label: 'Spells',
      icon: 'i-heroicons-sparkles',
      visible: () => store.hasSpellChoices,
      shouldSkip: () => !store.hasSpellChoices
    },
    {
      name: 'languages',
      label: 'Languages',
      icon: 'i-heroicons-language',
      visible: () => store.hasLanguageChoices,
      shouldSkip: () => !store.hasLanguageChoices
    },
    {
      name: 'proficiencies',
      label: 'Proficiencies',
      icon: 'i-heroicons-academic-cap',
      visible: () => store.hasProficiencyChoices,
      shouldSkip: () => !store.hasProficiencyChoices
    },
    {
      name: 'summary',
      label: 'Summary',
      icon: 'i-heroicons-trophy',
      visible: () => true
    }
  ]
}

export function useLevelUpWizard() {
  const store = useCharacterLevelUpStore()

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
   * Current step index within active steps
   */
  const currentStepIndex = computed(() =>
    activeSteps.value.findIndex(s => s.name === store.currentStepName)
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
  const totalSteps = computed(() => activeSteps.value.length)

  /**
   * Is this the first step?
   */
  const isFirstStep = computed(() => currentStepIndex.value === 0)

  /**
   * Is this the last step (summary)?
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
  function nextStep(): void {
    let nextIndex = currentStepIndex.value + 1

    while (nextIndex < activeSteps.value.length) {
      const next = activeSteps.value[nextIndex]
      if (next && !next.shouldSkip?.()) {
        store.goToStep(next.name)
        return
      }
      nextIndex++
    }
  }

  /**
   * Navigate to previous step
   */
  function previousStep(): void {
    let prevIndex = currentStepIndex.value - 1

    while (prevIndex >= 0) {
      const prev = activeSteps.value[prevIndex]
      if (prev && !prev.shouldSkip?.()) {
        store.goToStep(prev.name)
        return
      }
      prevIndex--
    }
  }

  /**
   * Navigate to specific step by name
   */
  function goToStep(stepName: string): void {
    store.goToStep(stepName)
  }

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // Step registry
    stepRegistry,
    activeSteps,

    // Current step
    currentStep,
    currentStepIndex,

    // Progress
    totalSteps,
    progressPercent,
    isFirstStep,
    isLastStep,

    // Navigation
    nextStep,
    previousStep,
    goToStep
  }
}

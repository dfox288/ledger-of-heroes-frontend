// app/composables/useLevelUpWizard.ts
/**
 * Level-Up Wizard Navigation Composable
 *
 * Manages wizard step navigation using URL-based routing for level-up.
 * URL is source of truth for current step (matches character creation wizard pattern).
 *
 * Built on useWizardNavigation base composable (#625).
 */
import { toValue, type MaybeRef } from 'vue'
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import { useWizardNavigation, type WizardStep } from './useWizardNavigation'
import type { LevelUpStep } from '~/types/character'

export interface UseLevelUpWizardOptions {
  /** Character public ID for URL building (supports refs for reactivity) */
  publicId: MaybeRef<string>
  /** Current step name from URL (supports refs for reactivity) */
  currentStep: MaybeRef<string>
}

/**
 * Create the step registry with visibility functions
 */
function createStepRegistry(store: ReturnType<typeof useCharacterLevelUpStore>): WizardStep[] {
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

export function useLevelUpWizard(options?: UseLevelUpWizardOptions) {
  const store = useCharacterLevelUpStore()

  // Create step registry with store access
  const stepRegistry = createStepRegistry(store)

  // Current step name - from URL (options.currentStep) or store fallback
  const currentStepName = computed(() => {
    if (options?.currentStep) {
      return toValue(options.currentStep)
    }
    return store.currentStepName
  })

  // URL builder for level-up wizard
  function getStepUrl(stepName: string): string {
    if (!options?.publicId) {
      throw new Error('publicId required for URL-based navigation')
    }
    return `/characters/${toValue(options.publicId)}/level-up/${stepName}`
  }

  // Preview URL helper
  function getPreviewUrl(): string {
    if (!options?.publicId) {
      throw new Error('publicId required for URL-based navigation')
    }
    return `/characters/${toValue(options.publicId)}/level-up`
  }

  // Use base navigation composable
  const navigation = useWizardNavigation({
    stepRegistry,
    currentStepName,
    getStepUrl
  })

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  // Cast activeSteps to LevelUpStep[] for backward compatibility
  const activeSteps = navigation.activeSteps as ComputedRef<LevelUpStep[]>

  return {
    // From base navigation (spread all properties)
    stepRegistry: navigation.stepRegistry,
    activeSteps,
    currentStep: navigation.currentStep,
    currentStepName: navigation.currentStepName,
    currentStepIndex: navigation.currentStepIndex,
    totalSteps: navigation.totalSteps,
    progressPercent: navigation.progressPercent,
    isFirstStep: navigation.isFirstStep,
    isLastStep: navigation.isLastStep,
    nextStep: navigation.nextStep,
    previousStep: navigation.previousStep,
    goToStep: navigation.goToStep,
    getStepUrl: navigation.getStepUrl,
    nextStepInfo: navigation.nextStepInfo,
    previousStepInfo: navigation.previousStepInfo,

    // Level-up specific
    getPreviewUrl
  }
}

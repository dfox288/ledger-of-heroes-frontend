// app/composables/useCharacterWizard.ts
/**
 * Character Wizard Navigation Composable
 *
 * Manages wizard step navigation, visibility, and validation for character creation.
 * Uses URL as source of truth for current step.
 *
 * Built on useWizardNavigation base composable (#625).
 */
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardNavigation, type WizardStep } from './useWizardNavigation'

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
      visible: () => true
    },
    {
      name: 'race',
      label: 'Race',
      icon: 'i-heroicons-globe-alt',
      visible: () => true
    },
    {
      name: 'subrace',
      label: 'Subrace',
      icon: 'i-heroicons-sparkles',
      visible: () => store.needsSubraceStep
    },
    {
      name: 'size',
      label: 'Size',
      icon: 'i-heroicons-arrows-up-down',
      visible: () => true,
      shouldSkip: () => !store.hasSizeChoices
    },
    {
      name: 'class',
      label: 'Class',
      icon: 'i-heroicons-shield-check',
      visible: () => true
    },
    {
      name: 'subclass',
      label: 'Subclass',
      icon: 'i-heroicons-star',
      visible: () => store.needsSubclassStep
    },
    {
      name: 'background',
      label: 'Background',
      icon: 'i-heroicons-book-open',
      visible: () => true
    },
    {
      name: 'feats',
      label: 'Feats',
      icon: 'i-heroicons-star',
      visible: () => true,
      shouldSkip: () => !store.hasFeatChoices
    },
    {
      name: 'abilities',
      label: 'Abilities',
      icon: 'i-heroicons-chart-bar',
      visible: () => true
    },
    {
      name: 'proficiencies',
      label: 'Skills',
      icon: 'i-heroicons-academic-cap',
      visible: () => true,
      shouldSkip: () => !store.hasProficiencyChoices
    },
    {
      name: 'feature-choices',
      label: 'Features',
      icon: 'i-heroicons-puzzle-piece',
      visible: () => store.hasFeatureChoices
    },
    {
      name: 'languages',
      label: 'Languages',
      icon: 'i-heroicons-language',
      visible: () => true,
      shouldSkip: () => !store.hasLanguageChoices
    },
    {
      name: 'equipment',
      label: 'Equipment',
      icon: 'i-heroicons-briefcase',
      visible: () => true
    },
    {
      name: 'spells',
      label: 'Spells',
      icon: 'i-heroicons-sparkles',
      visible: () => store.isSpellcaster
    },
    {
      name: 'details',
      label: 'Details',
      icon: 'i-heroicons-user',
      visible: () => true
    },
    {
      name: 'physical-description',
      label: 'Physical',
      icon: 'i-heroicons-identification',
      visible: () => true
    },
    {
      name: 'review',
      label: 'Review',
      icon: 'i-heroicons-check-circle',
      visible: () => true
    }
  ]
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Extract step name from route path
 * Handles /characters/new/[step] and /characters/[publicId]/edit/[step] patterns
 */
function extractStepFromPath(path: string): string {
  // Match /characters/new/step
  const newMatch = path.match(/\/characters\/new\/([^/?]+)/)
  if (newMatch?.[1]) return newMatch[1]

  // Match /characters/{publicId}/edit/step (publicId format: word-word-XXXX)
  const editMatch = path.match(/\/characters\/[a-z]+-[a-z]+-[A-Za-z0-9]{4}\/edit\/([^/?]+)/)
  if (editMatch?.[1]) return editMatch[1]

  // Legacy: Match /characters/{numericId}/edit/step
  const legacyMatch = path.match(/\/characters\/\d+\/edit\/([^/?]+)/)
  if (legacyMatch?.[1]) return legacyMatch[1]

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

  // Current step name from URL
  const currentStepName = computed(() =>
    extractStepFromPath(route.path)
  )

  // URL builder for character wizard
  function getStepUrl(stepName: string): string {
    if (store.publicId) {
      return `/characters/${store.publicId}/edit/${stepName}`
    }
    return `/characters/new/${stepName}`
  }

  // Use base navigation composable
  const navigation = useWizardNavigation({
    stepRegistry,
    currentStepName,
    getStepUrl
  })

  // ══════════════════════════════════════════════════════════════
  // VALIDATION (Character wizard specific)
  // ══════════════════════════════════════════════════════════════

  /**
   * Can proceed to next step?
   * Each step has its own validation requirements
   */
  const canProceed = computed(() => {
    const stepName = currentStepName.value

    switch (stepName) {
      case 'sourcebooks':
        return true

      case 'race':
        return store.selections.race !== null

      case 'subrace':
        return store.selections.subrace !== null || !store.isSubraceRequired

      case 'size':
        if (!store.summary) return false
        return store.summary.pending_choices.size === 0

      case 'class':
        return store.selections.class !== null

      case 'subclass':
        return store.selections.subclass !== null

      case 'background':
        return store.selections.background !== null

      case 'feats':
        if (!store.summary) return true
        return store.summary.pending_choices.feats === 0

      case 'abilities':
        if (!store.summary) return true
        return store.summary.pending_choices.asi === 0

      case 'proficiencies':
        if (!store.summary) return true
        return store.summary.pending_choices.proficiencies === 0

      case 'languages':
        if (!store.summary) return true
        return store.summary.pending_choices.languages === 0

      case 'equipment':
        return true

      case 'spells':
        if (!store.summary) return true
        return store.summary.pending_choices.spells === 0

      case 'details':
        return store.selections.name.trim().length > 0

      case 'review':
        return true

      default:
        return true
    }
  })

  // ══════════════════════════════════════════════════════════════
  // RETURN
  // ══════════════════════════════════════════════════════════════

  return {
    // From base navigation
    ...navigation,

    // Character wizard specific
    canProceed
  }
}

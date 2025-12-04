// app/composables/useWizardSteps.ts
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

export interface WizardStep {
  name: string
  label: string
  icon: string
  visible: () => boolean
}

/**
 * Step registry - single source of truth for wizard steps
 * Order matters: steps appear in this order in the wizard
 *
 * Note: Uses functions for visibility checks so they're evaluated
 * at runtime based on current store state
 */
export const stepRegistry: WizardStep[] = [
  {
    name: 'name',
    label: 'Name',
    icon: 'i-heroicons-user',
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
    visible: () => {
      const store = useCharacterBuilderStore()
      return store.needsSubrace
    }
  },
  {
    name: 'class',
    label: 'Class',
    icon: 'i-heroicons-shield-check',
    visible: () => true
  },
  {
    name: 'abilities',
    label: 'Abilities',
    icon: 'i-heroicons-chart-bar',
    visible: () => true
  },
  {
    name: 'background',
    label: 'Background',
    icon: 'i-heroicons-book-open',
    visible: () => true
  },
  {
    name: 'proficiencies',
    label: 'Proficiencies',
    icon: 'i-heroicons-academic-cap',
    visible: () => {
      const store = useCharacterBuilderStore()
      return store.hasPendingChoices
    }
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
    visible: () => {
      const store = useCharacterBuilderStore()
      return store.isCaster
    }
  },
  {
    name: 'review',
    label: 'Review',
    icon: 'i-heroicons-check-circle',
    visible: () => true
  }
]

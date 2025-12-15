import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import WizardSidebar from '~/components/character/wizard/WizardSidebar.vue'

/**
 * WizardSidebar - Unified sidebar for character creation and level-up wizards
 *
 * Tests the prop-based API introduced in #625 consolidation.
 */

// Mock steps for testing
const mockSteps = [
  { name: 'sourcebooks', label: 'Sources', icon: 'i-heroicons-book-open' },
  { name: 'race', label: 'Race', icon: 'i-heroicons-globe-alt' },
  { name: 'class', label: 'Class', icon: 'i-heroicons-shield-check' },
  { name: 'background', label: 'Background', icon: 'i-heroicons-book-open' },
  { name: 'abilities', label: 'Abilities', icon: 'i-heroicons-chart-bar' },
  { name: 'details', label: 'Details', icon: 'i-heroicons-user' },
  { name: 'review', label: 'Review', icon: 'i-heroicons-check-circle' }
]

function createMockGetStepUrl(publicId?: string) {
  return (stepName: string) => {
    if (publicId) {
      return `/characters/${publicId}/edit/${stepName}`
    }
    return `/characters/new/${stepName}`
  }
}

describe('WizardSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('step list', () => {
    it('displays all provided steps', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'sourcebooks',
          getStepUrl: createMockGetStepUrl()
        }
      })

      expect(wrapper.text()).toContain('Sources')
      expect(wrapper.text()).toContain('Race')
      expect(wrapper.text()).toContain('Class')
      expect(wrapper.text()).toContain('Review')
    })

    it('displays the provided title', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Level Up',
          activeSteps: mockSteps,
          currentStep: 'sourcebooks',
          getStepUrl: createMockGetStepUrl()
        }
      })

      expect(wrapper.text()).toContain('Level Up')
    })

    it('shows step items with test IDs', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'sourcebooks',
          getStepUrl: createMockGetStepUrl()
        }
      })

      const sourcebooksStep = wrapper.find('[data-testid="step-item-sourcebooks"]')
      expect(sourcebooksStep.exists()).toBe(true)

      const raceStep = wrapper.find('[data-testid="step-item-race"]')
      expect(raceStep.exists()).toBe(true)
    })
  })

  describe('current step highlighting', () => {
    it('highlights the current step', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'race',
          getStepUrl: createMockGetStepUrl()
        }
      })

      const currentStep = wrapper.find('[data-testid="step-item-race"]')
      expect(currentStep.classes()).toContain('bg-primary-50')
    })

    it('shows completed indicator for past steps', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'race',
          getStepUrl: createMockGetStepUrl()
        }
      })

      // Sourcebooks (index 0) should show as completed when on race (index 1)
      const sourcebooksStep = wrapper.find('[data-testid="step-item-sourcebooks"]')
      expect(sourcebooksStep.find('[data-testid="check-icon"]').exists()).toBe(true)
    })

    it('marks future steps as not clickable', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'sourcebooks',
          getStepUrl: createMockGetStepUrl()
        }
      })

      // Future steps should have cursor-not-allowed
      const reviewStep = wrapper.find('[data-testid="step-item-review"]')
      expect(reviewStep.classes()).toContain('cursor-not-allowed')
    })
  })

  describe('navigation', () => {
    it('completed steps are clickable', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'class',
          getStepUrl: createMockGetStepUrl()
        }
      })

      // Race step (completed) should be hoverable/clickable
      const raceStep = wrapper.find('[data-testid="step-item-race"]')
      expect(raceStep.classes()).toContain('hover:bg-gray-100')
    })

    it('future steps are disabled', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'sourcebooks',
          getStepUrl: createMockGetStepUrl()
        }
      })

      const reviewStep = wrapper.find('[data-testid="step-item-review"]')
      expect(reviewStep.classes()).toContain('pointer-events-none')
    })
  })

  describe('progress display', () => {
    it('shows progress bar', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'abilities',
          getStepUrl: createMockGetStepUrl()
        }
      })

      expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true)
    })

    it('shows progress percentage text', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps,
          currentStep: 'abilities', // index 4 of 7 = 66%
          getStepUrl: createMockGetStepUrl()
        }
      })

      expect(wrapper.text()).toContain('% complete')
    })

    it('calculates progress correctly', async () => {
      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Character Builder',
          activeSteps: mockSteps.slice(0, 3), // 3 steps
          currentStep: 'race', // index 1 of 3 = 50%
          getStepUrl: createMockGetStepUrl()
        }
      })

      expect(wrapper.text()).toContain('50% complete')
    })
  })

  describe('level-up wizard usage', () => {
    it('works with level-up specific steps', async () => {
      const levelUpSteps = [
        { name: 'hit-points', label: 'Hit Points', icon: 'i-heroicons-heart' },
        { name: 'asi-feat', label: 'ASI / Feat', icon: 'i-heroicons-arrow-trending-up' },
        { name: 'summary', label: 'Summary', icon: 'i-heroicons-trophy' }
      ]

      const wrapper = await mountSuspended(WizardSidebar, {
        props: {
          title: 'Level Up',
          activeSteps: levelUpSteps,
          currentStep: 'hit-points',
          getStepUrl: (name: string) => `/characters/test-id/level-up/${name}`
        }
      })

      expect(wrapper.text()).toContain('Level Up')
      expect(wrapper.text()).toContain('Hit Points')
      expect(wrapper.text()).toContain('ASI / Feat')
      expect(wrapper.text()).toContain('Summary')
    })
  })
})

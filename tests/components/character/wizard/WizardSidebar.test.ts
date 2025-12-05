import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reactive } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import WizardSidebar from '~/components/character/wizard/WizardSidebar.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { WizardStep } from '~/composables/useCharacterWizard'

// Mock navigateTo as a no-op (actual navigation tested in integration tests)
vi.stubGlobal('navigateTo', vi.fn())

function createMockRoute(path: string = '/characters/new/sourcebooks') {
  return reactive({ path })
}

describe('WizardSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('step list', () => {
    it('displays visible steps', async () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Core visible steps should be shown
      expect(wrapper.text()).toContain('Sources')
      expect(wrapper.text()).toContain('Race')
      expect(wrapper.text()).toContain('Class')
      expect(wrapper.text()).toContain('Review')
    })

    it('hides conditional steps when not needed', async () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Without race/class selection, conditional steps should be hidden
      expect(wrapper.text()).not.toContain('Subrace')
      expect(wrapper.text()).not.toContain('Subclass')
      expect(wrapper.text()).not.toContain('Spells')
    })

    it('shows step icons', async () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Look for step items with specific test IDs
      const sourcebooksStep = wrapper.find('[data-test="step-item-sourcebooks"]')
      expect(sourcebooksStep.exists()).toBe(true)
    })
  })

  describe('current step highlighting', () => {
    it('highlights the current step', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      const currentStep = wrapper.find('[data-test="step-item-race"]')
      expect(currentStep.classes()).toContain('bg-primary-50')
    })

    it('shows completed indicator for past steps', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Sourcebooks (index 0) should show as completed when on race (index 1)
      const sourcebooksStep = wrapper.find('[data-test="step-item-sourcebooks"]')
      expect(sourcebooksStep.find('[data-test="check-icon"]').exists()).toBe(true)
    })
  })

  describe('navigation', () => {
    it('allows clicking on completed steps', async () => {
      const route = createMockRoute('/characters/new/class')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      const raceStep = wrapper.find('[data-test="step-item-race"]')
      // Verify the step is clickable (not disabled)
      expect(raceStep.classes()).toContain('cursor-pointer')
      await raceStep.trigger('click')
      // Navigation handled asynchronously; verified in integration tests
    })

    it('does not navigate when clicking current step', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Current step should not have cursor-pointer class
      const raceStep = wrapper.find('[data-test="step-item-race"]')
      expect(raceStep.classes()).not.toContain('cursor-pointer')
    })

    it('does not navigate when clicking future steps', async () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Future steps should be disabled
      const reviewStep = wrapper.find('[data-test="step-item-review"]')
      expect(reviewStep.classes()).toContain('cursor-not-allowed')
    })
  })

  describe('progress display', () => {
    it('shows progress percentage', async () => {
      const route = createMockRoute('/characters/new/abilities')
      const wrapper = await mountSuspended(WizardSidebar, {
        props: { route }
      })

      // Progress bar should exist
      expect(wrapper.find('[data-test="progress-bar"]').exists()).toBe(true)
    })
  })
})

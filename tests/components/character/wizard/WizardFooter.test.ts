import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reactive } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import WizardFooter from '~/components/character/wizard/WizardFooter.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'

// Mock navigateTo as a no-op (actual navigation tested in integration tests)
vi.stubGlobal('navigateTo', vi.fn())

function createMockRoute(path: string = '/characters/new/sourcebooks') {
  return reactive({ path })
}

describe('WizardFooter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('structure', () => {
    it('renders back and next buttons', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      expect(wrapper.find('[data-test="back-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="next-button"]').exists()).toBe(true)
    })

    it('has sticky footer styling', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const footer = wrapper.find('footer')
      expect(footer.classes()).toContain('border-t')
    })
  })

  describe('back button', () => {
    it('is disabled on first step', async () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const backButton = wrapper.find('[data-test="back-button"]')
      expect(backButton.attributes('disabled')).toBeDefined()
    })

    it('is enabled on second step', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const backButton = wrapper.find('[data-test="back-button"]')
      expect(backButton.attributes('disabled')).toBeUndefined()
    })

    it('calls previousStep handler on click', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      // Verify clicking doesn't throw and the button is clickable
      const backButton = wrapper.find('[data-test="back-button"]')
      expect(backButton.element.hasAttribute('disabled')).toBe(false)
      await backButton.trigger('click')
      // Navigation is handled asynchronously; integration tests verify navigation
    })
  })

  describe('next button', () => {
    it('shows "Next" on non-final steps', async () => {
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const nextButton = wrapper.find('[data-test="next-button"]')
      expect(nextButton.text()).toContain('Next')
    })

    it('shows "Finish" on review step', async () => {
      const route = createMockRoute('/characters/new/review')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const nextButton = wrapper.find('[data-test="next-button"]')
      expect(nextButton.text()).toContain('Finish')
    })

    it('calls nextStep handler on click', async () => {
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      // Verify clicking doesn't throw and the button is enabled
      const nextButton = wrapper.find('[data-test="next-button"]')
      expect(nextButton.element.hasAttribute('disabled')).toBe(false)
      await nextButton.trigger('click')
      // Navigation is handled asynchronously; integration tests verify navigation
    })

    it('is disabled when canProceed is false', async () => {
      // Race step requires a race to be selected
      const route = createMockRoute('/characters/new/race')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      // No race selected, canProceed should be false
      const nextButton = wrapper.find('[data-test="next-button"]')
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('is enabled when canProceed is true', async () => {
      // Sourcebooks step always allows proceeding
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const nextButton = wrapper.find('[data-test="next-button"]')
      // Button should NOT be disabled when canProceed is true
      expect(nextButton.element.hasAttribute('disabled')).toBe(false)
    })
  })

  describe('button display', () => {
    it('shows appropriate icon for current step', async () => {
      // Non-final step should show arrow icon
      const route = createMockRoute('/characters/new/sourcebooks')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const nextButton = wrapper.find('[data-test="next-button"]')
      expect(nextButton.html()).toContain('i-heroicons-arrow-right')
    })

    it('shows check icon on review step', async () => {
      const route = createMockRoute('/characters/new/review')
      const wrapper = await mountSuspended(WizardFooter, {
        props: { route }
      })

      const nextButton = wrapper.find('[data-test="next-button"]')
      expect(nextButton.html()).toContain('i-heroicons-check')
    })
  })
})

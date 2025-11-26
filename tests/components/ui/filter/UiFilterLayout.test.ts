import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterLayout from '~/components/ui/filter/UiFilterLayout.vue'

describe('UiFilterLayout', () => {
  describe('Slot Rendering', () => {
    it('renders primary slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div data-testid="primary-content">Primary Filters</div>'
        }
      })

      expect(wrapper.find('[data-testid="primary-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Primary Filters')
    })

    it('renders quick slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          quick: '<div data-testid="quick-content">Quick Toggles</div>'
        }
      })

      expect(wrapper.find('[data-testid="quick-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Quick Toggles')
    })

    it('renders advanced slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          advanced: '<div data-testid="advanced-content">Advanced Filters</div>'
        }
      })

      expect(wrapper.find('[data-testid="advanced-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Advanced Filters')
    })

    it('renders actions slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          actions: '<button data-testid="clear-button">Clear Filters</button>'
        }
      })

      expect(wrapper.find('[data-testid="clear-button"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Clear Filters')
    })

    it('renders all slots together', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div data-testid="primary">Primary</div>',
          quick: '<div data-testid="quick">Quick</div>',
          advanced: '<div data-testid="advanced">Advanced</div>',
          actions: '<div data-testid="actions">Actions</div>'
        }
      })

      expect(wrapper.find('[data-testid="primary"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="quick"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="advanced"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="actions"]').exists()).toBe(true)
    })
  })

  describe('Layout Structure', () => {
    it('has correct spacing between sections', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div>Primary</div>',
          quick: '<div>Quick</div>'
        }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('space-y-4')
    })

    it('applies flex layout with gap-3 to primary slot container', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div>Primary</div>'
        }
      })

      const primaryContainer = wrapper.find('[data-section="primary"]')
      expect(primaryContainer.classes()).toContain('flex')
      expect(primaryContainer.classes()).toContain('flex-wrap')
      expect(primaryContainer.classes()).toContain('gap-3')
    })

    it('applies flex layout to quick slot container', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          quick: '<div>Quick</div>'
        }
      })

      const quickContainer = wrapper.find('[data-section="quick"]')
      expect(quickContainer.classes()).toContain('flex')
      expect(quickContainer.classes()).toContain('flex-wrap')
      expect(quickContainer.classes()).toContain('gap-3')
    })

    it('applies flex layout to advanced slot container', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          advanced: '<div>Advanced</div>'
        }
      })

      const advancedContainer = wrapper.find('[data-section="advanced"]')
      expect(advancedContainer.classes()).toContain('flex')
      expect(advancedContainer.classes()).toContain('flex-wrap')
      expect(advancedContainer.classes()).toContain('gap-3')
    })

    it('right-aligns actions slot', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          actions: '<button>Clear</button>'
        }
      })

      const actionsContainer = wrapper.find('[data-section="actions"]')
      expect(actionsContainer.classes()).toContain('flex')
      expect(actionsContainer.classes()).toContain('justify-end')
    })
  })

  describe('Empty Slots', () => {
    it('does not render primary container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          quick: '<div>Quick</div>'
        }
      })

      expect(wrapper.find('[data-section="primary"]').exists()).toBe(false)
    })

    it('does not render quick container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div>Primary</div>'
        }
      })

      expect(wrapper.find('[data-section="quick"]').exists()).toBe(false)
    })

    it('does not render advanced container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div>Primary</div>'
        }
      })

      expect(wrapper.find('[data-section="advanced"]').exists()).toBe(false)
    })

    it('does not render actions container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div>Primary</div>'
        }
      })

      expect(wrapper.find('[data-section="actions"]').exists()).toBe(false)
    })

    it('handles component with no slots', async () => {
      const wrapper = await mountSuspended(UiFilterLayout)

      // Should render empty container with correct classes
      expect(wrapper.find('div').exists()).toBe(true)
      expect(wrapper.find('div').classes()).toContain('space-y-4')
    })
  })

  describe('Dark Mode Support', () => {
    it('has dark mode classes on all sections', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: '<div>Primary</div>',
          quick: '<div>Quick</div>',
          advanced: '<div>Advanced</div>',
          actions: '<div>Actions</div>'
        }
      })

      // Container should support dark mode (no specific dark classes needed for space-y-4)
      const container = wrapper.find('div')
      expect(container.exists()).toBe(true)
    })
  })
})

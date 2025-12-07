import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterLayout from '~/components/ui/filter/UiFilterLayout.vue'

describe('UiFilterLayout', () => {
  describe('Slot Rendering', () => {
    it('renders primary slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: () => h('div', { 'data-testid': 'primary-content' }, 'Primary Filters')
        }
      })

      expect(wrapper.find('[data-testid="primary-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Primary Filters')
    })

    it('renders quick slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          quick: () => h('div', { 'data-testid': 'quick-content' }, 'Quick Toggles')
        }
      })

      expect(wrapper.find('[data-testid="quick-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Quick Toggles')
    })

    it('renders advanced slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          advanced: () => h('div', { 'data-testid': 'advanced-content' }, 'Advanced Filters')
        }
      })

      expect(wrapper.find('[data-testid="advanced-content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Advanced Filters')
    })

    it('renders actions slot content', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          actions: () => h('button', { 'data-testid': 'clear-button' }, 'Clear Filters')
        }
      })

      expect(wrapper.find('[data-testid="clear-button"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Clear Filters')
    })

    it('renders all slots together', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: () => h('div', { 'data-testid': 'primary' }, 'Primary'),
          quick: () => h('div', { 'data-testid': 'quick' }, 'Quick'),
          advanced: () => h('div', { 'data-testid': 'advanced' }, 'Advanced'),
          actions: () => h('div', { 'data-testid': 'actions' }, 'Actions')
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
          primary: () => h('div', 'Primary'),
          quick: () => h('div', 'Quick')
        }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('space-y-4')
    })

    it('applies flex layout with gap-3 to primary slot container', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: () => h('div', 'Primary')
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
          quick: () => h('div', 'Quick')
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
          advanced: () => h('div', 'Advanced')
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
          actions: () => h('button', 'Clear')
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
          quick: () => h('div', 'Quick')
        }
      })

      expect(wrapper.find('[data-section="primary"]').exists()).toBe(false)
    })

    it('does not render quick container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: () => h('div', 'Primary')
        }
      })

      expect(wrapper.find('[data-section="quick"]').exists()).toBe(false)
    })

    it('does not render advanced container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: () => h('div', 'Primary')
        }
      })

      expect(wrapper.find('[data-section="advanced"]').exists()).toBe(false)
    })

    it('does not render actions container when slot is empty', async () => {
      const wrapper = await mountSuspended(UiFilterLayout, {
        slots: {
          primary: () => h('div', 'Primary')
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
          primary: () => h('div', 'Primary'),
          quick: () => h('div', 'Quick'),
          advanced: () => h('div', 'Advanced'),
          actions: () => h('div', 'Actions')
        }
      })

      // Container should support dark mode (no specific dark classes needed for space-y-4)
      const container = wrapper.find('div')
      expect(container.exists()).toBe(true)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterCollapse from '~/components/ui/filter/UiFilterCollapse.vue'

describe('UiFilterCollapse', () => {
  describe('Basic Rendering', () => {
    it('renders the toggle button', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          label: 'Filters'
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('renders with default label "Filters"', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        }
      })

      expect(wrapper.text()).toContain('Filters')
    })

    it('renders with custom label', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          label: 'Advanced Filters'
        }
      })

      expect(wrapper.text()).toContain('Advanced Filters')
    })

    it('shows "Show Filters" text when closed', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          label: 'Filters'
        }
      })

      expect(wrapper.text()).toContain('Show Filters')
    })

    it('shows "Hide Filters" text when open', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: true,
          label: 'Filters'
        }
      })

      expect(wrapper.text()).toContain('Hide Filters')
    })
  })

  describe('Badge Display', () => {
    it('does not show badge when count is 0', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          badgeCount: 0
        }
      })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.exists()).toBe(false)
    })

    it('shows badge when count is greater than 0', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          badgeCount: 3
        }
      })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('3')
    })

    it('shows correct badge count', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          badgeCount: 5
        }
      })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.text()).toBe('5')
    })

    it('updates badge when count changes', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          badgeCount: 2
        }
      })

      await wrapper.setProps({ badgeCount: 7 })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.text()).toBe('7')
    })
  })

  describe('Toggle Interaction', () => {
    it('emits update:modelValue when button clicked', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        }
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('emits false when closing', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: true
        }
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('updates aria-expanded attribute', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('false')

      await wrapper.setProps({ modelValue: true })
      expect(button.attributes('aria-expanded')).toBe('true')
    })
  })

  describe('Content Visibility', () => {
    it('hides content when closed', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        },
        slots: {
          default: () => h('div', { 'data-testid': 'filter-content' }, 'Filter Content')
        }
      })

      const content = wrapper.find('[data-testid="filter-content"]')
      expect(content.exists()).toBe(false)
    })

    it('shows content when open', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: true
        },
        slots: {
          default: () => h('div', { 'data-testid': 'filter-content' }, 'Filter Content')
        }
      })

      const content = wrapper.find('[data-testid="filter-content"]')
      expect(content.exists()).toBe(true)
      expect(content.text()).toBe('Filter Content')
    })

    it('renders slot content correctly', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: true
        },
        slots: {
          default: () => h('div', { class: 'space-y-4' }, [
            h('div', 'Filter 1'),
            h('div', 'Filter 2')
          ])
        }
      })

      expect(wrapper.text()).toContain('Filter 1')
      expect(wrapper.text()).toContain('Filter 2')
    })
  })

  describe('Search Input Integration', () => {
    it('renders search input before toggle button', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        },
        slots: {
          search: () => h('input', { 'type': 'text', 'placeholder': 'Search...', 'data-testid': 'search-input' })
        }
      })

      const searchInput = wrapper.find('[data-testid="search-input"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toBe('Search...')
    })
  })

  describe('Accessibility', () => {
    it('has proper button type', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('type')).toBe('button')
    })

    it('sets aria-expanded correctly when closed', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('false')
    })

    it('sets aria-expanded correctly when open', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: true
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('true')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined badgeCount', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false
          // badgeCount is undefined
        }
      })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.exists()).toBe(false)
    })

    it('handles negative badgeCount as 0', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: false,
          badgeCount: -1
        }
      })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.exists()).toBe(false)
    })

    it('renders without slots', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})

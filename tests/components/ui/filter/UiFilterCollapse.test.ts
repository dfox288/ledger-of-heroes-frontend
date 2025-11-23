import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiFilterCollapse from '~/components/ui/filter/UiFilterCollapse.vue'

describe('UiFilterCollapse', () => {
  describe('Basic Rendering', () => {
    it('renders the toggle button with default label', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        slots: {
          default: '<div>Filter content</div>'
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Filters')
    })

    it('renders with custom label', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          label: 'Advanced Options'
        },
        slots: {
          default: '<div>Filter content</div>'
        }
      })

      const button = wrapper.find('button')
      expect(button.text()).toContain('Advanced Options')
    })

    it('renders slot content when expanded', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          defaultOpen: true
        },
        slots: {
          default: '<div class="test-content">Filter content here</div>'
        }
      })

      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Filter content here')
    })
  })

  describe('Expand/Collapse Behavior', () => {
    it('starts collapsed by default', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        slots: {
          default: '<div class="filter-content">Hidden content</div>'
        }
      })

      // Content should not be visible
      const content = wrapper.find('.filter-content')
      expect(content.exists()).toBe(false)
    })

    it('starts expanded when defaultOpen is true', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          defaultOpen: true
        },
        slots: {
          default: '<div class="filter-content">Visible content</div>'
        }
      })

      // Content should be visible
      const content = wrapper.find('.filter-content')
      expect(content.exists()).toBe(true)
    })

    it('toggles visibility when button is clicked', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        slots: {
          default: '<div class="filter-content">Toggle content</div>'
        }
      })

      const button = wrapper.find('button')

      // Initially collapsed
      expect(wrapper.find('.filter-content').exists()).toBe(false)

      // Click to expand
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.filter-content').exists()).toBe(true)

      // Click to collapse
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.filter-content').exists()).toBe(false)
    })

    it('updates button text when toggling', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          label: 'Filters'
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      const button = wrapper.find('button')

      // Initially shows "Show Filters"
      expect(button.text()).toContain('Show')

      // After clicking, shows "Hide Filters"
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      expect(button.text()).toContain('Hide')
    })
  })

  describe('Badge Count', () => {
    it('does not show badge when count is 0', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          badgeCount: 0
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Badge should not be visible
      expect(wrapper.find('[data-testid="filter-badge"]').exists()).toBe(false)
    })

    it('shows badge count when greater than 0', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          badgeCount: 3
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      const badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('3')
    })

    it('updates badge count reactively', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          badgeCount: 2
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      let badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.text()).toBe('2')

      // Update prop
      await wrapper.setProps({ badgeCount: 5 })
      badge = wrapper.find('[data-testid="filter-badge"]')
      expect(badge.text()).toBe('5')
    })
  })

  describe('Accessibility', () => {
    it('button has proper ARIA attributes when collapsed', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        slots: {
          default: '<div>Content</div>'
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-controls')).toBeDefined()
    })

    it('button has proper ARIA attributes when expanded', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          defaultOpen: true
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('true')
    })

    it('content region has proper ARIA role and id', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          defaultOpen: true
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      const button = wrapper.find('button')
      const contentId = button.attributes('aria-controls')

      const content = wrapper.find(`#${contentId}`)
      expect(content.exists()).toBe(true)
      expect(content.attributes('role')).toBe('region')
    })
  })

  describe('Edge Cases', () => {
    it('handles missing slot content gracefully', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          defaultOpen: true
        }
      })

      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing label gracefully', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          label: ''
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('handles undefined badgeCount', async () => {
      const wrapper = await mountSuspended(UiFilterCollapse, {
        props: {
          badgeCount: undefined
        },
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Should not show badge
      expect(wrapper.find('[data-testid="filter-badge"]').exists()).toBe(false)
    })
  })
})

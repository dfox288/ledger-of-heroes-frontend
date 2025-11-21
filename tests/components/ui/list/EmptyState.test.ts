import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '~/components/ui/list/EmptyState.vue'

describe('UiListEmptyState', () => {
  describe('heading display', () => {
    it('renders with entity name in heading', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells'
        }
      })

      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).toBe('No spells found')
    })

    it('shows generic heading when entity name omitted', () => {
      const wrapper = mount(EmptyState, {
        props: {}
      })

      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).toBe('No results found')
    })

    it('uses custom message when provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells',
          message: 'Custom empty state message'
        }
      })

      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).toBe('Custom empty state message')
    })
  })

  describe('Clear Filters button', () => {
    it('shows Clear Filters button when hasFilters is true', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells',
          hasFilters: true
        }
      })

      const button = wrapper.find('[data-testid="clear-filters-button"]')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Clear All Filters')
    })

    it('hides Clear Filters button when hasFilters is false', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells',
          hasFilters: false
        }
      })

      const button = wrapper.find('[data-testid="clear-filters-button"]')
      expect(button.exists()).toBe(false)
    })

    it('hides Clear Filters button when hasFilters is undefined', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells'
        }
      })

      const button = wrapper.find('[data-testid="clear-filters-button"]')
      expect(button.exists()).toBe(false)
    })

    it('emits clearFilters event when button clicked', async () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells',
          hasFilters: true
        }
      })

      const button = wrapper.find('[data-testid="clear-filters-button"]')
      await button.trigger('click')

      expect(wrapper.emitted('clearFilters')).toBeTruthy()
      expect(wrapper.emitted('clearFilters')).toHaveLength(1)
    })
  })

  describe('layout and styling', () => {
    it('renders icon correctly', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells'
        }
      })

      const icon = wrapper.find('[data-testid="empty-state-icon"]')
      expect(icon.exists()).toBe(true)
    })

    it('renders subtitle text', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells'
        }
      })

      const subtitle = wrapper.find('[data-testid="empty-state-subtitle"]')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('Try adjusting your filters or searching for different keywords')
    })

    it('has correct container structure', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells'
        }
      })

      // Should have outer padding container
      const container = wrapper.find('[data-testid="empty-state-container"]')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('py-12')
    })

    it('has centered text layout', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells'
        }
      })

      const innerContainer = wrapper.find('[data-testid="empty-state-inner"]')
      expect(innerContainer.exists()).toBe(true)
      expect(innerContainer.classes()).toContain('text-center')
      expect(innerContainer.classes()).toContain('py-8')
    })
  })

  describe('edge cases', () => {
    it('handles empty string entity name', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: ''
        }
      })

      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).toBe('No results found')
    })

    it('handles entity name with capitalization', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'Magic Items'
        }
      })

      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).toBe('No Magic Items found')
    })

    it('custom message takes precedence over entity name', () => {
      const wrapper = mount(EmptyState, {
        props: {
          entityName: 'spells',
          message: 'Search returned no results'
        }
      })

      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).toBe('Search returned no results')
      expect(wrapper.find('[data-testid="empty-state-heading"]').text()).not.toContain('spells')
    })
  })
})

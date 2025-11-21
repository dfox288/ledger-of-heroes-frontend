import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsCount from '~/components/ui/list/ResultsCount.vue'

describe('UiListResultsCount', () => {
  describe('basic rendering', () => {
    it('renders from-to-total format correctly', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 15,
          total: 150
        }
      })

      expect(wrapper.text()).toContain('Showing 1-15 of 150')
    })

    it('applies correct styling classes', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 15,
          total: 150
        }
      })

      const container = wrapper.find('.text-sm')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('text-gray-600')
      expect(container.classes()).toContain('dark:text-gray-400')
    })
  })

  describe('entity name handling', () => {
    it('pluralizes entity name when provided', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 15,
          total: 150,
          entityName: 'spell'
        }
      })

      expect(wrapper.text()).toContain('spells')
    })

    it('uses "results" when entity name not provided', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 15,
          total: 150
        }
      })

      expect(wrapper.text()).toContain('results')
    })

    it('handles already plural entity names', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 15,
          total: 150,
          entityName: 'items'
        }
      })

      // Should not double-pluralize
      expect(wrapper.text()).toContain('items')
      expect(wrapper.text()).not.toContain('itemss')
    })
  })

  describe('number formatting', () => {
    it('handles single result page correctly', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 5,
          total: 5
        }
      })

      expect(wrapper.text()).toContain('Showing 1-5 of 5')
    })

    it('handles zero results correctly', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 0,
          to: 0,
          total: 0
        }
      })

      expect(wrapper.text()).toContain('Showing 0-0 of 0')
    })

    it('handles large numbers correctly', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 101,
          to: 125,
          total: 9999
        }
      })

      expect(wrapper.text()).toContain('Showing 101-125 of 9999')
    })

    it('handles last page with partial results', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 141,
          to: 150,
          total: 150
        }
      })

      expect(wrapper.text()).toContain('Showing 141-150 of 150')
    })
  })

  describe('spacing and layout', () => {
    it('has correct margin class for spacing', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 15,
          total: 150
        }
      })

      const container = wrapper.find('.mb-4')
      expect(container.exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles single item range (from equals to)', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 1,
          total: 1
        }
      })

      expect(wrapper.text()).toContain('Showing 1-1 of 1')
    })

    it('handles entity names with special characters', () => {
      const wrapper = mount(ResultsCount, {
        props: {
          from: 1,
          to: 10,
          total: 50,
          entityName: 'item & equipment'
        }
      })

      // Should handle special characters gracefully
      expect(wrapper.text()).toMatch(/Showing 1-10 of 50/)
    })

    it('renders correctly with different entity names', () => {
      const entities = ['spell', 'item', 'race', 'class', 'background', 'feat']

      entities.forEach(entity => {
        const wrapper = mount(ResultsCount, {
          props: {
            from: 1,
            to: 10,
            total: 100,
            entityName: entity
          }
        })

        expect(wrapper.text()).toMatch(/Showing 1-10 of 100/)
      })
    })
  })
})

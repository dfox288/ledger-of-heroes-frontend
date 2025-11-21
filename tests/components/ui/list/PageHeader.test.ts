import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from '~/components/ui/list/PageHeader.vue'

describe('UiListPageHeader', () => {
  describe('title rendering', () => {
    it('renders title correctly', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells'
        }
      })

      expect(wrapper.text()).toContain('Spells')
    })

    it('applies correct heading styles', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells'
        }
      })

      const heading = wrapper.find('h1')
      expect(heading.exists()).toBe(true)
      expect(heading.classes()).toContain('text-4xl')
      expect(heading.classes()).toContain('font-bold')
    })
  })

  describe('count display', () => {
    it('shows count when total is provided', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 150
        }
      })

      expect(wrapper.text()).toContain('150')
    })

    it('does not show count when total is undefined', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: undefined
        }
      })

      // Title should exist but not the count
      expect(wrapper.text()).toContain('Spells')
      expect(wrapper.text()).not.toMatch(/\(\d+/)
    })

    it('hides count when loading is true', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 150,
          loading: true
        }
      })

      // Count should not be visible during loading
      expect(wrapper.text()).not.toContain('150')
    })

    it('shows "filtered" text when hasActiveFilters is true', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 50,
          hasActiveFilters: true
        }
      })

      expect(wrapper.text()).toContain('filtered')
    })

    it('shows "total" text when hasActiveFilters is false', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 150,
          hasActiveFilters: false
        }
      })

      expect(wrapper.text()).toContain('total')
    })

    it('applies correct count styling', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 150
        }
      })

      const countSpan = wrapper.find('.text-2xl')
      expect(countSpan.exists()).toBe(true)
      expect(countSpan.classes()).toContain('text-gray-500')
      expect(countSpan.classes()).toContain('font-normal')
    })
  })

  describe('description rendering', () => {
    it('renders description when provided', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          description: 'Browse and search D&D 5e spells'
        }
      })

      expect(wrapper.text()).toContain('Browse and search D&D 5e spells')
    })

    it('does not render description section when omitted', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells'
        }
      })

      // Only title should be present
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs).toHaveLength(0)
    })

    it('applies correct description styling', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          description: 'Test description'
        }
      })

      const description = wrapper.find('p')
      expect(description.exists()).toBe(true)
      expect(description.classes()).toContain('text-gray-600')
      expect(description.classes()).toContain('dark:text-gray-400')
    })
  })

  describe('layout and structure', () => {
    it('has correct container classes', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells'
        }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('mb-8')
    })

    it('has correct heading spacing', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          description: 'Test'
        }
      })

      const heading = wrapper.find('h1')
      expect(heading.classes()).toContain('mb-2')
    })
  })

  describe('edge cases', () => {
    it('handles zero count correctly', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 0
        }
      })

      expect(wrapper.text()).toContain('0')
    })

    it('handles very large counts', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 999999
        }
      })

      expect(wrapper.text()).toContain('999999')
    })

    it('handles long titles without breaking layout', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Very Long Title That Should Not Break The Layout'
        }
      })

      expect(wrapper.text()).toContain('Very Long Title That Should Not Break The Layout')
    })

    it('handles both filters and loading states correctly', () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: 'Spells',
          total: 100,
          hasActiveFilters: true,
          loading: true
        }
      })

      // Count should be hidden during loading regardless of filters
      expect(wrapper.text()).not.toContain('100')
      expect(wrapper.text()).not.toContain('filtered')
    })
  })
})

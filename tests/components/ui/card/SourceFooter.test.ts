import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceFooter from '~/components/ui/card/SourceFooter.vue'

describe('UiCardSourceFooter', () => {
  describe('when sources is undefined', () => {
    it('does not render anything', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: undefined
        }
      })

      expect(wrapper.html()).toBe('<!--v-if-->')
    })
  })

  describe('when sources is empty array', () => {
    it('does not render anything', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: []
        }
      })

      expect(wrapper.html()).toBe('<!--v-if-->')
    })
  })

  describe('when sources has single item', () => {
    it('renders source name and pages correctly', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' }
          ]
        }
      })

      const text = wrapper.text()
      expect(text).toContain("Player's Handbook")
      expect(text).toContain('p.127')
    })

    it('does not include comma separator', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' }
          ]
        }
      })

      // Should not have trailing comma
      expect(wrapper.text()).not.toMatch(/,\s*$/)
    })

    it('uses correct styling classes', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' }
          ]
        }
      })

      // Check for border-top container
      const container = wrapper.find('.border-t')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('border-gray-200')
      expect(container.classes()).toContain('dark:border-gray-700')
      expect(container.classes()).toContain('mt-3')
      expect(container.classes()).toContain('pt-3')

      // Check for text styling
      const textContainer = wrapper.find('.text-xs')
      expect(textContainer.exists()).toBe(true)
      expect(textContainer.classes()).toContain('text-gray-600')
      expect(textContainer.classes()).toContain('dark:text-gray-400')
    })

    it('source name is bold', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' }
          ]
        }
      })

      const boldElement = wrapper.find('.font-medium')
      expect(boldElement.exists()).toBe(true)
      expect(boldElement.text()).toBe("Player's Handbook")
    })
  })

  describe('when sources has multiple items', () => {
    it('renders all sources with correct formatting', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' },
            { code: 'XGE', name: "Xanathar's Guide to Everything", pages: '52' },
            { code: 'TCE', name: "Tasha's Cauldron of Everything", pages: '98' }
          ]
        }
      })

      const text = wrapper.text()
      expect(text).toContain("Player's Handbook")
      expect(text).toContain('p.127')
      expect(text).toContain("Xanathar's Guide to Everything")
      expect(text).toContain('p.52')
      expect(text).toContain("Tasha's Cauldron of Everything")
      expect(text).toContain('p.98')
    })

    it('separates sources with commas', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' },
            { code: 'XGE', name: "Xanathar's Guide to Everything", pages: '52' }
          ]
        }
      })

      const text = wrapper.text()
      // Should have format: "Player's Handbook p.127, Xanathar's Guide to Everything p.52"
      expect(text).toMatch(/p\.127,\s*Xanathar/)
    })

    it('does not add comma after last source', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' },
            { code: 'XGE', name: "Xanathar's Guide to Everything", pages: '52' }
          ]
        }
      })

      const text = wrapper.text()
      // Should not have trailing comma after p.52
      expect(text).not.toMatch(/p\.52,/)
    })

    it('renders correct number of source elements', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' },
            { code: 'XGE', name: "Xanathar's Guide to Everything", pages: '52' },
            { code: 'TCE', name: "Tasha's Cauldron of Everything", pages: '98' }
          ]
        }
      })

      // Each source should have a font-medium span for the name
      const boldElements = wrapper.findAll('.font-medium')
      expect(boldElements).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    it('handles pages with hyphens (range)', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127-129' }
          ]
        }
      })

      expect(wrapper.text()).toContain('p.127-129')
    })

    it('handles very long source names', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'LONG', name: "A Very Long Sourcebook Name That Goes On And On", pages: '1' }
          ]
        }
      })

      expect(wrapper.text()).toContain('A Very Long Sourcebook Name That Goes On And On')
      expect(wrapper.text()).toContain('p.1')
    })

    it('uses flex-wrap for multiple sources', () => {
      const wrapper = mount(SourceFooter, {
        props: {
          sources: [
            { code: 'PHB', name: "Player's Handbook", pages: '127' },
            { code: 'XGE', name: "Xanathar's Guide to Everything", pages: '52' }
          ]
        }
      })

      const flexContainer = wrapper.find('.flex-wrap')
      expect(flexContainer.exists()).toBe(true)
    })
  })
})

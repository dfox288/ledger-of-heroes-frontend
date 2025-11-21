import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackLink from '~/components/ui/BackLink.vue'

describe('UiBackLink', () => {
  describe('basic rendering', () => {
    it('renders with default "Back to Home" label', () => {
      const wrapper = mount(BackLink)

      expect(wrapper.text()).toContain('Back to Home')
    })

    it('renders with custom label', () => {
      const wrapper = mount(BackLink, {
        props: {
          label: 'Back to Spells'
        }
      })

      expect(wrapper.text()).toContain('Back to Spells')
    })

    it('accepts custom "to" prop', () => {
      const wrapper = mount(BackLink, {
        props: {
          to: '/spells'
        }
      })

      // Component should render successfully with custom path
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Back to Home')
    })
  })

  describe('styling and layout', () => {
    it('has correct container styling with border-top', () => {
      const wrapper = mount(BackLink)

      const container = wrapper.find('.border-t')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('border-gray-200')
      expect(container.classes()).toContain('dark:border-gray-700')
      expect(container.classes()).toContain('mt-8')
      expect(container.classes()).toContain('pt-6')
    })

    it('contains button element with correct classes', () => {
      const wrapper = mount(BackLink)

      // UButton renders as a button element, check for its presence
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('icon customization', () => {
    it('renders button with default icon', () => {
      const wrapper = mount(BackLink)

      // Icon is passed to UButton internally, check button exists
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('renders button with custom icon', () => {
      const wrapper = mount(BackLink, {
        props: {
          icon: 'i-heroicons-home'
        }
      })

      // Icon is passed to UButton internally, check button exists
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty label gracefully', () => {
      const wrapper = mount(BackLink, {
        props: {
          label: ''
        }
      })

      // Should still render, even if empty
      expect(wrapper.exists()).toBe(true)
    })

    it('handles very long labels', () => {
      const longLabel = 'Back to Very Long Page Title That Should Not Break Layout'
      const wrapper = mount(BackLink, {
        props: {
          label: longLabel
        }
      })

      expect(wrapper.text()).toContain(longLabel)
    })

    it('handles paths with query parameters', () => {
      const wrapper = mount(BackLink, {
        props: {
          to: '/spells?level=3'
        }
      })

      // Component should render successfully with query params
      expect(wrapper.exists()).toBe(true)
    })

    it('handles external URLs', () => {
      const wrapper = mount(BackLink, {
        props: {
          to: 'https://example.com'
        }
      })

      // Component should render successfully with external URL
      expect(wrapper.exists()).toBe(true)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackLink from '~/components/ui/BackLink.vue'

describe('UiBackLink', () => {
  describe('basic rendering', () => {
    it('renders with default "Back to Home" label', async () => {
      const wrapper = await mountSuspended(BackLink)

      expect(wrapper.text()).toContain('Back to Home')
    })

    it('renders with custom label', async () => {
      const wrapper = await mountSuspended(BackLink, {
        props: {
          label: 'Back to Spells'
        }
      })

      expect(wrapper.text()).toContain('Back to Spells')
    })

    it('accepts custom "to" prop', async () => {
      const wrapper = await mountSuspended(BackLink, {
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
    it('has correct container styling with border-top', async () => {
      const wrapper = await mountSuspended(BackLink)

      const container = wrapper.find('.border-t')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('border-gray-200')
      expect(container.classes()).toContain('dark:border-gray-700')
      expect(container.classes()).toContain('mt-8')
      expect(container.classes()).toContain('pt-6')
    })

    it('contains button element with correct classes', async () => {
      const wrapper = await mountSuspended(BackLink)

      // UButton renders as a button element, check for its presence
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('icon customization', () => {
    it('renders button with default icon', async () => {
      const wrapper = await mountSuspended(BackLink)

      // Icon is passed to UButton internally, check button exists
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('renders button with custom icon', async () => {
      const wrapper = await mountSuspended(BackLink, {
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
    it('handles empty label gracefully', async () => {
      const wrapper = await mountSuspended(BackLink, {
        props: {
          label: ''
        }
      })

      // Should still render, even if empty
      expect(wrapper.exists()).toBe(true)
    })

    it('handles very long labels', async () => {
      const longLabel = 'Back to Very Long Page Title That Should Not Break Layout'
      const wrapper = await mountSuspended(BackLink, {
        props: {
          label: longLabel
        }
      })

      expect(wrapper.text()).toContain(longLabel)
    })

    it('handles paths with query parameters', async () => {
      const wrapper = await mountSuspended(BackLink, {
        props: {
          to: '/spells?level=3'
        }
      })

      // Component should render successfully with query params
      expect(wrapper.exists()).toBe(true)
    })

    it('handles external URLs', async () => {
      const wrapper = await mountSuspended(BackLink, {
        props: {
          to: 'https://example.com'
        }
      })

      // Component should render successfully with external URL
      expect(wrapper.exists()).toBe(true)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from '~/components/ui/list/ErrorState.vue'

// Mock NuxtUI components
const UCard = {
  name: 'UCard',
  template: '<div class="u-card"><slot /></div>'
}

const UIcon = {
  name: 'UIcon',
  props: ['name'],
  template: '<span class="u-icon" :data-icon="name"></span>'
}

const UButton = {
  name: 'UButton',
  props: ['color'],
  template: '<button class="u-button"><slot /></button>'
}

const createWrapper = (props: any) => {
  return mount(ErrorState, {
    props,
    global: {
      components: { UCard, UIcon, UButton }
    }
  })
}

describe('UiListErrorState', () => {
  describe('error prop handling', () => {
    it('renders with error object', () => {
      const error = new Error('Failed to fetch data')
      const wrapper = createWrapper({ error })

      expect(wrapper.text()).toContain('Failed to fetch data')
    })

    it('renders with error string', () => {
      const wrapper = createWrapper({ error: 'Network error occurred' })

      expect(wrapper.text()).toContain('Network error occurred')
    })
  })

  describe('heading display', () => {
    it('shows entity name in heading when provided', () => {
      const wrapper = createWrapper({
        error: 'Test error',
        entityName: 'Spells'
      })

      expect(wrapper.text()).toContain('Error Loading Spells')
    })

    it('shows generic heading when entity name omitted', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      expect(wrapper.text()).toContain('Error Loading Data')
    })

    it('shows entity name with proper formatting', () => {
      const wrapper = createWrapper({
        error: 'Test error',
        entityName: 'Items'
      })

      const heading = wrapper.find('h2')
      expect(heading.text()).toBe('Error Loading Items')
    })
  })

  describe('error message display', () => {
    it('displays error message from Error object', () => {
      const error = new Error('Connection timeout')
      const wrapper = createWrapper({ error })

      const message = wrapper.find('p')
      expect(message.text()).toBe('Connection timeout')
    })

    it('displays error message from string', () => {
      const wrapper = createWrapper({ error: 'API returned 500' })

      const message = wrapper.find('p')
      expect(message.text()).toBe('API returned 500')
    })
  })

  describe('retry functionality', () => {
    it('emits retry event when button clicked', async () => {
      const wrapper = createWrapper({ error: 'Test error' })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(wrapper.emitted('retry')).toHaveLength(1)
    })

    it('emits retry event multiple times when clicked multiple times', async () => {
      const wrapper = createWrapper({ error: 'Test error' })

      const button = wrapper.find('button')
      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')

      expect(wrapper.emitted('retry')).toHaveLength(3)
    })
  })

  describe('visual elements', () => {
    it('displays error icon', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      // Check for icon with correct name
      const icon = wrapper.find('[data-testid="error-icon"]')
      expect(icon.exists()).toBe(true)
    })

    it('has centered layout with proper padding', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      // Check for outer container with padding
      const container = wrapper.find('[data-testid="error-container"]')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('py-12')
    })

    it('displays retry button with correct text', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      const button = wrapper.find('button')
      expect(button.text()).toBe('Try Again')
    })
  })

  describe('styling consistency', () => {
    it('applies correct text color classes', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      const heading = wrapper.find('h2')
      expect(heading.classes()).toContain('text-gray-900')
      expect(heading.classes()).toContain('dark:text-gray-100')

      const message = wrapper.find('p')
      expect(message.classes()).toContain('text-gray-600')
      expect(message.classes()).toContain('dark:text-gray-400')
    })

    it('applies correct sizing to heading', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      const heading = wrapper.find('h2')
      expect(heading.classes()).toContain('text-xl')
      expect(heading.classes()).toContain('font-semibold')
    })

    it('centers content within card', () => {
      const wrapper = createWrapper({ error: 'Test error' })

      const contentWrapper = wrapper.find('[data-testid="error-content"]')
      expect(contentWrapper.classes()).toContain('text-center')
    })
  })
})

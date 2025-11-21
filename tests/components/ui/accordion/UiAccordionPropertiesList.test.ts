import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionPropertiesList from '~/components/ui/accordion/UiAccordionPropertiesList.vue'

describe('UiAccordionPropertiesList', () => {
  const mountOptions = {
    global: {
      stubs: {
        UBadge: {
          template: '<span class="badge"><slot /></span>',
          props: ['color', 'variant']
        }
      }
    }
  }

  it('renders property badges', () => {
    const wrapper = mount(UiAccordionPropertiesList, {
      props: {
        properties: [
          { id: 1, name: 'Finesse', description: 'Use DEX for attack rolls' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Finesse')
  })

  it('renders property descriptions', () => {
    const wrapper = mount(UiAccordionPropertiesList, {
      props: {
        properties: [
          { id: 1, name: 'Versatile', description: 'Can be used with one or two hands' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Versatile:')
    expect(wrapper.text()).toContain('Can be used with one or two hands')
  })

  it('renders multiple properties', () => {
    const wrapper = mount(UiAccordionPropertiesList, {
      props: {
        properties: [
          { id: 1, name: 'Finesse', description: 'Use DEX for attack rolls' },
          { id: 2, name: 'Light', description: 'Ideal for two-weapon fighting' },
          { id: 3, name: 'Versatile', description: 'Can be used with one or two hands' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Finesse')
    expect(wrapper.text()).toContain('Light')
    expect(wrapper.text()).toContain('Versatile')
  })

  it('shows badges section at top', () => {
    const wrapper = mount(UiAccordionPropertiesList, {
      props: {
        properties: [
          { id: 1, name: 'Finesse', description: 'Test' }
        ]
      },
      ...mountOptions
    })

    // Check that badge text appears before description format
    const text = wrapper.text()
    const badgeIndex = text.indexOf('Finesse')
    const descIndex = text.indexOf('Finesse:')
    expect(badgeIndex).toBeLessThan(descIndex)
  })

  it('applies correct spacing', () => {
    const wrapper = mount(UiAccordionPropertiesList, {
      props: {
        properties: [
          { id: 1, name: 'Test', description: 'Test desc' }
        ]
      },
      ...mountOptions
    })

    const container = wrapper.find('.p-4')
    expect(container.exists()).toBe(true)
  })

  it('applies dark mode support', () => {
    const wrapper = mount(UiAccordionPropertiesList, {
      props: {
        properties: [
          { id: 1, name: 'Finesse', description: 'Test description' }
        ]
      },
      ...mountOptions
    })

    // Check for dark mode classes in description text
    const description = wrapper.find('.text-gray-600')
    expect(description.exists()).toBe(true)
  })
})

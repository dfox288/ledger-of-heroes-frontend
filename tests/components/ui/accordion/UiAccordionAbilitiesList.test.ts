import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionAbilitiesList from '~/components/ui/accordion/UiAccordionAbilitiesList.vue'

describe('UiAccordionAbilitiesList', () => {
  it('renders ability names', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: {
        abilities: [
          { id: 1, name: 'Spell Storing', description: 'Store a spell in the ring' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Spell Storing')
  })

  it('renders ability descriptions', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: {
        abilities: [
          { id: 1, name: 'Fireball', description: 'Cast a fireball once per day' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Cast a fireball once per day')
  })

  it('renders multiple abilities', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: {
        abilities: [
          { id: 1, name: 'Ability 1', description: 'Description 1' },
          { id: 2, name: 'Ability 2', description: 'Description 2' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Ability 1')
    expect(wrapper.text()).toContain('Ability 2')
  })

  it('applies correct spacing', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: {
        abilities: [
          { id: 1, name: 'Test', description: 'Test' }
        ]
      }
    })

    const container = wrapper.find('.p-4')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('space-y-4')
  })

  it('applies highlighted background', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: {
        abilities: [
          { id: 1, name: 'Test', description: 'Test' }
        ]
      }
    })

    const card = wrapper.find('.p-4.rounded-lg')
    expect(card.exists()).toBe(true)
  })

  it('applies dark mode support', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: {
        abilities: [
          { id: 1, name: 'Test', description: 'Test description' }
        ]
      }
    })

    // Name should have dark mode classes
    const name = wrapper.find('.font-semibold')
    expect(name.classes()).toContain('text-gray-900')
    expect(name.classes()).toContain('dark:text-gray-100')

    // Description should have dark mode classes
    const description = wrapper.find('.text-gray-700')
    expect(description.classes()).toContain('dark:text-gray-300')
  })
})

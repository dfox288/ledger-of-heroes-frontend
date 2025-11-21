import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionDamageEffects from '~/components/ui/accordion/UiAccordionDamageEffects.vue'

describe('UiAccordionDamageEffects', () => {
  it('renders effect descriptions', () => {
    const wrapper = mount(UiAccordionDamageEffects, {
      props: {
        effects: [
          { id: 1, description: 'Fire damage', dice_formula: '8d6', min_spell_slot: 3 }
        ]
      }
    })

    expect(wrapper.text()).toContain('Fire damage')
  })

  it('renders dice formulas prominently', () => {
    const wrapper = mount(UiAccordionDamageEffects, {
      props: {
        effects: [
          { id: 1, description: 'Fire damage', dice_formula: '8d6', min_spell_slot: 3 }
        ]
      }
    })

    expect(wrapper.text()).toContain('8d6')

    // Formula should be in large, bold, colored text
    const formula = wrapper.find('.text-2xl.font-bold')
    expect(formula.exists()).toBe(true)
  })

  it('renders spell slot levels', () => {
    const wrapper = mount(UiAccordionDamageEffects, {
      props: {
        effects: [
          { id: 1, description: 'Fire damage', dice_formula: '8d6', min_spell_slot: 3 }
        ]
      }
    })

    expect(wrapper.text()).toContain('Spell Slot Level 3')
  })

  it('renders multiple effects', () => {
    const wrapper = mount(UiAccordionDamageEffects, {
      props: {
        effects: [
          { id: 1, description: 'At 3rd level', dice_formula: '8d6', min_spell_slot: 3 },
          { id: 2, description: 'At 4th level', dice_formula: '9d6', min_spell_slot: 4 },
          { id: 3, description: 'At 5th level', dice_formula: '10d6', min_spell_slot: 5 }
        ]
      }
    })

    expect(wrapper.text()).toContain('8d6')
    expect(wrapper.text()).toContain('9d6')
    expect(wrapper.text()).toContain('10d6')
  })

  it('applies correct spacing', () => {
    const wrapper = mount(UiAccordionDamageEffects, {
      props: {
        effects: [
          { id: 1, description: 'Test', dice_formula: '1d6', min_spell_slot: 1 }
        ]
      }
    })

    const container = wrapper.find('.p-4')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('space-y-3')
  })

  it('applies dark mode support', () => {
    const wrapper = mount(UiAccordionDamageEffects, {
      props: {
        effects: [
          { id: 1, description: 'Test', dice_formula: '8d6', min_spell_slot: 3 }
        ]
      }
    })

    // Description should have dark mode
    const description = wrapper.find('.font-medium')
    expect(description.classes()).toContain('text-gray-900')
    expect(description.classes()).toContain('dark:text-gray-100')

    // Formula should have dark mode
    const formula = wrapper.find('.text-primary-600')
    expect(formula.classes()).toContain('dark:text-primary-400')
  })
})

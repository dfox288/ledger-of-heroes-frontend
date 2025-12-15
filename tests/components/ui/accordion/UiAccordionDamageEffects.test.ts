import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionDamageEffects from '~/components/ui/accordion/UiAccordionDamageEffects.vue'
import {
  mockDamageEffect3rdLevel,
  mockDamageEffectsArray,
  mockCantripDamageLevel5,
  mockCantripEffectsArray,
  mockHealingEffect,
  mockCombinedScaling
} from '#tests/fixtures/damageEffects'

describe('UiAccordionDamageEffects', () => {
  describe('basic rendering', () => {
    it('renders effect descriptions', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockDamageEffect3rdLevel] }
      })

      expect(wrapper.text()).toContain('Fire damage')
    })

    it('renders dice formulas prominently', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockDamageEffect3rdLevel] }
      })

      expect(wrapper.text()).toContain('8d6')

      // Formula should be in large, bold, colored text
      const formula = wrapper.find('.text-2xl.font-bold')
      expect(formula.exists()).toBe(true)
    })

    it('renders multiple effects', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: mockDamageEffectsArray }
      })

      expect(wrapper.text()).toContain('8d6')
      expect(wrapper.text()).toContain('9d6')
      expect(wrapper.text()).toContain('10d6')
    })
  })

  describe('spell slot level display', () => {
    it('renders spell slot levels', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockDamageEffect3rdLevel] }
      })

      expect(wrapper.text()).toContain('Spell Slot Level 3')
    })

    it('does not show spell slot level for cantrips (level 0)', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: mockCantripEffectsArray }
      })

      expect(wrapper.text()).not.toContain('Spell Slot Level 0')
    })
  })

  describe('character level display', () => {
    it('renders min_character_level when provided', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockCantripDamageLevel5] }
      })

      expect(wrapper.text()).toContain('Character Level 5+')
    })

    it('does not render min_character_level when null', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockDamageEffect3rdLevel] }
      })

      expect(wrapper.text()).not.toContain('Character Level')
    })

    it('renders both spell slot level and character level when both provided', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockCombinedScaling] }
      })

      expect(wrapper.text()).toContain('Spell Slot Level 5')
      expect(wrapper.text()).toContain('Character Level 11+')
    })

    it('handles cantrip (level 0) with character level scaling', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: mockCantripEffectsArray }
      })

      // Should show character levels but not spell slot levels for cantrips
      expect(wrapper.text()).toContain('Character Level 1+')
      expect(wrapper.text()).toContain('Character Level 5+')
      expect(wrapper.text()).not.toContain('Spell Slot Level 0')
    })
  })

  describe('non-damage effects', () => {
    it('renders effects with type "other" (non-damage effects)', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockHealingEffect] }
      })

      expect(wrapper.text()).toContain('Hit Points')
      expect(wrapper.text()).toContain('5d8')
      expect(wrapper.text()).toContain('Spell Slot Level 1')
    })

    it('renders multiple "other" type effects at different spell levels', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: {
          effects: [
            {
              id: 1,
              description: 'Hit Points',
              dice_formula: '5d8',
              min_spell_slot: 1,
              min_character_level: null
            },
            {
              id: 2,
              description: 'Hit Points',
              dice_formula: '7d8',
              min_spell_slot: 3,
              min_character_level: null
            },
            {
              id: 3,
              description: 'Hit Points',
              dice_formula: '9d8',
              min_spell_slot: 5,
              min_character_level: null
            }
          ]
        }
      })

      expect(wrapper.text()).toContain('5d8')
      expect(wrapper.text()).toContain('7d8')
      expect(wrapper.text()).toContain('9d8')
      expect(wrapper.text()).toContain('Spell Slot Level 1')
      expect(wrapper.text()).toContain('Spell Slot Level 3')
      expect(wrapper.text()).toContain('Spell Slot Level 5')
    })
  })

  describe('visual styling', () => {
    it('applies correct spacing', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockDamageEffect3rdLevel] }
      })

      const container = wrapper.find('.p-4')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('space-y-3')
    })

    it('applies dark mode support', () => {
      const wrapper = mount(UiAccordionDamageEffects, {
        props: { effects: [mockDamageEffect3rdLevel] }
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
})

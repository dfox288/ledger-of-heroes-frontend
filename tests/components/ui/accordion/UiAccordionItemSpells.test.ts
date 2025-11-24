import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionItemSpells from '~/components/ui/accordion/UiAccordionItemSpells.vue'
import {
  mockSpellFixedCost,
  mockSpellVariableCost,
  mockSpellWithUsageLimit,
  mockSpellWithLevelReq,
  mockItemSpellsArray
} from '../../../fixtures/spells'

describe('UiAccordionItemSpells', () => {
  describe('spell list rendering', () => {
    it('renders spell count correctly', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: mockItemSpellsArray }
      })

      // Verify all spells are rendered (check by counting spell level displays)
      expect(wrapper.text()).toContain('1st level')
      expect(wrapper.text()).toContain('2nd level')
      expect(wrapper.text()).toContain('5th level')
    })

    it('displays spell levels correctly', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: mockItemSpellsArray }
      })

      expect(wrapper.text()).toContain('1st level')
      expect(wrapper.text()).toContain('2nd level')
      expect(wrapper.text()).toContain('5th level')
    })

    it('handles empty spells array', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: [] }
      })

      expect(wrapper.text()).toBe('')
    })
  })

  describe('charges cost display', () => {
    it('displays single charge cost', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: [mockSpellFixedCost] }
      })

      expect(wrapper.text()).toContain('2 charges')
    })

    it('displays charge range when min and max differ', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: [mockSpellVariableCost] }
      })

      expect(wrapper.text()).toContain('1-4 charges')
    })

    it('displays charge formula when provided', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: [mockSpellVariableCost] }
      })

      expect(wrapper.text()).toContain('1 per spell level')
    })

    it('uses singular "charge" for cost of 1', () => {
      const spell = [{
        id: 100,
        name: 'Test Spell',
        slug: 'test-spell',
        level: 1,
        charges_cost_min: 1,
        charges_cost_max: 1,
        charges_cost_formula: null,
        usage_limit: null,
        level_requirement: null
      }]

      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: spell }
      })

      expect(wrapper.text()).toContain('1 charge')
      expect(wrapper.text()).not.toContain('1 charges')
    })
  })

  describe('optional fields', () => {
    it('displays usage limit when provided', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: [mockSpellWithUsageLimit] }
      })

      expect(wrapper.text()).toContain('3/day')
    })

    it('displays level requirement when provided', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: [mockSpellWithLevelReq] }
      })

      expect(wrapper.text()).toContain('Requires character level 17')
    })

    it('handles spell with both usage limit and level requirement', () => {
      const spell = [{
        id: 100,
        name: 'Test Spell',
        slug: 'test-spell',
        level: 9,
        charges_cost_min: 7,
        charges_cost_max: 7,
        charges_cost_formula: null,
        usage_limit: '1/day',
        level_requirement: 17
      }]

      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: spell }
      })

      expect(wrapper.text()).toContain('1/day')
      expect(wrapper.text()).toContain('Requires character level 17')
    })
  })

  describe('spell links', () => {
    it('renders spell names as links to spell detail pages', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: mockItemSpellsArray }
      })

      // NuxtLink components exist in HTML even if not rendered as <a> in test environment
      const html = wrapper.html()
      expect(html).toContain('/spells/cure-wounds')
      expect(html).toContain('/spells/lesser-restoration')
      expect(html).toContain('/spells/mass-cure-wounds')
    })
  })

  describe('visual styling', () => {
    it('applies consistent padding', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: mockItemSpellsArray }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('p-4')
    })

    it('applies spacing between spells', () => {
      const wrapper = mount(UiAccordionItemSpells, {
        props: { spells: mockItemSpellsArray }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('space-y-4')
    })
  })
})

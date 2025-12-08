// tests/components/character/sheet/SpellSlots.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellSlots from '~/components/character/sheet/SpellSlots.vue'

describe('SpellSlots', () => {
  describe('standard spell slots', () => {
    it('displays spell slots for each level', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 4, 2: 3, 3: 2 }
        }
      })

      // Check level labels
      expect(wrapper.text()).toContain('1st')
      expect(wrapper.text()).toContain('2nd')
      expect(wrapper.text()).toContain('3rd')

      // Check we have the right number of slots per level
      const level1Slots = wrapper.findAll('[data-testid="slot-1"]')
      const level2Slots = wrapper.findAll('[data-testid="slot-2"]')
      const level3Slots = wrapper.findAll('[data-testid="slot-3"]')

      expect(level1Slots).toHaveLength(4)
      expect(level2Slots).toHaveLength(3)
      expect(level3Slots).toHaveLength(2)
    })

    it('only shows levels that have slots', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 2, 3: 1 } // No level 2
        }
      })

      expect(wrapper.text()).toContain('1st')
      expect(wrapper.text()).not.toContain('2nd')
      expect(wrapper.text()).toContain('3rd')
    })

    it('handles empty spell slots object', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: {}
        }
      })

      // Should not show "Spell Slots" section
      expect(wrapper.text()).not.toContain('1st')
      expect(wrapper.text()).not.toContain('2nd')
    })

    it('uses spell color theme', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 2 }
        }
      })

      // Check for spell color in slots (should have spell theme)
      const slots = wrapper.findAll('[data-testid="slot-1"]')
      expect(slots[0].classes().join(' ')).toMatch(/spell/)
    })

    it('handles all 9 spell levels', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: {
            1: 4,
            2: 3,
            3: 3,
            4: 3,
            5: 2,
            6: 1,
            7: 1,
            8: 1,
            9: 1
          }
        }
      })

      expect(wrapper.text()).toContain('1st')
      expect(wrapper.text()).toContain('2nd')
      expect(wrapper.text()).toContain('3rd')
      expect(wrapper.text()).toContain('4th')
      expect(wrapper.text()).toContain('5th')
      expect(wrapper.text()).toContain('6th')
      expect(wrapper.text()).toContain('7th')
      expect(wrapper.text()).toContain('8th')
      expect(wrapper.text()).toContain('9th')
    })
  })

  describe('pact magic slots', () => {
    it('displays pact slots when provided', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 2 },
          pactSlots: { count: 2, level: 3 }
        }
      })

      expect(wrapper.text()).toContain('Pact Slots')
      expect(wrapper.text()).toContain('3rd level')

      const pactSlotElements = wrapper.findAll('[data-testid="pact-slot"]')
      expect(pactSlotElements).toHaveLength(2)
    })

    it('does not display pact slots when null', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 2 },
          pactSlots: null
        }
      })

      expect(wrapper.text()).not.toContain('Pact Slots')
    })

    it('does not display pact slots when undefined', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 2 }
        }
      })

      expect(wrapper.text()).not.toContain('Pact Slots')
    })

    it('handles warlock with only pact slots', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: {},
          pactSlots: { count: 2, level: 1 }
        }
      })

      expect(wrapper.text()).toContain('Pact Slots')
      expect(wrapper.text()).toContain('1st level')

      const pactSlotElements = wrapper.findAll('[data-testid="pact-slot"]')
      expect(pactSlotElements).toHaveLength(2)
    })

    it('formats pact slot levels correctly', async () => {
      const testCases = [
        { level: 1, expected: '1st level' },
        { level: 2, expected: '2nd level' },
        { level: 3, expected: '3rd level' },
        { level: 4, expected: '4th level' },
        { level: 5, expected: '5th level' }
      ]

      for (const { level, expected } of testCases) {
        const wrapper = await mountSuspended(SpellSlots, {
          props: {
            spellSlots: {},
            pactSlots: { count: 1, level }
          }
        })

        expect(wrapper.text()).toContain(expected)
      }
    })
  })

  describe('ordinal formatting', () => {
    it('formats spell level ordinals correctly', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: {
            1: 1,
            2: 1,
            3: 1,
            4: 1
          }
        }
      })

      expect(wrapper.text()).toContain('1st')
      expect(wrapper.text()).toContain('2nd')
      expect(wrapper.text()).toContain('3rd')
      expect(wrapper.text()).toContain('4th')
    })
  })

  describe('empty states', () => {
    it('shows nothing when no slots at all', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: {},
          pactSlots: null
        }
      })

      // Component should render but be essentially empty
      expect(wrapper.text()).not.toContain('Spell Slots')
      expect(wrapper.text()).not.toContain('Pact Slots')
    })

    it('handles zero slots gracefully', async () => {
      const wrapper = await mountSuspended(SpellSlots, {
        props: {
          spellSlots: { 1: 0, 2: 0 }
        }
      })

      // Levels with 0 slots should not be displayed
      expect(wrapper.text()).not.toContain('1st')
      expect(wrapper.text()).not.toContain('2nd')
    })
  })
})

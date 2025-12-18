// tests/components/character/sheet/StatSpellcasting.test.ts
/**
 * Tests for StatSpellcasting component
 *
 * @see Issue #766 - Add Spell Save DC and Spell Attack Bonus display to battle page
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatSpellcasting from '~/components/character/sheet/StatSpellcasting.vue'
import type { ClassSpellcastingInfo } from '~/types/character'

describe('StatSpellcasting', () => {
  describe('single-class spellcaster', () => {
    const singleClassSpellcasting: Record<string, ClassSpellcastingInfo> = {
      'phb:wizard': {
        ability: 'INT',
        spell_save_dc: 14,
        spell_attack_bonus: 6
      }
    }

    it('displays Spell DC and Attack Bonus', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: singleClassSpellcasting }
      })

      expect(wrapper.text()).toContain('14')
      expect(wrapper.text()).toContain('+6')
    })

    it('displays the spellcasting ability', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: singleClassSpellcasting }
      })

      expect(wrapper.text()).toContain('INT')
    })

    it('formats positive attack bonus with plus sign', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: singleClassSpellcasting }
      })

      expect(wrapper.text()).toContain('+6')
    })

    it('formats negative attack bonus without extra sign', async () => {
      const negativeBonus: Record<string, ClassSpellcastingInfo> = {
        'phb:wizard': {
          ability: 'INT',
          spell_save_dc: 8,
          spell_attack_bonus: -1
        }
      }

      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: negativeBonus }
      })

      expect(wrapper.text()).toContain('-1')
      expect(wrapper.text()).not.toContain('+-1')
    })
  })

  describe('multiclass spellcaster', () => {
    const multiclassSpellcasting: Record<string, ClassSpellcastingInfo> = {
      'phb:cleric': {
        ability: 'WIS',
        spell_save_dc: 13,
        spell_attack_bonus: 5
      },
      'phb:wizard': {
        ability: 'INT',
        spell_save_dc: 15,
        spell_attack_bonus: 7
      }
    }

    it('displays both class DCs and attack bonuses', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: multiclassSpellcasting }
      })

      // Cleric stats
      expect(wrapper.text()).toContain('13')
      expect(wrapper.text()).toContain('+5')
      expect(wrapper.text()).toContain('WIS')

      // Wizard stats
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('+7')
      expect(wrapper.text()).toContain('INT')
    })

    it('displays class names for multiclass', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: multiclassSpellcasting }
      })

      expect(wrapper.text()).toContain('Cleric')
      expect(wrapper.text()).toContain('Wizard')
    })
  })

  describe('visibility', () => {
    it('renders nothing when spellcasting is null', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: null }
      })

      expect(wrapper.text()).toBe('')
    })

    it('renders nothing when spellcasting is empty object', async () => {
      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: {} }
      })

      expect(wrapper.text()).toBe('')
    })
  })

  describe('data-testid', () => {
    it('has correct data-testid attribute', async () => {
      const singleClassSpellcasting: Record<string, ClassSpellcastingInfo> = {
        'phb:wizard': {
          ability: 'INT',
          spell_save_dc: 14,
          spell_attack_bonus: 6
        }
      }

      const wrapper = await mountSuspended(StatSpellcasting, {
        props: { spellcasting: singleClassSpellcasting }
      })

      expect(wrapper.find('[data-testid="stat-spellcasting"]').exists()).toBe(true)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellcastingCard from '~/components/character/stats/SpellcastingCard.vue'

describe('SpellcastingCard', () => {
  const defaultProps = {
    ability: 'WIS',
    abilityName: 'Wisdom',
    saveDC: 13,
    attackBonus: 5,
    formattedAttackBonus: '+5',
  }

  describe('structure', () => {
    it('renders spellcasting ability info', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Wisdom')
    })

    it('has card styling', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.find('[data-test="spellcasting-card"]').exists()).toBe(true)
    })

    it('shows section header', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Spellcasting')
    })
  })

  describe('spellcasting ability', () => {
    it('shows the spellcasting ability name', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: { ...defaultProps, abilityName: 'Intelligence' }
      })

      expect(wrapper.text()).toContain('Intelligence')
    })

    it('shows ability label', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Ability')
    })
  })

  describe('spell save DC', () => {
    it('shows the spell save DC', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: { ...defaultProps, saveDC: 15 }
      })

      const dcSection = wrapper.find('[data-test="save-dc-value"]')
      expect(dcSection.text()).toContain('15')
    })

    it('shows Save DC label', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Save DC')
    })
  })

  describe('spell attack bonus', () => {
    it('shows spell attack bonus with sign', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: { ...defaultProps, formattedAttackBonus: '+7' }
      })

      const attackSection = wrapper.find('[data-test="attack-bonus-value"]')
      expect(attackSection.text()).toContain('+7')
    })

    it('shows Spell Attack label', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Spell Attack')
    })
  })

  describe('spell slots', () => {
    it('shows spell slots when provided', async () => {
      const slots = { 1: 4, 2: 3, 3: 2 }
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: { ...defaultProps, slots }
      })

      // Should show level indicators
      expect(wrapper.text()).toContain('1st')
      expect(wrapper.text()).toContain('2nd')
      expect(wrapper.text()).toContain('3rd')
    })

    it('shows slot counts', async () => {
      const slots = { 1: 4, 2: 3 }
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: { ...defaultProps, slots }
      })

      expect(wrapper.text()).toContain('4')
      expect(wrapper.text()).toContain('3')
    })

    it('hides slots section when no slots provided', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: defaultProps
      })

      expect(wrapper.find('[data-test="spell-slots"]').exists()).toBe(false)
    })
  })

  describe('different spellcasters', () => {
    it('works for Charisma-based casters', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: {
          ability: 'CHA',
          abilityName: 'Charisma',
          saveDC: 14,
          attackBonus: 6,
          formattedAttackBonus: '+6',
        }
      })

      expect(wrapper.text()).toContain('Charisma')
      expect(wrapper.text()).toContain('14')
      expect(wrapper.text()).toContain('+6')
    })

    it('works for Intelligence-based casters', async () => {
      const wrapper = await mountSuspended(SpellcastingCard, {
        props: {
          ability: 'INT',
          abilityName: 'Intelligence',
          saveDC: 15,
          attackBonus: 7,
          formattedAttackBonus: '+7',
        }
      })

      expect(wrapper.text()).toContain('Intelligence')
    })
  })
})

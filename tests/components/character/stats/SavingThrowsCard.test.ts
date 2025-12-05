import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SavingThrowsCard from '~/components/character/stats/SavingThrowsCard.vue'
import type { SavingThrowDisplay } from '~/composables/useCharacterStats'

describe('SavingThrowsCard', () => {
  const defaultSavingThrows: SavingThrowDisplay[] = [
    { code: 'STR', name: 'Strength', bonus: 2, formattedBonus: '+2', isProficient: false },
    { code: 'DEX', name: 'Dexterity', bonus: 3, formattedBonus: '+3', isProficient: true },
    { code: 'CON', name: 'Constitution', bonus: 1, formattedBonus: '+1', isProficient: false },
    { code: 'INT', name: 'Intelligence', bonus: 0, formattedBonus: '+0', isProficient: false },
    { code: 'WIS', name: 'Wisdom', bonus: 4, formattedBonus: '+4', isProficient: true },
    { code: 'CHA', name: 'Charisma', bonus: -1, formattedBonus: '-1', isProficient: false },
  ]

  describe('structure', () => {
    it('renders all six saving throws', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      expect(wrapper.text()).toContain('STR')
      expect(wrapper.text()).toContain('DEX')
      expect(wrapper.text()).toContain('CON')
      expect(wrapper.text()).toContain('INT')
      expect(wrapper.text()).toContain('WIS')
      expect(wrapper.text()).toContain('CHA')
    })

    it('has card styling', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      expect(wrapper.find('[data-test="saving-throws-card"]').exists()).toBe(true)
    })

    it('shows section header', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      expect(wrapper.text()).toContain('Saving Throws')
    })
  })

  describe('saving throw display', () => {
    it('shows formatted bonus for each save', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      expect(wrapper.text()).toContain('+2')
      expect(wrapper.text()).toContain('+3')
      expect(wrapper.text()).toContain('+1')
      expect(wrapper.text()).toContain('+0')
      expect(wrapper.text()).toContain('+4')
      expect(wrapper.text()).toContain('-1')
    })

    it('shows positive bonuses with plus sign', async () => {
      const saves: SavingThrowDisplay[] = [
        { code: 'STR', name: 'Strength', bonus: 5, formattedBonus: '+5', isProficient: false },
        ...defaultSavingThrows.slice(1),
      ]

      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: saves }
      })

      const strSection = wrapper.find('[data-test="save-STR"]')
      expect(strSection.text()).toContain('+5')
    })

    it('shows negative bonuses correctly', async () => {
      const saves: SavingThrowDisplay[] = [
        { code: 'STR', name: 'Strength', bonus: -2, formattedBonus: '-2', isProficient: false },
        ...defaultSavingThrows.slice(1),
      ]

      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: saves }
      })

      const strSection = wrapper.find('[data-test="save-STR"]')
      expect(strSection.text()).toContain('-2')
    })
  })

  describe('proficiency indicators', () => {
    it('shows proficiency indicator for proficient saves', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      // DEX and WIS are proficient
      const dexSection = wrapper.find('[data-test="save-DEX"]')
      const wisSection = wrapper.find('[data-test="save-WIS"]')

      expect(dexSection.find('[data-test="proficiency-dot"]').exists()).toBe(true)
      expect(wisSection.find('[data-test="proficiency-dot"]').exists()).toBe(true)
    })

    it('does not show proficiency indicator for non-proficient saves', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      // STR, CON, INT, CHA are not proficient
      const strSection = wrapper.find('[data-test="save-STR"]')
      const conSection = wrapper.find('[data-test="save-CON"]')

      expect(strSection.find('[data-test="proficiency-dot"]').exists()).toBe(false)
      expect(conSection.find('[data-test="proficiency-dot"]').exists()).toBe(false)
    })

    it('shows filled dot for proficient saves', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      const dexSection = wrapper.find('[data-test="save-DEX"]')
      const profDot = dexSection.find('[data-test="proficiency-dot"]')

      // Should have the filled styling
      expect(profDot.classes().some(c => c.includes('bg-'))).toBe(true)
    })
  })

  describe('grid layout', () => {
    it('renders saves in a grid', async () => {
      const wrapper = await mountSuspended(SavingThrowsCard, {
        props: { savingThrows: defaultSavingThrows }
      })

      // Each save should have its own row
      const saveItems = wrapper.findAll('[data-test^="save-"]')
      expect(saveItems.length).toBe(6)
    })
  })
})

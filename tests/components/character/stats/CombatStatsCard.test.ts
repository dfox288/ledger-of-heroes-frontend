import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatStatsCard from '~/components/character/stats/CombatStatsCard.vue'

describe('CombatStatsCard', () => {
  const defaultProps = {
    hitPoints: 10,
    armorClass: 14,
    initiative: '+2',
    speed: 30,
    proficiencyBonus: '+2'
  }

  describe('structure', () => {
    it('renders all stat values', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('10') // HP
      expect(wrapper.text()).toContain('14') // AC
      expect(wrapper.text()).toContain('+2') // Initiative and Proficiency
      expect(wrapper.text()).toContain('30') // Speed
    })

    it('has card styling', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.find('[data-test="combat-stats-card"]').exists()).toBe(true)
    })
  })

  describe('hit points display', () => {
    it('shows hit points value', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, hitPoints: 45 }
      })

      const hpSection = wrapper.find('[data-test="hp-value"]')
      expect(hpSection.text()).toContain('45')
    })

    it('handles string hit points (placeholder)', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, hitPoints: '—' }
      })

      const hpSection = wrapper.find('[data-test="hp-value"]')
      expect(hpSection.text()).toContain('—')
    })

    it('shows HP label', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('HP')
    })
  })

  describe('armor class display', () => {
    it('shows armor class value', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, armorClass: 18 }
      })

      const acSection = wrapper.find('[data-test="ac-value"]')
      expect(acSection.text()).toContain('18')
    })

    it('shows AC label', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('AC')
    })
  })

  describe('initiative display', () => {
    it('shows initiative modifier with sign', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, initiative: '+3' }
      })

      const initSection = wrapper.find('[data-test="init-value"]')
      expect(initSection.text()).toContain('+3')
    })

    it('shows negative initiative', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, initiative: '-1' }
      })

      const initSection = wrapper.find('[data-test="init-value"]')
      expect(initSection.text()).toContain('-1')
    })

    it('shows Initiative label', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Initiative')
    })
  })

  describe('speed display', () => {
    it('shows speed value with unit', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, speed: 35 }
      })

      const speedSection = wrapper.find('[data-test="speed-value"]')
      expect(speedSection.text()).toContain('35')
    })

    it('shows Speed label', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Speed')
    })
  })

  describe('proficiency bonus display', () => {
    it('shows proficiency bonus', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: { ...defaultProps, proficiencyBonus: '+3' }
      })

      const profSection = wrapper.find('[data-test="prof-value"]')
      expect(profSection.text()).toContain('+3')
    })

    it('shows Proficiency label', async () => {
      const wrapper = await mountSuspended(CombatStatsCard, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Proficiency')
    })
  })
})

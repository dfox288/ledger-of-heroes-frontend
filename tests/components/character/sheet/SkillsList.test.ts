// tests/components/character/sheet/SkillsList.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SkillsList from '~/components/character/sheet/SkillsList.vue'
import type { SkillAdvantage } from '~/types/character'

const mockSkills = [
  { id: 1, name: 'Acrobatics', slug: 'acrobatics', ability_code: 'DEX', modifier: 2, proficient: false, expertise: false, has_reliable_talent: false, minimum_roll: null, minimum_total: null },
  { id: 2, name: 'Athletics', slug: 'athletics', ability_code: 'STR', modifier: 5, proficient: true, expertise: false, has_reliable_talent: false, minimum_roll: null, minimum_total: null },
  { id: 3, name: 'Stealth', slug: 'stealth', ability_code: 'DEX', modifier: 6, proficient: true, expertise: true, has_reliable_talent: false, minimum_roll: null, minimum_total: null },
  { id: 4, name: 'Deception', slug: 'deception', ability_code: 'CHA', modifier: 4, proficient: false, expertise: false, has_reliable_talent: false, minimum_roll: null, minimum_total: null },
  { id: 5, name: 'Performance', slug: 'performance', ability_code: 'CHA', modifier: 4, proficient: false, expertise: false, has_reliable_talent: false, minimum_roll: null, minimum_total: null }
]

const mockSkillAdvantages: SkillAdvantage[] = [
  { skill: 'Deception', skill_slug: 'deception', condition: null, source: 'Actor' },
  { skill: 'Performance', skill_slug: 'performance', condition: null, source: 'Actor' }
]

const mockConditionalAdvantage: SkillAdvantage[] = [
  { skill: 'History', skill_slug: 'history', condition: 'related to stonework', source: 'Stonecunning' }
]

describe('CharacterSheetSkillsList', () => {
  it('displays all skills', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    expect(wrapper.text()).toContain('Acrobatics')
    expect(wrapper.text()).toContain('Athletics')
    expect(wrapper.text()).toContain('Stealth')
  })

  it('displays skill modifiers', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('+5')
    expect(wrapper.text()).toContain('+6')
  })

  it('shows ability code for each skill', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('STR')
  })

  it('shows proficiency indicator for proficient skills (without expertise)', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    const profIndicators = wrapper.findAll('[data-testid="proficient"]')
    expect(profIndicators.length).toBe(1) // Athletics only (Stealth has expertise, uses different indicator)
  })

  it('shows expertise indicator for expertise skills', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    const expertiseIndicators = wrapper.findAll('[data-testid="expertise"]')
    expect(expertiseIndicators.length).toBe(1) // Only Stealth
  })

  describe('skill advantages', () => {
    it('shows advantage icon for skills with unconditional advantage', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: {
          skills: mockSkills,
          skillAdvantages: mockSkillAdvantages
        }
      })
      const advantageIcons = wrapper.findAll('[data-testid="advantage-icon"]')
      expect(advantageIcons.length).toBe(2) // Deception and Performance
    })

    it('does not show advantage icon for skills without advantage', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: {
          skills: mockSkills,
          skillAdvantages: mockSkillAdvantages
        }
      })
      // Find the Acrobatics row and verify no advantage icon
      const acrobaticsRow = wrapper.findAll('[data-testid="skill-row"]').find(row => row.text().includes('Acrobatics'))
      expect(acrobaticsRow?.find('[data-testid="advantage-icon"]').exists()).toBe(false)
    })

    it('shows tooltip with source on advantage icon', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: {
          skills: mockSkills,
          skillAdvantages: mockSkillAdvantages
        }
      })
      const advantageIcon = wrapper.find('[data-testid="advantage-icon"]')
      expect(advantageIcon.attributes('aria-label')).toContain('Actor')
    })

    it('does not show advantage icon for conditional advantages', async () => {
      const skillsWithHistory = [
        ...mockSkills,
        { id: 6, name: 'History', slug: 'history', ability_code: 'INT', modifier: 1, proficient: false, expertise: false }
      ]
      const wrapper = await mountSuspended(SkillsList, {
        props: {
          skills: skillsWithHistory,
          skillAdvantages: mockConditionalAdvantage
        }
      })
      const advantageIcons = wrapper.findAll('[data-testid="advantage-icon"]')
      expect(advantageIcons.length).toBe(0) // Conditional advantages should be filtered out
    })

    it('renders without skillAdvantages prop (backwards compatible)', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: { skills: mockSkills }
      })
      // Should render without errors
      expect(wrapper.text()).toContain('Acrobatics')
      const advantageIcons = wrapper.findAll('[data-testid="advantage-icon"]')
      expect(advantageIcons.length).toBe(0)
    })
  })

  describe('minimum roll indicator (Reliable Talent, Silver Tongue)', () => {
    const mockSkillsWithMinimumRoll = [
      { id: 1, name: 'Acrobatics', slug: 'acrobatics', ability_code: 'DEX', modifier: 2, proficient: false, expertise: false, has_reliable_talent: false, minimum_roll: null, minimum_total: null },
      { id: 2, name: 'Athletics', slug: 'athletics', ability_code: 'STR', modifier: 5, proficient: true, expertise: false, has_reliable_talent: false, minimum_roll: null, minimum_total: null },
      { id: 3, name: 'Stealth', slug: 'stealth', ability_code: 'DEX', modifier: 11, proficient: true, expertise: true, has_reliable_talent: true, minimum_roll: 10, minimum_total: 21 },
      { id: 4, name: 'Perception', slug: 'perception', ability_code: 'WIS', modifier: 8, proficient: true, expertise: false, has_reliable_talent: true, minimum_roll: 10, minimum_total: 18 },
      { id: 5, name: 'Deception', slug: 'deception', ability_code: 'CHA', modifier: 4, proficient: false, expertise: false, has_reliable_talent: false, minimum_roll: 10, minimum_total: 14 } // Silver Tongue (no proficiency required)
    ]

    it('shows minimum roll badge for skills with minimum_total', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: { skills: mockSkillsWithMinimumRoll }
      })
      const badges = wrapper.findAll('[data-testid="minimum-roll-badge"]')
      expect(badges.length).toBe(3) // Stealth, Perception, Deception
    })

    it('displays the minimum total value in the badge', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: { skills: mockSkillsWithMinimumRoll }
      })
      const stealthRow = wrapper.findAll('[data-testid="skill-row"]').find(row => row.text().includes('Stealth'))
      expect(stealthRow?.text()).toContain('Min: 21')
    })

    it('does not show minimum roll badge for skills without minimum', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: { skills: mockSkillsWithMinimumRoll }
      })
      const athleticsRow = wrapper.findAll('[data-testid="skill-row"]').find(row => row.text().includes('Athletics'))
      expect(athleticsRow?.find('[data-testid="minimum-roll-badge"]').exists()).toBe(false)
    })

    it('shows aria-label with guaranteed minimum result', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: { skills: mockSkillsWithMinimumRoll }
      })
      const badge = wrapper.find('[data-testid="minimum-roll-badge"]')
      expect(badge.attributes('aria-label')).toContain('21')
    })

    it('renders without minimum roll badges when no skills have it', async () => {
      const wrapper = await mountSuspended(SkillsList, {
        props: { skills: mockSkills }
      })
      const badges = wrapper.findAll('[data-testid="minimum-roll-badge"]')
      expect(badges.length).toBe(0)
    })
  })
})

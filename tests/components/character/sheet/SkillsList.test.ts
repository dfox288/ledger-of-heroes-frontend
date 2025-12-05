// tests/components/character/sheet/SkillsList.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SkillsList from '~/components/character/sheet/SkillsList.vue'

const mockSkills = [
  { id: 1, name: 'Acrobatics', slug: 'acrobatics', ability_code: 'DEX', modifier: 2, proficient: false, expertise: false },
  { id: 2, name: 'Athletics', slug: 'athletics', ability_code: 'STR', modifier: 5, proficient: true, expertise: false },
  { id: 3, name: 'Stealth', slug: 'stealth', ability_code: 'DEX', modifier: 6, proficient: true, expertise: true }
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
    const profIndicators = wrapper.findAll('[data-test="proficient"]')
    expect(profIndicators.length).toBe(1) // Athletics only (Stealth has expertise, uses different indicator)
  })

  it('shows expertise indicator for expertise skills', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    const expertiseIndicators = wrapper.findAll('[data-test="expertise"]')
    expect(expertiseIndicators.length).toBe(1) // Only Stealth
  })
})

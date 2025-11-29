import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SkillCard from '~/components/skill/SkillCard.vue'

describe('SkillCard', () => {
  const mockSkill = {
    id: 1,
    name: 'Acrobatics',
    ability_score: {
      id: 2,
      code: 'DEX',
      name: 'Dexterity'
    }
  }

  it('displays skill name as title', async () => {
    const wrapper = await mountSuspended(SkillCard, {
      props: { skill: mockSkill }
    })

    expect(wrapper.text()).toContain('Acrobatics')
  })

  it('displays ability score code as badge', async () => {
    const wrapper = await mountSuspended(SkillCard, {
      props: { skill: mockSkill }
    })

    expect(wrapper.text()).toContain('DEX')
  })

  it('displays ability score full name', async () => {
    const wrapper = await mountSuspended(SkillCard, {
      props: { skill: mockSkill }
    })

    expect(wrapper.text()).toContain('Dexterity')
  })

  it('handles missing ability score gracefully', async () => {
    const noAbility = {
      id: 2,
      name: 'Perception',
      ability_score: null
    }

    const wrapper = await mountSuspended(SkillCard, {
      props: { skill: noAbility }
    })

    expect(wrapper.text()).toContain('Perception')
    expect(wrapper.text()).not.toContain('null')
  })

  it('displays category badge', async () => {
    const wrapper = await mountSuspended(SkillCard, {
      props: { skill: mockSkill }
    })

    expect(wrapper.text()).toContain('Skill')
  })

  it('uses skill color for ability score badge', async () => {
    const wrapper = await mountSuspended(SkillCard, {
      props: { skill: mockSkill }
    })

    const html = wrapper.html()
    // Skill color badge should be present (bg-skill class)
    expect(html).toContain('bg-skill')
  })

  describe('background images', () => {
    it('computes background image URL correctly from skill name', async () => {
      const wrapper = await mountSuspended(SkillCard, {
        props: {
          skill: {
            id: 1,
            name: 'Animal Handling',
            slug: 'animal-handling',
            ability_score: {
              id: 3,
              code: 'WIS',
              name: 'Wisdom'
            }
          }
        }
      })

      const html = wrapper.html()
      // Check that the background image is in the HTML
      expect(html).toContain('animal-handling.png')
    })
  })
})

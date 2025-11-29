import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AbilityScoreCard from '~/components/ability-score/AbilityScoreCard.vue'

describe('AbilityScoreCard', () => {
  const mockAbilityScore = {
    id: 1,
    code: 'STR',
    name: 'Strength'
  }

  it('displays ability score code as large badge', async () => {
    const wrapper = await mountSuspended(AbilityScoreCard, {
      props: { abilityScore: mockAbilityScore }
    })

    expect(wrapper.text()).toContain('STR')
  })

  it('displays ability score name as title', async () => {
    const wrapper = await mountSuspended(AbilityScoreCard, {
      props: { abilityScore: mockAbilityScore }
    })

    expect(wrapper.text()).toContain('Strength')
  })

  it('displays category badge', async () => {
    const wrapper = await mountSuspended(AbilityScoreCard, {
      props: { abilityScore: mockAbilityScore }
    })

    expect(wrapper.text()).toContain('Ability Score')
  })

  it('handles missing optional fields gracefully', async () => {
    const minimalData = {
      id: 2,
      code: 'DEX',
      name: 'Dexterity'
    }

    const wrapper = await mountSuspended(AbilityScoreCard, {
      props: { abilityScore: minimalData }
    })

    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('Dexterity')
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(AbilityScoreCard, {
        props: {
          abilityScore: {
            id: 1,
            code: 'STR',
            name: 'Strength'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      expect(url).toBe('/images/generated/conversions/256/ability_scores/stability-ai/str.png')
    })
  })
})

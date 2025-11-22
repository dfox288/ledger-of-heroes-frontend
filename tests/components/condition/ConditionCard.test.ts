import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ConditionCard from '~/components/condition/ConditionCard.vue'
import { testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'

describe('ConditionCard', () => {
  const mockCondition = {
    id: 1,
    name: 'Blinded',
    slug: 'blinded',
    description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight.'
  }

  const mountCard = () => mountSuspended(ConditionCard, {
    props: { condition: mockCondition }
  })

  testCardHoverEffects(mountCard)
  testCardBorderStyling(mountCard)

  it('displays condition name as title', async () => {
    const wrapper = await mountSuspended(ConditionCard, {
      props: { condition: mockCondition }
    })

    expect(wrapper.text()).toContain('Blinded')
  })

  it('displays description', async () => {
    const wrapper = await mountSuspended(ConditionCard, {
      props: { condition: mockCondition }
    })

    expect(wrapper.text()).toContain('can\'t see')
  })

  it('truncates long descriptions with line-clamp-3', async () => {
    const longDesc = {
      id: 2,
      name: 'Exhaustion',
      slug: 'exhaustion',
      description: 'Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect\'s description. Each level has cumulative effects.'
    }

    const wrapper = await mountSuspended(ConditionCard, {
      props: { condition: longDesc }
    })

    const html = wrapper.html()
    expect(html).toContain('line-clamp-3')
  })

  it('displays category badge', async () => {
    const wrapper = await mountSuspended(ConditionCard, {
      props: { condition: mockCondition }
    })

    expect(wrapper.text()).toContain('Condition')
  })

  it('handles empty description', async () => {
    const noDesc = {
      id: 3,
      name: 'Custom',
      slug: 'custom',
      description: ''
    }

    const wrapper = await mountSuspended(ConditionCard, {
      props: { condition: noDesc }
    })

    expect(wrapper.text()).toContain('Custom')
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(ConditionCard, {
        props: {
          condition: {
            id: 1,
            slug: 'blinded',
            name: 'Blinded',
            description: 'Test description'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      expect(url).toBe('/images/generated/conversions/256/conditions/stability-ai/blinded.png')
    })

    it('applies background image styles when URL exists', async () => {
      const wrapper = await mountSuspended(ConditionCard, {
        props: {
          condition: {
            id: 1,
            slug: 'blinded',
            name: 'Blinded',
            description: 'Test description'
          }
        }
      })

      const card = wrapper.find('.group')
      const style = card.attributes('style')
      expect(style).toContain('background-image')
    })
  })
})

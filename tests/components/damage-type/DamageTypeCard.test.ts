import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DamageTypeCard from '~/components/damage-type/DamageTypeCard.vue'
import { testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'

describe('DamageTypeCard', () => {
  const mockDamageType = {
    id: 1,
    name: 'Fire'
  }

  const mountCard = () => mountSuspended(DamageTypeCard, {
    props: { damageType: mockDamageType }
  })

  testCardHoverEffects(mountCard)
  testCardBorderStyling(mountCard)

  it('renders damage type name', async () => {
    const wrapper = await mountSuspended(DamageTypeCard, {
      props: { damageType: mockDamageType }
    })

    expect(wrapper.text()).toContain('Fire')
  })

  it('shows type badge', async () => {
    const wrapper = await mountSuspended(DamageTypeCard, {
      props: { damageType: mockDamageType }
    })

    expect(wrapper.text()).toContain('Damage Type')
  })

  it('handles all common damage types', async () => {
    const damageTypes = [
      'Acid',
      'Bludgeoning',
      'Cold',
      'Fire',
      'Force',
      'Lightning',
      'Necrotic',
      'Piercing',
      'Poison',
      'Psychic',
      'Radiant',
      'Slashing',
      'Thunder'
    ]

    for (const name of damageTypes) {
      const wrapper = await mountSuspended(DamageTypeCard, {
        props: { damageType: { id: 1, name } }
      })

      expect(wrapper.text()).toContain(name)
    }
  })

  it('handles long damage type names', async () => {
    const longName = 'Bludgeoning'
    const longNameType = { id: 1, name: longName }
    const wrapper = await mountSuspended(DamageTypeCard, {
      props: { damageType: longNameType }
    })

    expect(wrapper.text()).toContain(longName)
  })

  it('renders damage type name prominently', async () => {
    const wrapper = await mountSuspended(DamageTypeCard, {
      props: { damageType: mockDamageType }
    })

    const html = wrapper.html()
    // Should have heading styling
    expect(html).toContain('text-xl')
    expect(html).toContain('font-semibold')
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(DamageTypeCard, {
        props: {
          damageType: {
            id: 1,
            name: 'Fire'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      expect(url).toBe('/images/generated/conversions/256/damage_types/stability-ai/fire.png')
    })

    it('applies background image styles when URL exists', async () => {
      const wrapper = await mountSuspended(DamageTypeCard, {
        props: {
          damageType: {
            id: 1,
            name: 'Fire'
          }
        }
      })

      const card = wrapper.find('.group')
      const style = card.attributes('style')
      expect(style).toContain('background-image')
    })
  })
})

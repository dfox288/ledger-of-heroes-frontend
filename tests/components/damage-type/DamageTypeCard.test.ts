import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DamageTypeCard from '~/components/damage-type/DamageTypeCard.vue'

describe('DamageTypeCard', () => {
  const mockDamageType = {
    id: 1,
    name: 'Fire'
  }

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

  it.each([
    ['Acid'],
    ['Bludgeoning'],
    ['Cold'],
    ['Fire'],
    ['Force'],
    ['Lightning'],
    ['Necrotic'],
    ['Piercing'],
    ['Poison'],
    ['Psychic'],
    ['Radiant'],
    ['Slashing'],
    ['Thunder']
  ])('handles damage type: %s', async (name) => {
    const wrapper = await mountSuspended(DamageTypeCard, {
      props: { damageType: { id: 1, name } }
    })

    expect(wrapper.text()).toContain(name)
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
  })
})

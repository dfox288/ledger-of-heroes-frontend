import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SizeCard from '~/components/size/SizeCard.vue'
import { testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'

describe('SizeCard', () => {
  const mockSize = {
    id: 1,
    code: 'M',
    name: 'Medium'
  }

  testCardHoverEffects(() => mountSuspended(SizeCard, { props: { size: mockSize } }))
  testCardBorderStyling(() => mountSuspended(SizeCard, { props: { size: mockSize } }))

  it('renders size name', async () => {
    const wrapper = await mountSuspended(SizeCard, {
      props: { size: mockSize }
    })

    expect(wrapper.text()).toContain('Medium')
  })

  it('renders size code badge', async () => {
    const wrapper = await mountSuspended(SizeCard, {
      props: { size: mockSize }
    })

    expect(wrapper.text()).toContain('M')
  })

  it('shows category badge', async () => {
    const wrapper = await mountSuspended(SizeCard, {
      props: { size: mockSize }
    })

    expect(wrapper.text()).toContain('Creature Size')
  })

  it('displays all key information in organized layout', async () => {
    const wrapper = await mountSuspended(SizeCard, {
      props: { size: mockSize }
    })

    const text = wrapper.text()
    expect(text).toContain('M')
    expect(text).toContain('Medium')
    expect(text).toContain('Creature Size')
  })

  it.each([
    [{ code: 'T', name: 'Tiny' }],
    [{ code: 'S', name: 'Small' }],
    [{ code: 'M', name: 'Medium' }],
    [{ code: 'L', name: 'Large' }],
    [{ code: 'H', name: 'Huge' }],
    [{ code: 'G', name: 'Gargantuan' }]
  ])('handles D&D size category %s', async (size) => {
    const wrapper = await mountSuspended(SizeCard, {
      props: { size: { id: 1, ...size } }
    })

    expect(wrapper.text()).toContain(size.code)
    expect(wrapper.text()).toContain(size.name)
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(SizeCard, {
        props: {
          size: {
            id: 1,
            code: 'M',
            name: 'Medium'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      expect(url).toBe('/images/generated/conversions/256/sizes/stability-ai/m.png')
    })
  })
})

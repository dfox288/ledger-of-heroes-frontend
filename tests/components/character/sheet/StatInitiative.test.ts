// tests/components/character/sheet/StatInitiative.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatInitiative from '~/components/character/sheet/StatInitiative.vue'

describe('StatInitiative', () => {
  it('displays "Initiative" label', async () => {
    const wrapper = await mountSuspended(StatInitiative, {
      props: { bonus: 2 }
    })
    expect(wrapper.text()).toContain('Initiative')
  })

  it('displays positive bonus with + prefix', async () => {
    const wrapper = await mountSuspended(StatInitiative, {
      props: { bonus: 3 }
    })
    expect(wrapper.text()).toContain('+3')
  })

  it('displays negative bonus with - prefix', async () => {
    const wrapper = await mountSuspended(StatInitiative, {
      props: { bonus: -1 }
    })
    expect(wrapper.text()).toContain('-1')
  })

  it('displays zero bonus as +0', async () => {
    const wrapper = await mountSuspended(StatInitiative, {
      props: { bonus: 0 }
    })
    expect(wrapper.text()).toContain('+0')
  })

  it('displays placeholder when bonus is null', async () => {
    const wrapper = await mountSuspended(StatInitiative, {
      props: { bonus: null }
    })
    expect(wrapper.text()).toContain('—')
  })

  it('has expected visual structure (rounded card)', async () => {
    const wrapper = await mountSuspended(StatInitiative, {
      props: { bonus: 2 }
    })
    // Should have rounded-lg card styling
    expect(wrapper.find('.rounded-lg').exists()).toBe(true)
  })
})

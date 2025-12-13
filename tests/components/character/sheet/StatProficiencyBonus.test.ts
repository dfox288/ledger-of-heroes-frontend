// tests/components/character/sheet/StatProficiencyBonus.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatProficiencyBonus from '~/components/character/sheet/StatProficiencyBonus.vue'

describe('StatProficiencyBonus', () => {
  it('displays "Prof Bonus" label', async () => {
    const wrapper = await mountSuspended(StatProficiencyBonus, {
      props: { bonus: 2 }
    })
    expect(wrapper.text()).toContain('Prof')
    expect(wrapper.text()).toContain('Bonus')
  })

  it('displays positive bonus with + prefix', async () => {
    const wrapper = await mountSuspended(StatProficiencyBonus, {
      props: { bonus: 3 }
    })
    expect(wrapper.text()).toContain('+3')
  })

  it('displays level 1 proficiency bonus (+2)', async () => {
    const wrapper = await mountSuspended(StatProficiencyBonus, {
      props: { bonus: 2 }
    })
    expect(wrapper.text()).toContain('+2')
  })

  it('displays high level proficiency bonus (+6)', async () => {
    const wrapper = await mountSuspended(StatProficiencyBonus, {
      props: { bonus: 6 }
    })
    expect(wrapper.text()).toContain('+6')
  })

  it('displays placeholder when bonus is null', async () => {
    const wrapper = await mountSuspended(StatProficiencyBonus, {
      props: { bonus: null }
    })
    expect(wrapper.text()).toContain('—')
  })

  it('has expected visual structure (rounded card)', async () => {
    const wrapper = await mountSuspended(StatProficiencyBonus, {
      props: { bonus: 2 }
    })
    expect(wrapper.find('.rounded-lg').exists()).toBe(true)
  })
})

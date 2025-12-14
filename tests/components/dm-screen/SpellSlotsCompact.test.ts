// tests/components/dm-screen/SpellSlotsCompact.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellSlotsCompact from '~/components/dm-screen/SpellSlotsCompact.vue'

describe('DmScreenSpellSlotsCompact', () => {
  it('displays slots for each level', async () => {
    const wrapper = await mountSuspended(SpellSlotsCompact, {
      props: {
        slots: {
          '1': { current: 3, max: 4 },
          '2': { current: 2, max: 3 }
        }
      }
    })
    expect(wrapper.text()).toContain('1st')
    expect(wrapper.text()).toContain('2nd')
  })

  it('shows filled and empty slot indicators', async () => {
    const wrapper = await mountSuspended(SpellSlotsCompact, {
      props: {
        slots: { '1': { current: 2, max: 4 } }
      }
    })
    const filled = wrapper.findAll('[data-testid^="slot-filled"]')
    const empty = wrapper.findAll('[data-testid^="slot-empty"]')
    expect(filled.length).toBe(2)
    expect(empty.length).toBe(2)
  })

  it('renders nothing when slots object is empty', async () => {
    const wrapper = await mountSuspended(SpellSlotsCompact, {
      props: { slots: {} }
    })
    expect(wrapper.find('[data-testid="spell-slots-container"]').exists()).toBe(false)
  })

  it('skips levels with zero max slots', async () => {
    const wrapper = await mountSuspended(SpellSlotsCompact, {
      props: {
        slots: {
          '1': { current: 0, max: 0 },
          '2': { current: 2, max: 3 }
        }
      }
    })
    expect(wrapper.text()).not.toContain('1st')
    expect(wrapper.text()).toContain('2nd')
  })

  it('formats ordinals correctly', async () => {
    const wrapper = await mountSuspended(SpellSlotsCompact, {
      props: {
        slots: {
          '1': { current: 1, max: 1 },
          '2': { current: 1, max: 1 },
          '3': { current: 1, max: 1 }
        }
      }
    })
    expect(wrapper.text()).toContain('1st')
    expect(wrapper.text()).toContain('2nd')
    expect(wrapper.text()).toContain('3rd')
  })
})

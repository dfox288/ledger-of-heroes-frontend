// tests/components/dm-screen/CountersCompact.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CountersCompact from '~/components/dm-screen/CountersCompact.vue'
import type { Counter } from '~/types/character'

const mockRage: Counter = {
  id: 1,
  slug: 'phb:barbarian:rage',
  name: 'Rage',
  current: 2,
  max: 3,
  reset_on: 'long_rest',
  source: 'Barbarian',
  source_type: 'class',
  unlimited: false
}

const mockKiPoints: Counter = {
  id: 2,
  slug: 'phb:monk:ki',
  name: 'Ki Points',
  current: 3,
  max: 5,
  reset_on: 'short_rest',
  source: 'Monk',
  source_type: 'class',
  unlimited: false
}

const mockUnlimited: Counter = {
  id: 3,
  slug: 'phb:warlock:eldritch',
  name: 'Eldritch Invocations',
  current: 0,
  max: 0,
  reset_on: null,
  source: 'Warlock',
  source_type: 'class',
  unlimited: true
}

describe('DmScreenCountersCompact', () => {
  it('displays counter names', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockRage, mockKiPoints] }
    })
    expect(wrapper.text()).toContain('Rage')
    expect(wrapper.text()).toContain('Ki Points')
  })

  it('displays current/max values', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockRage] }
    })
    expect(wrapper.text()).toContain('2/3')
  })

  it('shows filled and empty pip indicators', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockRage] }
    })
    const filled = wrapper.findAll('[data-testid^="counter-pip-filled"]')
    const empty = wrapper.findAll('[data-testid^="counter-pip-empty"]')
    expect(filled.length).toBe(2)
    expect(empty.length).toBe(1)
  })

  it('renders nothing when counters array is empty', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [] }
    })
    expect(wrapper.find('[data-testid="counters-container"]').exists()).toBe(false)
  })

  it('groups counters by reset timing', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockRage, mockKiPoints] }
    })
    // Long rest group should contain Rage
    expect(wrapper.text()).toContain('Long Rest')
    // Short rest group should contain Ki Points
    expect(wrapper.text()).toContain('Short Rest')
  })

  it('shows unlimited indicator for unlimited counters', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockUnlimited] }
    })
    expect(wrapper.text()).toContain('∞')
  })

  it('does not show pips for unlimited counters', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockUnlimited] }
    })
    const pips = wrapper.findAll('[data-testid^="counter-pip"]')
    expect(pips.length).toBe(0)
  })

  it('uses numeric display for counters with many uses (>6)', async () => {
    const highCount: Counter = {
      ...mockKiPoints,
      current: 15,
      max: 20
    }
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [highCount] }
    })
    // Should show "15/20" text, not 20 pips
    expect(wrapper.text()).toContain('15/20')
    // Should not render more than 6 pips
    const pips = wrapper.findAll('[data-testid^="counter-pip"]')
    expect(pips.length).toBeLessThanOrEqual(6)
  })

  it('shows warning color when counter is depleted', async () => {
    const depletedCounter: Counter = {
      ...mockRage,
      current: 0,
      max: 3
    }
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [depletedCounter] }
    })
    const counterEl = wrapper.find('[data-testid="counter-rage"]')
    expect(counterEl.classes()).toContain('text-amber-600')
  })

  it('groups counters with null reset_on under "Other"', async () => {
    const wrapper = await mountSuspended(CountersCompact, {
      props: { counters: [mockUnlimited] }
    })
    expect(wrapper.text()).toContain('Other')
  })
})

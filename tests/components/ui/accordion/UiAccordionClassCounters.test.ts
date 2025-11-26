import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionClassCounters from '~/components/ui/accordion/UiAccordionClassCounters.vue'
import type { ClassCounterResource } from '~/types/api/entities'

describe('UiAccordionClassCounters', () => {
  const mockCounters: ClassCounterResource[] = [
    {
      id: 1,
      level: 3,
      counter_name: 'Rage',
      counter_value: 3,
      reset_timing: 'Long Rest'
    },
    {
      id: 2,
      level: 1,
      counter_name: 'Ki Points',
      counter_value: 2,
      reset_timing: 'Short Rest'
    }
  ]

  it('renders counters sorted by level', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mockCounters }
    })

    expect(wrapper.text()).toContain('Ki Points')
    expect(wrapper.text()).toContain('Rage')

    // Level 1 should appear before Level 3 (sorted)
    const text = wrapper.text()
    const kiIndex = text.indexOf('Ki Points')
    const rageIndex = text.indexOf('Rage')
    expect(kiIndex).toBeLessThan(rageIndex)
  })

  it('displays reset timing badges', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mockCounters }
    })

    expect(wrapper.text()).toContain('Long Rest')
    expect(wrapper.text()).toContain('Short Rest')
  })

  it('handles empty counters array', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('groups same-named counters together', async () => {
    const countersWithDuplicates: ClassCounterResource[] = [
      {
        id: 1,
        level: 1,
        counter_name: 'Rage',
        counter_value: 2,
        reset_timing: 'Long Rest'
      },
      {
        id: 2,
        level: 3,
        counter_name: 'Rage',
        counter_value: 3,
        reset_timing: 'Long Rest'
      },
      {
        id: 3,
        level: 6,
        counter_name: 'Rage',
        counter_value: 4,
        reset_timing: 'Long Rest'
      },
      {
        id: 4,
        level: 2,
        counter_name: 'Ki Points',
        counter_value: 2,
        reset_timing: 'Short Rest'
      }
    ]

    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: countersWithDuplicates }
    })

    // Should only show "Rage" once
    const text = wrapper.text()
    const rageMatches = text.match(/Rage/g)
    expect(rageMatches).toHaveLength(1)

    // Should show Ki Points once
    const kiMatches = text.match(/Ki Points/g)
    expect(kiMatches).toHaveLength(1)
  })

  it('shows progression values for grouped counters', async () => {
    const countersWithProgression: ClassCounterResource[] = [
      {
        id: 1,
        level: 1,
        counter_name: 'Rage',
        counter_value: 2,
        reset_timing: 'Long Rest'
      },
      {
        id: 2,
        level: 3,
        counter_name: 'Rage',
        counter_value: 3,
        reset_timing: 'Long Rest'
      },
      {
        id: 3,
        level: 6,
        counter_name: 'Rage',
        counter_value: 4,
        reset_timing: 'Long Rest'
      }
    ]

    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: countersWithProgression }
    })

    const text = wrapper.text()

    // Should show progression (2 → 3 → 4)
    expect(text).toContain('2')
    expect(text).toContain('3')
    expect(text).toContain('4')

    // Should show the levels where values change
    expect(text).toContain('Level 1')
    expect(text).toContain('Level 3')
    expect(text).toContain('Level 6')
  })

  it('handles single-occurrence counters normally', async () => {
    const singleCounters: ClassCounterResource[] = [
      {
        id: 1,
        level: 1,
        counter_name: 'Unique Counter',
        counter_value: 5,
        reset_timing: 'Long Rest'
      }
    ]

    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: singleCounters }
    })

    expect(wrapper.text()).toContain('Unique Counter')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('Level 1')
  })

  it('handles mixed grouped and single counters', async () => {
    const mixedCounters: ClassCounterResource[] = [
      {
        id: 1,
        level: 1,
        counter_name: 'Rage',
        counter_value: 2,
        reset_timing: 'Long Rest'
      },
      {
        id: 2,
        level: 3,
        counter_name: 'Rage',
        counter_value: 3,
        reset_timing: 'Long Rest'
      },
      {
        id: 3,
        level: 2,
        counter_name: 'Ki Points',
        counter_value: 2,
        reset_timing: 'Short Rest'
      },
      {
        id: 4,
        level: 5,
        counter_name: 'Sorcery Points',
        counter_value: 5,
        reset_timing: 'Long Rest'
      }
    ]

    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mixedCounters }
    })

    const text = wrapper.text()

    // All counter names should appear once
    expect(text.match(/Rage/g)).toHaveLength(1)
    expect(text.match(/Ki Points/g)).toHaveLength(1)
    expect(text.match(/Sorcery Points/g)).toHaveLength(1)
  })
})

import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionClassCounters from '~/components/ui/UiAccordionClassCounters.vue'
import type { ClassCounterResource } from '~/types/api/entities'

describe('UiAccordionClassCounters', () => {
  const mockCounters: ClassCounterResource[] = [
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
      counter_name: 'Reckless Attack',
      counter_value: 1,
      reset_timing: 'Does Not Reset'
    }
  ]

  it('renders counter table', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mockCounters }
    })

    expect(wrapper.text()).toContain('Level')
    expect(wrapper.text()).toContain('Counter')
    expect(wrapper.text()).toContain('Value')
    expect(wrapper.text()).toContain('Reset Timing')
  })

  it('displays all counter entries', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mockCounters }
    })

    expect(wrapper.text()).toContain('Rage')
    expect(wrapper.text()).toContain('Reckless Attack')
    expect(wrapper.text()).toContain('Long Rest')
  })

  it('shows reset timing with badges', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mockCounters }
    })

    // Find all badge components
    const badges = wrapper.findAllComponents({ name: 'UBadge' })
    expect(badges.length).toBeGreaterThan(0)
  })

  it('sorts counters by level', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: mockCounters }
    })

    const html = wrapper.html()
    // Level 1 should appear before Level 3
    const level1Index = html.indexOf('>1<')
    const level3Index = html.indexOf('>3<')
    expect(level1Index).toBeLessThan(level3Index)
  })

  it('handles empty counters array', async () => {
    const wrapper = await mountSuspended(UiAccordionClassCounters, {
      props: { counters: [] }
    })

    expect(wrapper.text()).toBe('')
  })
})

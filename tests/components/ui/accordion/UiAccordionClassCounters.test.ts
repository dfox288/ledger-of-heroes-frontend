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
})

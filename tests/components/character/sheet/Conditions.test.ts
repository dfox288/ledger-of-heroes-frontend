// tests/components/character/sheet/Conditions.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Conditions from '~/components/character/sheet/Conditions.vue'

describe('CharacterSheetConditions', () => {
  it('renders nothing when conditions is undefined', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: { conditions: undefined }
    })
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(false)
  })

  it('renders nothing when conditions array is empty', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: { conditions: [] }
    })
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(false)
  })

  it('renders alert when conditions are present', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Poisoned',
            slug: 'poisoned',
            level: '',
            source: 'Giant Spider bite',
            duration: '2 hours',
            is_dangling: false
          }
        ]
      }
    })
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(true)
  })

  it('displays condition name', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Poisoned',
            slug: 'poisoned',
            level: '',
            source: 'Giant Spider bite',
            duration: '2 hours',
            is_dangling: false
          }
        ]
      }
    })
    expect(wrapper.text()).toContain('Poisoned')
  })

  it('displays condition duration', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Poisoned',
            slug: 'poisoned',
            level: '',
            source: 'Giant Spider bite',
            duration: '2 hours',
            is_dangling: false
          }
        ]
      }
    })
    expect(wrapper.text()).toContain('2 hours')
  })

  it('displays multiple conditions', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Poisoned',
            slug: 'poisoned',
            level: '',
            source: 'Giant Spider bite',
            duration: '2 hours',
            is_dangling: false
          },
          {
            id: '2',
            name: 'Frightened',
            slug: 'frightened',
            level: '',
            source: 'Dragon Fear',
            duration: 'Until end of next turn',
            is_dangling: false
          }
        ]
      }
    })
    expect(wrapper.text()).toContain('Poisoned')
    expect(wrapper.text()).toContain('Frightened')
  })

  it('displays exhaustion level when present', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Exhaustion',
            slug: 'exhaustion',
            level: '2',
            source: 'Extended travel',
            duration: 'Until long rest',
            is_dangling: false
          }
        ]
      }
    })
    expect(wrapper.text()).toContain('Exhaustion')
    expect(wrapper.text()).toContain('2')
  })

  it('handles dangling condition gracefully', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Unknown Condition',
            slug: 'unknown',
            level: '',
            source: 'Homebrew spell',
            duration: '1 minute',
            is_dangling: true
          }
        ]
      }
    })
    // Should still render, even if dangling
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Unknown Condition')
  })

  it('displays count of active conditions in title', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Poisoned',
            slug: 'poisoned',
            level: '',
            source: 'Giant Spider bite',
            duration: '2 hours',
            is_dangling: false
          },
          {
            id: '2',
            name: 'Frightened',
            slug: 'frightened',
            level: '',
            source: 'Dragon Fear',
            duration: 'Until end of next turn',
            is_dangling: false
          }
        ]
      }
    })
    // Title should mention number of conditions
    expect(wrapper.text()).toMatch(/2.*condition/i)
  })

  it('displays single condition with correct singular form', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          {
            id: '1',
            name: 'Poisoned',
            slug: 'poisoned',
            level: '',
            source: 'Giant Spider bite',
            duration: '2 hours',
            is_dangling: false
          }
        ]
      }
    })
    // Should say "1 Active Condition" not "1 Active Conditions"
    const text = wrapper.text()
    expect(text).toMatch(/1.*Active Condition[^s]/i)
  })
})

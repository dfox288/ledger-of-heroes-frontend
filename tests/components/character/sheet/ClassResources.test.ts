// tests/components/character/sheet/ClassResources.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassResources from '~/components/character/sheet/ClassResources.vue'
import type { Counter } from '~/types/character'

// Counter format updated in #725 - uses source_slug instead of source, slug removed (use id for routing)
const createCounter = (overrides: Partial<Counter> = {}): Counter => ({
  id: 1,
  name: 'Bardic Inspiration',
  current: 3,
  max: 5,
  reset_on: 'long_rest',
  source_slug: 'phb:bard',
  source_type: 'class',
  unlimited: false,
  ...overrides
})

describe('ClassResources', () => {
  it('displays title', async () => {
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters: [createCounter()] }
    })
    expect(wrapper.text()).toContain('Class Resources')
  })

  it('renders nothing when counters array is empty', async () => {
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters: [] }
    })
    expect(wrapper.text()).not.toContain('Class Resources')
  })

  it('renders each counter', async () => {
    const counters = [
      createCounter({ id: 1, name: 'Bardic Inspiration' }),
      createCounter({ id: 2, name: 'Ki Points', max: 10, source_slug: 'phb:monk' })
    ]
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters }
    })
    expect(wrapper.text()).toContain('Bardic Inspiration')
    expect(wrapper.text()).toContain('Ki Points')
  })

  // Counter routing updated in #725 - now uses numeric ID instead of slug
  it('emits spend event with counter ID', async () => {
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters: [createCounter({ id: 1 })], editable: true }
    })
    const icon = wrapper.find('[data-testid="counter-icon-filled"]')
    await icon.trigger('click')
    expect(wrapper.emitted('spend')).toBeTruthy()
    expect(wrapper.emitted('spend')![0]).toEqual([1]) // Numeric ID instead of slug
  })

  it('emits restore event with counter ID', async () => {
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters: [createCounter({ id: 1, max: 10 })], editable: true }
    })
    const incrementBtn = wrapper.find('[data-testid="counter-increment"]')
    await incrementBtn.trigger('click')
    expect(wrapper.emitted('restore')).toBeTruthy()
    expect(wrapper.emitted('restore')![0]).toEqual([1]) // Numeric ID instead of slug
  })
})

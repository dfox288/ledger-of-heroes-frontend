// tests/components/character/sheet/ClassResources.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassResources from '~/components/character/sheet/ClassResources.vue'
import type { Counter } from '~/types/character'

const createCounter = (overrides: Partial<Counter> = {}): Counter => ({
  id: 1,
  slug: 'phb:bard:bardic-inspiration',
  name: 'Bardic Inspiration',
  current: 3,
  max: 5,
  reset_on: 'long_rest',
  source: 'Bard',
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
      createCounter({ name: 'Bardic Inspiration', slug: 'phb:bard:bardic-inspiration' }),
      createCounter({ id: 2, name: 'Ki Points', slug: 'phb:monk:ki', max: 10 })
    ]
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters }
    })
    expect(wrapper.text()).toContain('Bardic Inspiration')
    expect(wrapper.text()).toContain('Ki Points')
  })

  it('emits spend event from child counter', async () => {
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters: [createCounter()], editable: true }
    })
    const icon = wrapper.find('[data-testid="counter-icon-filled"]')
    await icon.trigger('click')
    expect(wrapper.emitted('spend')).toBeTruthy()
    expect(wrapper.emitted('spend')![0]).toEqual(['phb:bard:bardic-inspiration'])
  })

  it('emits restore event from child counter', async () => {
    const wrapper = await mountSuspended(ClassResources, {
      props: { counters: [createCounter({ max: 10 })], editable: true }
    })
    const incrementBtn = wrapper.find('[data-testid="counter-increment"]')
    await incrementBtn.trigger('click')
    expect(wrapper.emitted('restore')).toBeTruthy()
    expect(wrapper.emitted('restore')![0]).toEqual(['phb:bard:bardic-inspiration'])
  })
})

// tests/components/character/sheet/ClassResourceCounter.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassResourceCounter from '~/components/character/sheet/ClassResourceCounter.vue'
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

describe('ClassResourceCounter', () => {
  it('displays counter name', async () => {
    const wrapper = await mountSuspended(ClassResourceCounter, {
      props: { counter: createCounter() }
    })
    expect(wrapper.text()).toContain('Bardic Inspiration')
  })

  it('displays current/max values', async () => {
    const wrapper = await mountSuspended(ClassResourceCounter, {
      props: { counter: createCounter({ current: 3, max: 5 }) }
    })
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('5')
  })
})

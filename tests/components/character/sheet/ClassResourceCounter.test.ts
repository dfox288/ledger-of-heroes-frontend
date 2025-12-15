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

  describe('Icon Mode (max <= 6)', () => {
    it('shows icons when max <= 6', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ max: 5 }) }
      })
      const icons = wrapper.findAll('[data-testid^="counter-icon"]')
      expect(icons.length).toBe(5)
    })

    it('shows filled icons for current value', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }) }
      })
      const filled = wrapper.findAll('[data-testid="counter-icon-filled"]')
      const empty = wrapper.findAll('[data-testid="counter-icon-empty"]')
      expect(filled.length).toBe(3)
      expect(empty.length).toBe(2)
    })

    it('shows all empty icons when depleted', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 0, max: 4 }) }
      })
      const filled = wrapper.findAll('[data-testid="counter-icon-filled"]')
      const empty = wrapper.findAll('[data-testid="counter-icon-empty"]')
      expect(filled.length).toBe(0)
      expect(empty.length).toBe(4)
    })
  })

  describe('Numeric Mode (max > 6)', () => {
    it('shows numeric display when max > 6', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 12, max: 15 }) }
      })
      // Should NOT show icons
      const icons = wrapper.findAll('[data-testid^="counter-icon"]')
      expect(icons.length).toBe(0)
      // Should show +/- buttons
      expect(wrapper.find('[data-testid="counter-decrement"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="counter-increment"]').exists()).toBe(true)
    })

    it('shows +/- buttons in numeric mode', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ max: 20 }), editable: true }
      })
      expect(wrapper.find('[data-testid="counter-decrement"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="counter-increment"]').exists()).toBe(true)
    })
  })
})

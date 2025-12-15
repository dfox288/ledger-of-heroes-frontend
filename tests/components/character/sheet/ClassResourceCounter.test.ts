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

  describe('Icon Interactions', () => {
    it('emits spend when filled icon clicked in editable mode', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }), editable: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      await filled.trigger('click')
      expect(wrapper.emitted('spend')).toBeTruthy()
      expect(wrapper.emitted('spend')![0]).toEqual(['phb:bard:bardic-inspiration'])
    })

    it('does not emit spend when not editable', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }), editable: false }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      await filled.trigger('click')
      expect(wrapper.emitted('spend')).toBeFalsy()
    })

    it('does not emit spend when disabled', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }), editable: true, disabled: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      await filled.trigger('click')
      expect(wrapper.emitted('spend')).toBeFalsy()
    })

    it('does not emit spend when counter is at 0', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 0, max: 5 }), editable: true }
      })
      // No filled icons to click when current is 0
      const filled = wrapper.findAll('[data-testid="counter-icon-filled"]')
      expect(filled.length).toBe(0)
    })
  })

  describe('Reset Badge', () => {
    it('shows "Long" badge for long_rest reset', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ reset_on: 'long_rest' }) }
      })
      expect(wrapper.text()).toContain('Long')
    })

    it('shows "Short" badge for short_rest reset', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ reset_on: 'short_rest' }) }
      })
      expect(wrapper.text()).toContain('Short')
    })

    it('shows no badge when reset_on is null', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ reset_on: null }) }
      })
      expect(wrapper.find('[data-testid="reset-badge"]').exists()).toBe(false)
    })
  })
})

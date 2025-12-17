// tests/components/character/sheet/ClassResourceCounter.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassResourceCounter from '~/components/character/sheet/ClassResourceCounter.vue'
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

  // Counter routing updated in #725 - now uses numeric ID instead of slug
  describe('Icon Interactions', () => {
    it('emits spend with counter ID when filled icon clicked in editable mode', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ id: 1, current: 3, max: 5 }), editable: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      await filled.trigger('click')
      expect(wrapper.emitted('spend')).toBeTruthy()
      expect(wrapper.emitted('spend')![0]).toEqual([1]) // Numeric ID
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

  describe('Keyboard Accessibility', () => {
    it('filled icons are focusable when interactive', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }), editable: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      expect(filled.attributes('tabindex')).toBe('0')
    })

    it('filled icons are not focusable when not interactive', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }), editable: false }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      expect(filled.attributes('tabindex')).toBe('-1')
    })

    it('emits spend with counter ID on Enter key press', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ id: 1, current: 3, max: 5 }), editable: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      await filled.trigger('keydown.enter')
      expect(wrapper.emitted('spend')).toBeTruthy()
      expect(wrapper.emitted('spend')![0]).toEqual([1]) // Numeric ID
    })

    it('emits spend with counter ID on Space key press', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ id: 1, current: 3, max: 5 }), editable: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      await filled.trigger('keydown.space')
      expect(wrapper.emitted('spend')).toBeTruthy()
      expect(wrapper.emitted('spend')![0]).toEqual([1]) // Numeric ID
    })

    it('has accessible role and label', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 5 }), editable: true }
      })
      const filled = wrapper.find('[data-testid="counter-icon-filled"]')
      expect(filled.attributes('role')).toBe('button')
      expect(filled.attributes('aria-label')).toContain('Spend')
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

    it('shows no badge for unlimited counters', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ unlimited: true, reset_on: 'long_rest' }) }
      })
      expect(wrapper.find('[data-testid="reset-badge"]').exists()).toBe(false)
    })
  })

  describe('Unlimited Counters', () => {
    it('allows spending when unlimited even at 0', async () => {
      // For unlimited counters in numeric mode (since max > 6 is false here, it's icon mode)
      // But with current: 0, there are no filled icons - however the component should still be interactive
      // Let's use numeric mode to test the button
      const wrapperNumeric = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 0, max: 10, unlimited: true }), editable: true }
      })
      const decrementBtn = wrapperNumeric.find('[data-testid="counter-decrement"]')
      expect(decrementBtn.attributes('disabled')).toBeUndefined()
    })

    it('disables restore button for unlimited counters', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ current: 3, max: 10, unlimited: true }), editable: true }
      })
      const incrementBtn = wrapper.find('[data-testid="counter-increment"]')
      expect(incrementBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Numeric Mode ARIA', () => {
    it('has aria-label on decrement button', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ max: 10 }), editable: true }
      })
      const decrementBtn = wrapper.find('[data-testid="counter-decrement"]')
      expect(decrementBtn.attributes('aria-label')).toContain('Spend')
    })

    it('has aria-label on increment button', async () => {
      const wrapper = await mountSuspended(ClassResourceCounter, {
        props: { counter: createCounter({ max: 10 }), editable: true }
      })
      const incrementBtn = wrapper.find('[data-testid="counter-increment"]')
      expect(incrementBtn.attributes('aria-label')).toContain('Restore')
    })
  })
})

// tests/components/character/sheet/DeathSaves.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DeathSaves from '~/components/character/sheet/DeathSaves.vue'

describe('CharacterSheetDeathSaves', () => {
  it('displays title', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 0, failures: 0 }
    })
    expect(wrapper.text()).toContain('Death Saves')
  })

  it('displays successes label', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 0, failures: 0 }
    })
    expect(wrapper.text()).toContain('Successes')
  })

  it('displays failures label', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 0, failures: 0 }
    })
    expect(wrapper.text()).toContain('Failures')
  })

  it('displays 0/0 state with no filled circles', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 0, failures: 0 }
    })
    // Should have 3 empty success circles and 3 empty failure circles
    const emptySuccess = wrapper.findAll('[data-testid^="success-empty"]')
    const emptyFailure = wrapper.findAll('[data-testid^="failure-empty"]')
    expect(emptySuccess.length).toBe(3)
    expect(emptyFailure.length).toBe(3)
  })

  it('displays 2 successes correctly', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 2, failures: 0 }
    })
    const filledSuccess = wrapper.findAll('[data-testid^="success-filled"]')
    const emptySuccess = wrapper.findAll('[data-testid^="success-empty"]')
    expect(filledSuccess.length).toBe(2)
    expect(emptySuccess.length).toBe(1)
  })

  it('displays 1 failure correctly', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 0, failures: 1 }
    })
    const filledFailure = wrapper.findAll('[data-testid^="failure-filled"]')
    const emptyFailure = wrapper.findAll('[data-testid^="failure-empty"]')
    expect(filledFailure.length).toBe(1)
    expect(emptyFailure.length).toBe(2)
  })

  it('displays combined state (2 successes, 1 failure)', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 2, failures: 1 }
    })
    const filledSuccess = wrapper.findAll('[data-testid^="success-filled"]')
    const emptySuccess = wrapper.findAll('[data-testid^="success-empty"]')
    const filledFailure = wrapper.findAll('[data-testid^="failure-filled"]')
    const emptyFailure = wrapper.findAll('[data-testid^="failure-empty"]')

    expect(filledSuccess.length).toBe(2)
    expect(emptySuccess.length).toBe(1)
    expect(filledFailure.length).toBe(1)
    expect(emptyFailure.length).toBe(2)
  })

  it('displays max successes (3/3)', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 3, failures: 0 }
    })
    const filledSuccess = wrapper.findAll('[data-testid^="success-filled"]')
    const emptySuccess = wrapper.findAll('[data-testid^="success-empty"]')
    expect(filledSuccess.length).toBe(3)
    expect(emptySuccess.length).toBe(0)
  })

  it('displays max failures (3/3)', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 0, failures: 3 }
    })
    const filledFailure = wrapper.findAll('[data-testid^="failure-filled"]')
    const emptyFailure = wrapper.findAll('[data-testid^="failure-empty"]')
    expect(filledFailure.length).toBe(3)
    expect(emptyFailure.length).toBe(0)
  })

  it('displays both at max (3/3 successes, 3/3 failures)', async () => {
    const wrapper = await mountSuspended(DeathSaves, {
      props: { successes: 3, failures: 3 }
    })
    const filledSuccess = wrapper.findAll('[data-testid^="success-filled"]')
    const filledFailure = wrapper.findAll('[data-testid^="failure-filled"]')
    expect(filledSuccess.length).toBe(3)
    expect(filledFailure.length).toBe(3)
  })

  // =========================================================================
  // Editable Mode Tests
  // =========================================================================

  describe('editable mode', () => {
    it('circles are not clickable when editable is false (default)', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 1, failures: 0 }
      })
      const successCircle = wrapper.find('[data-testid="success-filled-1"]')
      await successCircle.trigger('click')
      // Should not emit anything
      expect(wrapper.emitted('update:successes')).toBeUndefined()
    })

    it('clicking empty success circle emits update:successes with incremented value', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 1, failures: 0, editable: true }
      })
      // Click the second (empty) success circle to go from 1 to 2
      const emptySuccessCircle = wrapper.find('[data-testid="success-empty-2"]')
      await emptySuccessCircle.trigger('click')
      expect(wrapper.emitted('update:successes')).toBeTruthy()
      expect(wrapper.emitted('update:successes')![0]).toEqual([2])
    })

    it('clicking filled success circle emits update:successes with decremented value', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 2, failures: 0, editable: true }
      })
      // Click the second (filled) success circle to go from 2 to 1
      const filledSuccessCircle = wrapper.find('[data-testid="success-filled-2"]')
      await filledSuccessCircle.trigger('click')
      expect(wrapper.emitted('update:successes')).toBeTruthy()
      expect(wrapper.emitted('update:successes')![0]).toEqual([1])
    })

    it('clicking empty failure circle emits update:failures with incremented value', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 0, failures: 1, editable: true }
      })
      // Click the second (empty) failure circle to go from 1 to 2
      const emptyFailureCircle = wrapper.find('[data-testid="failure-empty-2"]')
      await emptyFailureCircle.trigger('click')
      expect(wrapper.emitted('update:failures')).toBeTruthy()
      expect(wrapper.emitted('update:failures')![0]).toEqual([2])
    })

    it('clicking filled failure circle emits update:failures with decremented value', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 0, failures: 2, editable: true }
      })
      // Click the second (filled) failure circle to go from 2 to 1
      const filledFailureCircle = wrapper.find('[data-testid="failure-filled-2"]')
      await filledFailureCircle.trigger('click')
      expect(wrapper.emitted('update:failures')).toBeTruthy()
      expect(wrapper.emitted('update:failures')![0]).toEqual([1])
    })

    it('shows "Stabilized" badge when successes equals 3', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 3, failures: 0, editable: true }
      })
      expect(wrapper.find('[data-testid="stabilized-badge"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Stabilized')
    })

    it('shows "Dead" badge when failures equals 3', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 0, failures: 3, editable: true }
      })
      expect(wrapper.find('[data-testid="dead-badge"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Dead')
    })

    it('has hover cursor on circles when editable', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 1, failures: 0, editable: true }
      })
      const successCircle = wrapper.find('[data-testid="success-filled-1"]')
      expect(successCircle.classes()).toContain('cursor-pointer')
    })

    it('cannot increment successes beyond 3', async () => {
      const wrapper = await mountSuspended(DeathSaves, {
        props: { successes: 3, failures: 0, editable: true }
      })
      // All circles are filled, clicking should not emit (already at max)
      const filledCircle = wrapper.find('[data-testid="success-filled-3"]')
      await filledCircle.trigger('click')
      // Should emit decrement to 2, not increment
      expect(wrapper.emitted('update:successes')![0]).toEqual([2])
    })
  })
})

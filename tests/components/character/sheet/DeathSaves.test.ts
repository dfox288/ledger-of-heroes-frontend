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
})

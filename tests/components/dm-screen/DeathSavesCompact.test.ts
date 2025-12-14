import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DeathSavesCompact from '~/components/dm-screen/DeathSavesCompact.vue'

describe('DmScreenDeathSavesCompact', () => {
  it('displays successes and failures', async () => {
    const wrapper = await mountSuspended(DeathSavesCompact, {
      props: { successes: 2, failures: 1 }
    })
    // Should show ●●○ for successes and ●○○ for failures
    expect(wrapper.text()).toContain('S')
    expect(wrapper.text()).toContain('F')
  })

  it('shows correct number of filled success circles', async () => {
    const wrapper = await mountSuspended(DeathSavesCompact, {
      props: { successes: 2, failures: 0 }
    })
    const filledSuccess = wrapper.findAll('[data-testid^="success-filled"]')
    expect(filledSuccess.length).toBe(2)
  })

  it('shows correct number of filled failure circles', async () => {
    const wrapper = await mountSuspended(DeathSavesCompact, {
      props: { successes: 0, failures: 2 }
    })
    const filledFailure = wrapper.findAll('[data-testid^="failure-filled"]')
    expect(filledFailure.length).toBe(2)
  })

  it('hides when both are zero', async () => {
    const wrapper = await mountSuspended(DeathSavesCompact, {
      props: { successes: 0, failures: 0 }
    })
    expect(wrapper.find('[data-testid="death-saves-container"]').exists()).toBe(false)
  })

  it('shows stabilized indicator at 3 successes', async () => {
    const wrapper = await mountSuspended(DeathSavesCompact, {
      props: { successes: 3, failures: 0 }
    })
    expect(wrapper.text()).toMatch(/stab|stable/i)
  })

  it('shows dead indicator at 3 failures', async () => {
    const wrapper = await mountSuspended(DeathSavesCompact, {
      props: { successes: 0, failures: 3 }
    })
    expect(wrapper.text()).toMatch(/dead|skull/i)
  })
})

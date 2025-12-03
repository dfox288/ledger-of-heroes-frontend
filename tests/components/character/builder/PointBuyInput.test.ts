// tests/components/character/builder/PointBuyInput.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import PointBuyInput from '~/components/character/builder/PointBuyInput.vue'

const baseScores = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8
}

describe('PointBuyInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders 6 ability scores with +/- buttons', async () => {
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: baseScores }
    })
    expect(wrapper.findAll('[data-testid^="score-"]')).toHaveLength(6)
    expect(wrapper.findAll('[data-testid$="-increase"]')).toHaveLength(6)
    expect(wrapper.findAll('[data-testid$="-decrease"]')).toHaveLength(6)
  })

  it('shows points remaining', async () => {
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: baseScores }
    })
    // All 8s = 0 points spent, 27 remaining
    expect(wrapper.text()).toContain('27')
  })

  it('calculates points spent correctly', async () => {
    const spentScores = {
      strength: 15, // 9 points
      dexterity: 14, // 7 points
      constitution: 13, // 5 points
      intelligence: 8, // 0 points
      wisdom: 8, // 0 points
      charisma: 8 // 0 points
    } // Total: 21 points spent, 6 remaining

    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: spentScores }
    })
    expect(wrapper.text()).toContain('6')
  })

  it('emits update when + clicked', async () => {
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: baseScores }
    })
    await wrapper.find('[data-testid="strength-increase"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({ strength: 9 })
  })

  it('emits update when - clicked', async () => {
    const scores = { ...baseScores, strength: 10 }
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: scores }
    })
    await wrapper.find('[data-testid="strength-decrease"]').trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({ strength: 9 })
  })

  it('disables - button at minimum (8)', async () => {
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: baseScores }
    })
    const decreaseBtn = wrapper.find('[data-testid="strength-decrease"]')
    expect(decreaseBtn.attributes('disabled')).toBeDefined()
  })

  it('disables + button at maximum (15)', async () => {
    const maxScores = { ...baseScores, strength: 15 }
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: maxScores }
    })
    const increaseBtn = wrapper.find('[data-testid="strength-increase"]')
    expect(increaseBtn.attributes('disabled')).toBeDefined()
  })

  it('reports valid when points not exceeded', async () => {
    const wrapper = await mountSuspended(PointBuyInput, {
      props: { modelValue: baseScores }
    })
    const emittedValid = wrapper.emitted('update:valid')
    expect(emittedValid).toBeTruthy()
    expect(emittedValid![0][0]).toBe(true)
  })
})

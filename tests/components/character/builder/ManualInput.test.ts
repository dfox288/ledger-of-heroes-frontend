// tests/components/character/builder/ManualInput.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ManualInput from '~/components/character/builder/ManualInput.vue'

const defaultScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
}

describe('ManualInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders 6 ability score inputs', async () => {
    const wrapper = await mountSuspended(ManualInput, {
      props: { modelValue: defaultScores }
    })
    expect(wrapper.findAll('input[type="number"]')).toHaveLength(6)
  })

  it('displays current values', async () => {
    const scores = { ...defaultScores, strength: 15 }
    const wrapper = await mountSuspended(ManualInput, {
      props: { modelValue: scores }
    })
    const strInput = wrapper.find('[data-testid="input-strength"]')
    expect((strInput.element as HTMLInputElement).value).toBe('15')
  })

  it('emits update when value changes', async () => {
    const wrapper = await mountSuspended(ManualInput, {
      props: { modelValue: defaultScores }
    })
    const strInput = wrapper.find('[data-testid="input-strength"]')
    await strInput.setValue(14)

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({ strength: 14 })
  })

  it('reports valid when all scores in range 3-20', async () => {
    const wrapper = await mountSuspended(ManualInput, {
      props: { modelValue: defaultScores }
    })
    const emittedValid = wrapper.emitted('update:valid')
    expect(emittedValid).toBeTruthy()
    expect(emittedValid![0][0]).toBe(true)
  })

  it('reports invalid when score out of range', async () => {
    const invalidScores = { ...defaultScores, strength: 25 }
    const wrapper = await mountSuspended(ManualInput, {
      props: { modelValue: invalidScores }
    })
    const emittedValid = wrapper.emitted('update:valid')
    expect(emittedValid).toBeTruthy()
    expect(emittedValid![0][0]).toBe(false)
  })
})

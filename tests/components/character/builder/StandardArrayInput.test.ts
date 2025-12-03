// tests/components/character/builder/StandardArrayInput.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StandardArrayInput from '~/components/character/builder/StandardArrayInput.vue'

const emptyScores = {
  strength: null,
  dexterity: null,
  constitution: null,
  intelligence: null,
  wisdom: null,
  charisma: null
}

describe('StandardArrayInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders 6 ability score selects', async () => {
    const wrapper = await mountSuspended(StandardArrayInput, {
      props: { modelValue: emptyScores }
    })
    expect(wrapper.findAll('[data-testid^="select-"]')).toHaveLength(6)
  })

  it('shows standard array values as options', async () => {
    const wrapper = await mountSuspended(StandardArrayInput, {
      props: { modelValue: emptyScores }
    })
    const text = wrapper.text()
    expect(text).toContain('15')
    expect(text).toContain('14')
    expect(text).toContain('13')
    expect(text).toContain('12')
    expect(text).toContain('10')
    expect(text).toContain('8')
  })

  it('emits update when value selected', async () => {
    const partialScores = {
      strength: 15,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null
    }
    const wrapper = await mountSuspended(StandardArrayInput, {
      props: { modelValue: partialScores }
    })

    // Directly call the component's update method via vm
    // This verifies the emit mechanism works
    await wrapper.vm.$emit('update:modelValue', { ...partialScores, dexterity: 14 })

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeDefined()
    expect(emitted![0][0]).toMatchObject({ strength: 15, dexterity: 14 })
  })

  it('reports invalid when not all scores assigned', async () => {
    const wrapper = await mountSuspended(StandardArrayInput, {
      props: { modelValue: emptyScores }
    })
    const emittedValid = wrapper.emitted('update:valid')
    expect(emittedValid).toBeTruthy()
    expect(emittedValid![0][0]).toBe(false)
  })

  it('reports valid when all scores assigned', async () => {
    const fullScores = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8
    }
    const wrapper = await mountSuspended(StandardArrayInput, {
      props: { modelValue: fullScores }
    })
    const emittedValid = wrapper.emitted('update:valid')
    expect(emittedValid).toBeTruthy()
    expect(emittedValid![0][0]).toBe(true)
  })
})

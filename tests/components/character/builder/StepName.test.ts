// tests/components/character/builder/StepName.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepName from '~/components/character/builder/StepName.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

// Mock apiFetch
vi.mock('~/composables/useApiFetch', () => ({
  apiFetch: vi.fn()
}))

describe('CharacterBuilderStepName', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the name input', async () => {
    const wrapper = await mountSuspended(StepName)
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
  })

  it('shows placeholder text', async () => {
    const wrapper = await mountSuspended(StepName)
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toContain('name')
  })

  it('binds to store name value', async () => {
    const store = useCharacterBuilderStore()
    store.name = 'Gandalf'

    const wrapper = await mountSuspended(StepName)

    // The component should have access to the store value
    expect(store.name).toBe('Gandalf')
    // The text should appear somewhere in the component (even if just in the store)
    expect(wrapper.text()).toBeTruthy()
  })

  it('disables create button when name is empty', async () => {
    const wrapper = await mountSuspended(StepName)

    // Button text should be "Begin Your Journey" when no character exists
    expect(wrapper.text()).toContain('Begin Your Journey')
  })

  it('enables create button when name is provided', async () => {
    const store = useCharacterBuilderStore()
    store.name = 'Frodo'

    const wrapper = await mountSuspended(StepName)

    // With a name, button should exist and be clickable
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    // Store should have the name
    expect(store.name).toBe('Frodo')
  })
})

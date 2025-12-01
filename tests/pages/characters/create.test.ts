// tests/pages/characters/create.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import CharacterCreatePage from '~/pages/characters/create.vue'

describe('CharacterCreatePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    const wrapper = await mountSuspended(CharacterCreatePage)
    expect(wrapper.text()).toContain('Create Your Character')
  })

  it('displays the stepper component', async () => {
    const wrapper = await mountSuspended(CharacterCreatePage)
    expect(wrapper.findComponent({ name: 'CharacterBuilderStepper' }).exists()).toBe(true)
  })

  it('shows step 1 content initially', async () => {
    const wrapper = await mountSuspended(CharacterCreatePage)
    expect(wrapper.findComponent({ name: 'CharacterBuilderStepName' }).exists()).toBe(true)
  })
})

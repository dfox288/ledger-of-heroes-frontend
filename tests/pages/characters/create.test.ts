// tests/pages/characters/create.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CharacterCreatePage from '~/pages/characters/create.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

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

  describe('step reset on new character (issue #97)', () => {
    it('resets to step 1 when page loads with leftover step state but no character', async () => {
      // Mount the page first
      const wrapper = await mountSuspended(CharacterCreatePage)

      // Get the same store instance the component is using
      const store = useCharacterBuilderStore()

      // Simulate leftover state (as if persisted from previous session)
      store.currentStep = 3
      store.characterId = null

      // Trigger a re-mount by unmounting and remounting
      // This simulates the user navigating TO the create page
      wrapper.unmount()

      const newWrapper = await mountSuspended(CharacterCreatePage)
      await flushPromises()
      await newWrapper.vm.$nextTick()

      // Should reset to step 1 and show the name input step
      expect(store.currentStep).toBe(1)
      expect(newWrapper.findComponent({ name: 'CharacterBuilderStepName' }).exists()).toBe(true)
    })

    it('preserves step when resuming an in-progress character', async () => {
      // Simulate an in-progress character
      const store = useCharacterBuilderStore()
      store.currentStep = 3
      store.characterId = 42 // Character exists

      // Mount the page
      await mountSuspended(CharacterCreatePage)

      // Should stay on step 3 (resuming in-progress character)
      // Note: We only test store state here because rendering step 3
      // requires additional setup (race/class data loaded)
      expect(store.currentStep).toBe(3)
    })
  })
})

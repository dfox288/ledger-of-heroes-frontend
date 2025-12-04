// tests/pages/characters/edit.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'

// Mock navigateTo
const mockNavigateTo = vi.fn()
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    navigateTo: (...args: unknown[]) => mockNavigateTo(...args)
  }
})

// Mock the store with proper refs for storeToRefs
const mockLoadCharacterForEditing = vi.fn()
const mockReset = vi.fn()

const mockStore = {
  loadCharacterForEditing: mockLoadCharacterForEditing,
  reset: mockReset,
  currentStep: ref(1),
  isCaster: computed(() => false),
  needsSubrace: computed(() => false),
  hasPendingChoices: computed(() => false),
  isLoading: ref(false),
  error: ref(null),
  name: ref('Test Character'),
  characterId: ref(42)
}

vi.mock('~/stores/characterBuilder', () => ({
  useCharacterBuilderStore: () => mockStore
}))

// Mock useWizardNavigation
const mockActiveSteps = ref([
  { name: 'name', label: 'Name', icon: 'i-heroicons-user', visible: () => true },
  { name: 'race', label: 'Race', icon: 'i-heroicons-globe-alt', visible: () => true },
  { name: 'class', label: 'Class', icon: 'i-heroicons-shield-check', visible: () => true },
  { name: 'review', label: 'Review', icon: 'i-heroicons-check-circle', visible: () => true }
])

vi.mock('~/composables/useWizardSteps', () => ({
  useWizardNavigation: () => ({
    activeSteps: mockActiveSteps,
    currentStep: computed(() => mockActiveSteps.value[0]),
    currentStepIndex: computed(() => 0),
    isFirstStep: computed(() => true),
    isLastStep: computed(() => false),
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    goToStep: vi.fn()
  }),
  stepRegistry: mockActiveSteps.value
}))

// Mock vue-router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      params: { id: '42', step: 'name' },
      query: {}
    }))
  }
})

describe('CharacterEditPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLoadCharacterForEditing.mockReset()
    mockReset.mockReset()
    mockNavigateTo.mockReset()
  })

  it('calls loadCharacterForEditing on mount', async () => {
    mockLoadCharacterForEditing.mockResolvedValue(undefined)

    const CharacterEditPage = await import('~/pages/characters/[id]/edit.vue')
    await mountSuspended(CharacterEditPage.default, {
      route: '/characters/42/edit/name'
    })
    await flushPromises()

    expect(mockReset).toHaveBeenCalled()
    expect(mockLoadCharacterForEditing).toHaveBeenCalledWith(42)
  })

  it('displays page title "Edit Character"', async () => {
    mockLoadCharacterForEditing.mockResolvedValue(undefined)

    const CharacterEditPage = await import('~/pages/characters/[id]/edit.vue')
    const wrapper = await mountSuspended(CharacterEditPage.default, {
      route: '/characters/42/edit/name'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Edit Character')
  })

  it('displays character name in subtitle', async () => {
    mockLoadCharacterForEditing.mockResolvedValue(undefined)

    const CharacterEditPage = await import('~/pages/characters/[id]/edit.vue')
    const wrapper = await mountSuspended(CharacterEditPage.default, {
      route: '/characters/42/edit/name'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Test Character')
  })
})

describe('CharacterEditPage - New Character Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLoadCharacterForEditing.mockReset()
    mockReset.mockReset()
    mockNavigateTo.mockReset()
  })

  it('redirects to name step when ?new=true and not on name step', async () => {
    mockLoadCharacterForEditing.mockResolvedValue(undefined)

    // Mock useRoute to include query param and different step
    const { useRoute } = await import('vue-router')
    vi.mocked(useRoute).mockReturnValue({
      params: { id: '42', step: 'race' },
      query: { new: 'true' }
    } as ReturnType<typeof useRoute>)

    const CharacterEditPage = await import('~/pages/characters/[id]/edit.vue')
    await mountSuspended(CharacterEditPage.default, {
      route: '/characters/42/edit/race?new=true'
    })
    await flushPromises()

    // Should redirect to name step
    expect(mockNavigateTo).toHaveBeenCalledWith('/characters/42/edit/name')
  })

  it('does not redirect when already on name step with ?new=true', async () => {
    mockLoadCharacterForEditing.mockResolvedValue(undefined)

    // Mock useRoute to be on name step with new=true
    const { useRoute } = await import('vue-router')
    vi.mocked(useRoute).mockReturnValue({
      params: { id: '42', step: 'name' },
      query: { new: 'true' }
    } as ReturnType<typeof useRoute>)

    const CharacterEditPage = await import('~/pages/characters/[id]/edit.vue')
    await mountSuspended(CharacterEditPage.default, {
      route: '/characters/42/edit/name?new=true'
    })
    await flushPromises()

    // Should NOT redirect (already on name step)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})

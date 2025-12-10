// tests/components/character/levelup/LevelUpWizard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

// =============================================================================
// MOCK SETUP
// =============================================================================

const mockCloseWizard = vi.fn()
const mockGoToStep = vi.fn()

const mockIsOpen = ref(true)
const mockCurrentStepName = ref('hit-points')
const mockIsLoading = ref(false)
const mockError = ref<string | null>(null)
const mockLevelUpResult = ref(null)
const mockCharacterClasses = ref([
  { class: { id: 1, name: 'Fighter', slug: 'fighter', hit_die: 10 }, level: 3 }
])
const mockNeedsClassSelection = ref(false)

vi.mock('~/stores/characterLevelUp', () => ({
  useCharacterLevelUpStore: vi.fn(() => ({
    get isOpen() { return mockIsOpen.value },
    set isOpen(v: boolean) { mockIsOpen.value = v },
    get currentStepName() { return mockCurrentStepName.value },
    get isLoading() { return mockIsLoading.value },
    get error() { return mockError.value },
    get levelUpResult() { return mockLevelUpResult.value },
    get characterClasses() { return mockCharacterClasses.value },
    get publicId() { return 'test-char-xxxx' },
    get characterId() { return 1 },
    get selectedClassSlug() { return 'phb:fighter' },
    get needsClassSelection() { return mockNeedsClassSelection.value },
    closeWizard: mockCloseWizard,
    goToStep: mockGoToStep
  }))
}))

vi.mock('~/composables/useLevelUpWizard', () => ({
  useLevelUpWizard: vi.fn(() => ({
    stepRegistry: [
      { name: 'hit-points', label: 'Hit Points', icon: 'i-heroicons-heart', visible: () => true },
      { name: 'summary', label: 'Summary', icon: 'i-heroicons-trophy', visible: () => true }
    ],
    activeSteps: ref([
      { name: 'hit-points', label: 'Hit Points', icon: 'i-heroicons-heart' },
      { name: 'summary', label: 'Summary', icon: 'i-heroicons-trophy' }
    ]),
    currentStepIndex: ref(0),
    progressPercent: ref(0),
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    goToStep: mockGoToStep
  }))
}))

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn().mockResolvedValue({ data: { constitution_modifier: 2 } })
  })
}))

// Import component AFTER mocks
// eslint-disable-next-line import/first
import LevelUpWizard from '~/components/character/levelup/LevelUpWizard.vue'

// =============================================================================
// TESTS
// =============================================================================

describe('LevelUpWizard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockIsOpen.value = true
    mockCurrentStepName.value = 'hit-points'
    mockIsLoading.value = false
    mockError.value = null
  })

  it('renders when open', async () => {
    const wrapper = await mountSuspended(LevelUpWizard)

    expect(wrapper.find('[data-testid="level-up-wizard"]').exists()).toBe(true)
  })

  it('shows sidebar', async () => {
    const wrapper = await mountSuspended(LevelUpWizard)

    expect(wrapper.find('[data-testid="level-up-sidebar"]').exists()).toBe(true)
  })

  it('has close button', async () => {
    const wrapper = await mountSuspended(LevelUpWizard)

    expect(wrapper.find('[data-testid="close-button"]').exists()).toBe(true)
  })

  it('calls closeWizard when close button clicked', async () => {
    const wrapper = await mountSuspended(LevelUpWizard)

    await wrapper.find('[data-testid="close-button"]').trigger('click')
    expect(mockCloseWizard).toHaveBeenCalled()
  })

  it('shows error alert when error is set', async () => {
    mockError.value = 'Something went wrong'
    const wrapper = await mountSuspended(LevelUpWizard)

    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('shows loading spinner when loading', async () => {
    mockIsLoading.value = true
    const wrapper = await mountSuspended(LevelUpWizard)

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
  })

  it('displays wizard title', async () => {
    const wrapper = await mountSuspended(LevelUpWizard)

    expect(wrapper.text()).toContain('Level Up')
  })
})

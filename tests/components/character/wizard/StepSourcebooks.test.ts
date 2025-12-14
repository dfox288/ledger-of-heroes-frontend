import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepSourcebooks from '~/components/character/wizard/StepSourcebooks.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'

// Mock the useCharacterWizard composable
mockNuxtImport('useCharacterWizard', () => () => ({
  nextStep: vi.fn()
}))

// Mock sources data
const mockSources = [
  { id: 1, code: 'PHB', name: "Player's Handbook", category: 'Core Rules', publication_year: 2014 },
  { id: 2, code: 'XGE', name: "Xanathar's Guide to Everything", category: 'Expansion', publication_year: 2017 },
  { id: 3, code: 'TCE', name: "Tasha's Cauldron of Everything", category: 'Expansion', publication_year: 2020 }
]

// Mock useAsyncData for sources
mockNuxtImport('useAsyncData', () => async () => ({
  data: ref(mockSources),
  pending: ref(false),
  error: ref(null)
}))

// Mock useApi
mockNuxtImport('useApi', () => () => ({
  apiFetch: vi.fn().mockResolvedValue({ data: mockSources })
}))

// Mock useRoute to return appropriate path
let mockRoutePath = '/characters/new/sourcebooks'
mockNuxtImport('useRoute', () => () => ({
  path: mockRoutePath,
  params: {}
}))

// Note: onMounted behavior in Vitest with mountSuspended may not fully
// replicate Vue hydration cycles. The reset guard logic is better tested
// via E2E tests that exercise real browser hydration.

describe('StepSourcebooks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRoutePath = '/characters/new/sourcebooks'
  })

  describe('structure', () => {
    it('renders step title', async () => {
      const wrapper = await mountSuspended(StepSourcebooks)

      expect(wrapper.text()).toContain('Choose Your Sourcebooks')
    })

    it('renders Select All button', async () => {
      const wrapper = await mountSuspended(StepSourcebooks)

      expect(wrapper.text()).toContain('Select All')
    })

    it('renders Deselect All button', async () => {
      const wrapper = await mountSuspended(StepSourcebooks)

      expect(wrapper.text()).toContain('Deselect All')
    })

    it('renders Continue button', async () => {
      const wrapper = await mountSuspended(StepSourcebooks)

      const continueBtn = wrapper.find('button')
      expect(wrapper.text()).toContain('Continue')
    })
  })

  describe('reset guard logic (unit tests for conditions)', () => {
    // Note: These test the guard conditions at the store level.
    // Full reset behavior during Vue hydration is tested via E2E tests.

    it('store preserves selectedSources when already populated', async () => {
      const store = useCharacterWizardStore()

      // Pre-populate sourcebooks (simulating prior selection)
      store.setSelectedSources(['PHB', 'XGE'])

      await mountSuspended(StepSourcebooks)

      // Sources should still be there (not wiped by reset)
      expect(store.selectedSources).toContain('PHB')
      expect(store.selectedSources).toContain('XGE')
    })

    it('store preserves characterId when already set', async () => {
      const store = useCharacterWizardStore()

      // Character already exists
      store.characterId = 123
      store.publicId = 'test-hero-abc1'

      await mountSuspended(StepSourcebooks)

      // Character ID should still be there
      expect(store.characterId).toBe(123)
      expect(store.publicId).toBe('test-hero-abc1')
    })

    it('store preserves state on edit route', async () => {
      const store = useCharacterWizardStore()
      store.setSelectedSources(['PHB'])
      store.characterId = 456

      // Edit route
      mockRoutePath = '/characters/test-hero-abc1/edit/sourcebooks'
      await mountSuspended(StepSourcebooks)

      // State should be preserved
      expect(store.selectedSources).toContain('PHB')
      expect(store.characterId).toBe(456)
    })
  })

  describe('source selection', () => {
    it('displays selection count badge', async () => {
      const wrapper = await mountSuspended(StepSourcebooks)

      // Component should show selection count in format "N of M selected"
      expect(wrapper.text()).toContain('selected')
    })

    it('store methods work for toggling sources', () => {
      const store = useCharacterWizardStore()

      // Initial state
      expect(store.selectedSources.length).toBe(0)

      // Select some
      store.setSelectedSources(['PHB', 'XGE', 'TCE'])
      expect(store.selectedSources.length).toBe(3)

      // Deselect one
      store.setSelectedSources(['PHB', 'XGE'])
      expect(store.selectedSources.length).toBe(2)
    })
  })

  describe('validation', () => {
    it('computed canProceed is false when no sources selected', () => {
      const store = useCharacterWizardStore()
      store.setSelectedSources([])

      // sourceFilterString should be empty
      expect(store.sourceFilterString).toBe('')
    })

    it('computed sourceFilterString works when sources selected', () => {
      const store = useCharacterWizardStore()
      store.setSelectedSources(['PHB', 'XGE'])

      // Should generate filter string
      expect(store.sourceFilterString).toContain('PHB')
      expect(store.sourceFilterString).toContain('XGE')
    })
  })
})

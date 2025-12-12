// tests/components/character/wizard/StepSize.test.ts
/**
 * StepSize Component Tests
 *
 * Tests the size selection step for races that allow size choice (e.g., Halfling).
 * Uses mockNuxtImport for composable mocking (Nuxt-specific pattern).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import StepSize from '~/components/character/wizard/StepSize.vue'
import { setupWizardStore, createToastMock } from '../../../helpers/wizardTestSetup'

// =============================================================================
// MOCK SETUP (must be at module level for mockNuxtImport)
// =============================================================================

// Size options for testing
const mockSizeOptions = [
  { id: 1, code: 'S', name: 'Small' },
  { id: 2, code: 'M', name: 'Medium' }
]

// Base size choice structure
const baseSizeChoice = {
  id: 101,
  type: 'size',
  source: 'race',
  label: 'Size',
  quantity: 1,
  options: mockSizeOptions,
  selected: [] as string[],
  metadata: { note: 'You are Small or Medium (your choice).' }
}

// Shared reactive state - modified by tests
const mockChoicesByType = ref({
  sizes: [{ ...baseSizeChoice }],
  proficiencies: [],
  languages: [],
  equipment: [],
  spells: []
})
const mockPending = ref(false)
const mockResolveChoice = vi.fn().mockResolvedValue(undefined)
const mockFetchChoices = vi.fn().mockResolvedValue(undefined)

// Mock useUnifiedChoices composable
mockNuxtImport('useUnifiedChoices', () => {
  return () => ({
    choicesByType: mockChoicesByType,
    pending: mockPending,
    fetchChoices: mockFetchChoices,
    resolveChoice: mockResolveChoice
  })
})

// Mock useToast using helper
mockNuxtImport('useToast', () => () => createToastMock())

// =============================================================================
// TEST HELPERS
// =============================================================================

/** Resets mock state to defaults between tests */
function resetMockState() {
  mockChoicesByType.value = {
    sizes: [{ ...baseSizeChoice, options: [...mockSizeOptions], selected: [] }],
    proficiencies: [],
    languages: [],
    equipment: [],
    spells: []
  }
  mockPending.value = false
  mockResolveChoice.mockClear()
  mockFetchChoices.mockClear()
}

// =============================================================================
// TESTS
// =============================================================================

describe('StepSize', () => {
  beforeEach(() => {
    // Use helper for store setup - creates fresh Pinia + configured store
    setupWizardStore({
      race: { id: 1, name: 'Halfling', slug: 'phb:halfling', speed: 25 }
    })
    resetMockState()
  })

  describe('header rendering', () => {
    it('renders the step title', async () => {
      const wrapper = await mountSuspended(StepSize)
      expect(wrapper.text()).toContain('Choose Your Size')
    })

    it('renders description text for size selection', async () => {
      const wrapper = await mountSuspended(StepSize)
      expect(wrapper.text()).toContain('allows you to choose your size')
    })

    it('renders choice note from metadata', async () => {
      const wrapper = await mountSuspended(StepSize)
      expect(wrapper.text()).toContain('You are Small or Medium (your choice).')
    })

    it('renders fallback text when race not selected', async () => {
      // Setup store without race
      const store = setupWizardStore()
      store.selections.race = null
      const wrapper = await mountSuspended(StepSize)
      expect(wrapper.text()).toContain('Your lineage')
    })
  })

  describe('size options display', () => {
    it('displays size option cards', async () => {
      const wrapper = await mountSuspended(StepSize)
      const text = wrapper.text()
      expect(text).toContain('Small')
      expect(text).toContain('Medium')
    })

    it('renders CharacterSizeCard for each option', async () => {
      const wrapper = await mountSuspended(StepSize)
      const cards = wrapper.findAll('[data-testid="size-picker-card"]')
      expect(cards.length).toBe(2)
    })

    it('shows info alert about size mechanics', async () => {
      const wrapper = await mountSuspended(StepSize)
      expect(wrapper.text()).toContain('Size Matters')
    })
  })

  describe('selection behavior', () => {
    it('disables continue button when no size selected', async () => {
      const wrapper = await mountSuspended(StepSize)
      const continueButton = wrapper.find('[data-testid="continue-button"]')
      expect(continueButton.attributes('disabled')).toBeDefined()
    })

    it('enables continue button after size selection', async () => {
      const wrapper = await mountSuspended(StepSize)

      const card = wrapper.find('[data-testid="size-picker-card"]')
      await card.trigger('click')
      await wrapper.vm.$nextTick()

      const continueButton = wrapper.find('[data-testid="continue-button"]')
      expect(continueButton.attributes('disabled')).toBeUndefined()
    })

    it('shows selected size name in continue button', async () => {
      const wrapper = await mountSuspended(StepSize)

      const card = wrapper.find('[data-testid="size-picker-card"]')
      await card.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Continue as Small')
    })
  })

  describe('confirm selection', () => {
    it('calls resolveChoice with correct payload on confirm', async () => {
      const wrapper = await mountSuspended(StepSize)

      const card = wrapper.find('[data-testid="size-picker-card"]')
      await card.trigger('click')
      await wrapper.vm.$nextTick()

      const continueButton = wrapper.find('[data-testid="continue-button"]')
      await continueButton.trigger('click')

      expect(mockResolveChoice).toHaveBeenCalledWith(101, {
        selected: ['S']
      })
    })

    it('fetches choices on mount', async () => {
      await mountSuspended(StepSize)
      expect(mockFetchChoices).toHaveBeenCalledWith('size')
    })
  })

  describe('loading state', () => {
    it('shows loading spinner when pending and no options', async () => {
      mockChoicesByType.value = {
        sizes: [],
        proficiencies: [],
        languages: [],
        equipment: [],
        spells: []
      }
      mockPending.value = true

      const wrapper = await mountSuspended(StepSize)

      const spinner = wrapper.find('.animate-spin')
      expect(spinner.exists()).toBe(true)
    })

    it('hides loading spinner when options are available', async () => {
      const wrapper = await mountSuspended(StepSize)

      const spinner = wrapper.find('.animate-spin')
      expect(spinner.exists()).toBe(false)
    })
  })

  describe('empty state', () => {
    it('shows warning when no size options available', async () => {
      mockChoicesByType.value = {
        sizes: [{ ...baseSizeChoice, options: [] }],
        proficiencies: [],
        languages: [],
        equipment: [],
        spells: []
      }
      mockPending.value = false

      const wrapper = await mountSuspended(StepSize)

      expect(wrapper.text()).toContain('No size options available')
    })
  })

  describe('error state', () => {
    it('does not show error alert in normal state', async () => {
      const wrapper = await mountSuspended(StepSize)

      const errorAlert = wrapper.find('[color="error"]')
      expect(errorAlert.exists()).toBe(false)
    })
  })

  describe('pre-selected state', () => {
    it('initializes with previously selected size', async () => {
      mockChoicesByType.value = {
        sizes: [{ ...baseSizeChoice, selected: ['M'] }],
        proficiencies: [],
        languages: [],
        equipment: [],
        spells: []
      }

      const wrapper = await mountSuspended(StepSize)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Continue as Medium')
    })
  })
})

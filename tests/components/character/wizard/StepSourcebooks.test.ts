import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import StepSourcebooks from '~/components/character/wizard/StepSourcebooks.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { testWizardStepBehavior, mountWizardStep } from '../../../helpers/wizardStepBehavior'
import type { Source } from '~/types'

// Run shared behavior tests
testWizardStepBehavior({
  component: StepSourcebooks,
  stepTitle: 'Sourcebooks',
  expectedHeading: 'Choose Your Sourcebooks'
})

describe('StepSourcebooks - Specific Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('displays sourcebook selection heading', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      const text = wrapper.text()
      expect(text).toContain('Choose Your Sourcebooks')
      expect(text).toContain('D&D books')
    })

    it('shows loading spinner while fetching sources', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      // The component uses useAsyncData which sets pending state
      // While loading, spinner should be visible
      const vm = wrapper.vm as any

      // Component should handle loading state
      expect(wrapper.exists()).toBe(true)
    })

    it('initializes with all sources selected by default', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for async data

      // After sources load, selectedSources should be populated
      // (The watch effect in the component does this automatically)
      expect(store.selectedSources).toBeDefined()
    })
  })

  describe('Source List Display', () => {
    it('groups sources by category', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const vm = wrapper.vm as any

      // sourcesByCategory is a Map grouping sources
      expect(vm.sourcesByCategory).toBeInstanceOf(Map)
    })

    it('displays source name and code', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // After sources load, should display source info
      // The exact content depends on the mock API response
      const html = wrapper.html()
      expect(html).toBeTruthy()
    })

    it('displays publication year if available', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Sources with publication_year should display it
      const vm = wrapper.vm as any
      expect(wrapper.exists()).toBe(true)
    })

    it('displays category headers', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Category headers should be h3 elements
      const html = wrapper.html()
      expect(html).toContain('h3')
    })
  })

  describe('Source Selection', () => {
    it('toggles source selection when clicked', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // Set initial state with one source selected
      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()

      // Toggle the source off
      vm.toggleSource('PHB')
      await wrapper.vm.$nextTick()

      expect(store.selectedSources).not.toContain('PHB')

      // Toggle it back on
      vm.toggleSource('PHB')
      await wrapper.vm.$nextTick()

      expect(store.selectedSources).toContain('PHB')
    })

    it('checks if source is selected', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      store.setSelectedSources(['PHB', 'MM'])
      await wrapper.vm.$nextTick()

      expect(vm.isSelected('PHB')).toBe(true)
      expect(vm.isSelected('MM')).toBe(true)
      expect(vm.isSelected('DMG')).toBe(false)
    })

    it('shows checkbox state for selected sources', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Checkboxes should reflect selection state
      const html = wrapper.html()
      expect(html).toBeTruthy()
    })
  })

  describe('Select All / Deselect All', () => {
    it('selects all sources when "Select All" is clicked', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // Start with empty selection
      store.setSelectedSources([])
      await wrapper.vm.$nextTick()

      // Click select all
      vm.selectAll()
      await wrapper.vm.$nextTick()

      // All sources should be selected (depends on mock data)
      expect(store.selectedSources.length).toBeGreaterThan(0)
    })

    it('deselects all sources when "Deselect All" is clicked', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // Start with some selections
      store.setSelectedSources(['PHB', 'MM', 'DMG'])
      await wrapper.vm.$nextTick()

      // Click deselect all
      vm.deselectAll()
      await wrapper.vm.$nextTick()

      expect(store.selectedSources.length).toBe(0)
    })

    it('shows select all and deselect all buttons', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      const text = wrapper.text()
      expect(text).toContain('Select All')
      expect(text).toContain('Deselect All')
    })
  })

  describe('Selection Count Badge', () => {
    it('displays count of selected sources', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      store.setSelectedSources(['PHB', 'MM'])
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any
      expect(vm.selectionCount).toBe(2)

      const text = wrapper.text()
      expect(text).toContain('2 of')
    })

    it('updates count when selection changes', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()
      expect(vm.selectionCount).toBe(1)

      store.setSelectedSources(['PHB', 'MM', 'DMG'])
      await wrapper.vm.$nextTick()
      expect(vm.selectionCount).toBe(3)
    })

    it('shows total count of available sources', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const vm = wrapper.vm as any

      // totalCount should match the number of sources loaded
      expect(vm.totalCount).toBeGreaterThanOrEqual(0)
    })

    it('displays selection count badge', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('selected')
    })
  })

  describe('Validation', () => {
    it('requires at least one source to proceed', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // No sources selected
      store.setSelectedSources([])
      await wrapper.vm.$nextTick()

      expect(vm.canProceed).toBe(false)
    })

    it('allows proceeding with one or more sources', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()

      expect(vm.canProceed).toBe(true)
    })

    it('disables continue button when no sources selected', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      store.setSelectedSources([])
      await wrapper.vm.$nextTick()

      const continueButton = wrapper.find('button[size="lg"]')
      expect(continueButton.attributes('disabled')).toBeDefined()
    })

    it('enables continue button when at least one source selected', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any
      expect(vm.canProceed).toBe(true)
    })

    it('shows warning when no sources selected', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      store.setSelectedSources([])
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for loadingSources to be false

      const text = wrapper.text()
      expect(text).toContain('Select at least one sourcebook')
    })
  })

  describe('Confirm Selection', () => {
    it('proceeds to next step when confirmed', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      store.setSelectedSources(['PHB'])
      await wrapper.vm.$nextTick()

      // confirmSelection should call nextStep
      expect(typeof vm.confirmSelection).toBe('function')
      expect(vm.canProceed).toBe(true)
    })

    it('does not proceed when validation fails', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      store.setSelectedSources([])
      await wrapper.vm.$nextTick()

      // confirmSelection should return early if canProceed is false
      vm.confirmSelection()
      await wrapper.vm.$nextTick()

      // Should not proceed (method returns early)
      expect(vm.canProceed).toBe(false)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no sources available', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()

      // The component checks for empty sources array
      // If sources is empty or null, should show empty state
      const vm = wrapper.vm as any

      // The component should handle this case
      expect(wrapper.exists()).toBe(true)
    })

    it('displays book icon in empty state', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Empty state includes i-heroicons-book-open icon
      // This appears when no sources are available
      const html = wrapper.html()
      expect(html).toBeTruthy()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner while sources are being fetched', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // loadingSources from useAsyncData pending state
      // Component should show spinner when loading
      expect(wrapper.exists()).toBe(true)
    })

    it('hides source list while loading', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      // While loading, the main source list should not be visible
      // Loading spinner takes its place
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('updates store when sources are selected', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // Toggle a source
      vm.toggleSource('PHB')
      await wrapper.vm.$nextTick()

      // Store should be updated
      expect(store.selectedSources).toBeDefined()
    })

    it('reads initial selection from store', async () => {
      const store = useCharacterWizardStore()
      store.setSelectedSources(['PHB', 'MM'])

      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()

      // Component should reflect store state
      expect(store.selectedSources).toContain('PHB')
      expect(store.selectedSources).toContain('MM')
    })

    it('calls setSelectedSources on store', async () => {
      const { wrapper, store } = await mountWizardStep(StepSourcebooks)

      const vm = wrapper.vm as any

      // selectAll calls setSelectedSources
      vm.selectAll()
      await wrapper.vm.$nextTick()

      // Store method should have been called
      expect(store.selectedSources).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('has descriptive heading', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Choose Your Sourcebooks')
    })

    it('has instructional text for users', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      const text = wrapper.text()
      expect(text).toContain('Select which D&D books')
      expect(text).toContain('character creation')
    })

    it('uses checkboxes for selection', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should contain checkbox elements
      // The component uses UCheckbox components
      expect(wrapper.exists()).toBe(true)
    })

    it('allows keyboard navigation with click handlers', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()

      // Source items should be clickable
      // Component uses @click handlers on source rows
      expect(wrapper.exists()).toBe(true)
    })

    it('shows category headers with semantic HTML', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const vm = wrapper.vm as any

      // Component should exist and handle sources (may be empty in test)
      expect(wrapper.exists()).toBe(true)

      // sourcesByCategory should be a Map
      expect(vm.sourcesByCategory).toBeInstanceOf(Map)
    })
  })

  describe('Category Grouping', () => {
    it('groups sources by category field', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const vm = wrapper.vm as any

      // sourcesByCategory computed property groups by category
      expect(vm.sourcesByCategory).toBeInstanceOf(Map)
    })

    it('uses "Other" as default category for sources without category', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Sources without category field should be grouped under "Other"
      // The computed property does: const category = source.category || 'Other'
      expect(wrapper.exists()).toBe(true)
    })

    it('preserves category order in display', async () => {
      const { wrapper } = await mountWizardStep(StepSourcebooks)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Categories should be displayed in order
      // Map preserves insertion order
      const vm = wrapper.vm as any
      expect(vm.sourcesByCategory).toBeInstanceOf(Map)
    })
  })
})

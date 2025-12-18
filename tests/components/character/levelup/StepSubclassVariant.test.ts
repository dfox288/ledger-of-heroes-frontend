// tests/components/character/levelup/StepSubclassVariant.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import StepSubclassVariant from '~/components/character/levelup/StepSubclassVariant.vue'

// =============================================================================
// API MOCK SETUP
// =============================================================================

const { mockApiFetch } = vi.hoisted(() => ({
  mockApiFetch: vi.fn()
}))

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({ apiFetch: mockApiFetch })
}))

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

// =============================================================================
// MOCK DATA - Totem Warrior L6 choice
// =============================================================================

const mockTotemAspectChoice = {
  id: 'subclass_variant|subclass|phb:barbarian-path-of-the-totem-warrior|6|totem_aspect',
  type: 'subclass_variant',
  subtype: 'totem_aspect',
  source: 'subclass',
  source_name: 'Path of the Totem Warrior',
  level_granted: 6,
  required: true,
  quantity: 1,
  remaining: 1,
  selected: [],
  options: [
    { value: 'aspect of the bear', name: 'Aspect of the Bear', description: 'You gain the might of a bear.' },
    { value: 'aspect of the eagle', name: 'Aspect of the Eagle', description: 'You gain the eyesight of an eagle.' },
    { value: 'aspect of the wolf', name: 'Aspect of the Wolf', description: 'You gain the cunning of a wolf.' }
  ],
  options_endpoint: null,
  metadata: {
    class_slug: 'phb:barbarian',
    subclass_slug: 'phb:barbarian-path-of-the-totem-warrior',
    choice_group: 'totem_aspect'
  }
}

const mockPendingChoicesResponse = {
  data: {
    choices: [mockTotemAspectChoice],
    summary: { total_pending: 1, required_pending: 1 }
  }
}

// =============================================================================
// TESTS
// =============================================================================

describe('StepSubclassVariant', () => {
  const nextStepMock = vi.fn()
  const refreshAfterSaveMock = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockApiFetch.mockResolvedValue(mockPendingChoicesResponse)
  })

  async function mountComponent() {
    const wrapper = await mountSuspended(StepSubclassVariant, {
      props: {
        characterId: 123,
        publicId: 'totem-warrior-xyz',
        nextStep: nextStepMock,
        refreshAfterSave: refreshAfterSaveMock
      }
    })
    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('displays the choice header with source name', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('Path of the Totem Warrior')
    })

    it('displays all available options', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('Aspect of the Bear')
      expect(wrapper.text()).toContain('Aspect of the Eagle')
      expect(wrapper.text()).toContain('Aspect of the Wolf')
    })

    it('displays option descriptions', async () => {
      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('You gain the might of a bear.')
    })
  })

  describe('selection', () => {
    it('allows selecting an option', async () => {
      const wrapper = await mountComponent()

      // Find and click the Bear option button
      const buttons = wrapper.findAll('button')
      const bearButton = buttons.find(b => b.text().includes('Aspect of the Bear'))
      expect(bearButton).toBeDefined()

      await bearButton!.trigger('click')
      await flushPromises()

      // Button should show selected state (check icon visible)
      expect(bearButton!.html()).toContain('check-circle')
    })

    it('disables continue button until selection is made', async () => {
      const wrapper = await mountComponent()

      // Find the continue button
      const continueButton = wrapper.find('[data-testid="continue-button"]')

      // Should be disabled initially
      expect(continueButton.attributes('disabled')).toBeDefined()
    })

    it('enables continue button after selection', async () => {
      const wrapper = await mountComponent()

      // Select an option
      const buttons = wrapper.findAll('button')
      const bearButton = buttons.find(b => b.text().includes('Aspect of the Bear'))
      await bearButton!.trigger('click')
      await flushPromises()

      // Continue button should be enabled
      const continueButton = wrapper.find('[data-testid="continue-button"]')
      expect(continueButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('submission', () => {
    it('submits the selection when continue is clicked', async () => {
      const wrapper = await mountComponent()

      // Select Bear option
      const buttons = wrapper.findAll('button')
      const bearButton = buttons.find(b => b.text().includes('Aspect of the Bear'))
      await bearButton!.trigger('click')
      await flushPromises()

      // Mock the resolve endpoint
      mockApiFetch.mockResolvedValueOnce({ data: { success: true } })

      // Click continue
      const continueButton = wrapper.find('[data-testid="continue-button"]')
      await continueButton.trigger('click')
      await flushPromises()

      // Verify API was called with correct payload
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/choices/'),
        expect.objectContaining({
          method: 'POST',
          body: { selected: ['aspect of the bear'] }
        })
      )
    })

    it('calls nextStep after successful submission', async () => {
      const wrapper = await mountComponent()

      // Select and submit
      const buttons = wrapper.findAll('button')
      const bearButton = buttons.find(b => b.text().includes('Aspect of the Bear'))
      await bearButton!.trigger('click')
      await flushPromises()

      mockApiFetch.mockResolvedValueOnce({ data: { success: true } })

      const continueButton = wrapper.find('[data-testid="continue-button"]')
      await continueButton.trigger('click')
      await flushPromises()

      expect(nextStepMock).toHaveBeenCalled()
    })

    it('shows error toast on submission failure', async () => {
      const wrapper = await mountComponent()

      // Select an option
      const buttons = wrapper.findAll('button')
      const bearButton = buttons.find(b => b.text().includes('Aspect of the Bear'))
      await bearButton!.trigger('click')
      await flushPromises()

      // Mock API failure
      mockApiFetch.mockRejectedValueOnce(new Error('Submission failed'))

      // Click continue
      const continueButton = wrapper.find('[data-testid="continue-button"]')
      await continueButton.trigger('click')
      await flushPromises()

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })
  })

  describe('loading states', () => {
    it('shows loading spinner while fetching choices', async () => {
      // Make the fetch hang
      let resolvePromise: (value: unknown) => void
      mockApiFetch.mockImplementationOnce(() => new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const wrapper = await mountSuspended(StepSubclassVariant, {
        props: {
          characterId: 123,
          publicId: 'totem-warrior-xyz',
          nextStep: nextStepMock,
          refreshAfterSave: refreshAfterSaveMock
        }
      })

      expect(wrapper.html()).toContain('animate-spin')

      // Resolve to clean up
      resolvePromise!(mockPendingChoicesResponse)
      await flushPromises()
    })
  })

  describe('empty state', () => {
    it('shows message when no choices available', async () => {
      mockApiFetch.mockResolvedValueOnce({
        data: { choices: [], summary: { total_pending: 0 } }
      })

      const wrapper = await mountComponent()

      expect(wrapper.text()).toContain('No choices available')
    })
  })
})

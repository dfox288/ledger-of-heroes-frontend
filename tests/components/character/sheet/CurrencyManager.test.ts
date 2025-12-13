// tests/components/character/sheet/CurrencyManager.test.ts
/**
 * CurrencyManager Component Tests
 *
 * Tests the self-contained currency management component that:
 * - Wraps StatCurrency display component
 * - Owns modal open state
 * - Calls store actions for updates
 * - Handles toasts and errors
 *
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component behavior via the store and exposed state.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import CurrencyManager from '~/components/character/sheet/CurrencyManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// =============================================================================
// MOCK SETUP
// =============================================================================

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

// =============================================================================
// TYPES
// =============================================================================

interface CurrencyManagerVM {
  modalOpen: boolean
  error: string | null
  openModal: () => void
  handleUpdate: (payload: Record<string, string>) => Promise<void>
}

// =============================================================================
// HELPERS
// =============================================================================

// Shared Pinia instance for test suite
let pinia: ReturnType<typeof createPinia>

function setupStore(overrides: Partial<{
  characterId: number
  currency: { pp: number, gp: number, ep: number, sp: number, cp: number }
}> = {}) {
  pinia = createPinia()
  setActivePinia(pinia)
  const store = useCharacterPlayStateStore()
  store.initialize({
    characterId: overrides.characterId ?? 42,
    isDead: false,
    hitPoints: { current: 25, max: 30, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    currency: overrides.currency ?? { pp: 10, gp: 50, ep: 0, sp: 25, cp: 100 }
  })
  return store
}

function getMountOptions() {
  return {
    global: {
      plugins: [pinia]
    }
  }
}

// =============================================================================
// TESTS
// =============================================================================

describe('CurrencyManager', () => {
  beforeEach(() => {
    toastMock.add.mockClear()
  })

  describe('rendering', () => {
    it('renders StatCurrency with store data', async () => {
      setupStore({ currency: { pp: 5, gp: 100, ep: 0, sp: 0, cp: 0 } })

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: false },
        ...getMountOptions()
      })

      expect(wrapper.text()).toContain('Currency')
      expect(wrapper.text()).toContain('5') // PP
      expect(wrapper.text()).toContain('100') // GP
    })

    it('passes editable prop to StatCurrency', async () => {
      setupStore()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const cell = wrapper.find('[data-testid="currency-cell"]')
      expect(cell.classes()).toContain('cursor-pointer')
    })

    it('starts with modal closed', async () => {
      setupStore()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      expect(vm.modalOpen).toBe(false)
    })
  })

  describe('modal interaction', () => {
    it('opens modal when StatCurrency is clicked (editable)', async () => {
      setupStore()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const cell = wrapper.find('[data-testid="currency-cell"]')
      await cell.trigger('click')

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      expect(vm.modalOpen).toBe(true)
    })

    it('does not open modal when not editable', async () => {
      setupStore()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: false },
        ...getMountOptions()
      })

      const cell = wrapper.find('[data-testid="currency-cell"]')
      await cell.trigger('click')

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      expect(vm.modalOpen).toBe(false)
    })

    it('can open modal via openModal method', async () => {
      setupStore()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      vm.openModal()

      expect(vm.modalOpen).toBe(true)
    })
  })

  describe('currency update flow', () => {
    it('calls store.updateCurrency when handleUpdate is called', async () => {
      const store = setupStore()
      const updateSpy = vi.spyOn(store, 'updateCurrency').mockResolvedValue()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      await vm.handleUpdate({ gp: '-5' })

      expect(updateSpy).toHaveBeenCalledWith({ gp: '-5' })
    })

    it('shows success toast on successful update', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockResolvedValue()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      await vm.handleUpdate({ gp: '-5' })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Currency updated',
          color: 'success'
        })
      )
    })

    it('closes modal on successful update', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockResolvedValue()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM

      // Open modal first
      vm.openModal()
      expect(vm.modalOpen).toBe(true)

      // Update should close it
      await vm.handleUpdate({ gp: '-5' })
      expect(vm.modalOpen).toBe(false)
    })
  })

  describe('error handling', () => {
    it('sets error on 422 (insufficient funds)', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockRejectedValue({
        statusCode: 422,
        data: { message: 'Insufficient funds to complete transaction' }
      })

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      vm.openModal()

      await vm.handleUpdate({ gp: '-1000' })

      expect(vm.error).toBe('Insufficient funds to complete transaction')
    })

    it('keeps modal open on 422 error', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockRejectedValue({
        statusCode: 422,
        data: { message: 'Insufficient funds' }
      })

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      vm.openModal()

      await vm.handleUpdate({ gp: '-1000' })

      expect(vm.modalOpen).toBe(true) // Modal stays open
    })

    it('uses fallback message when 422 has no message', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockRejectedValue({
        statusCode: 422,
        data: {}
      })

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      await vm.handleUpdate({ gp: '-1000' })

      expect(vm.error).toBe('Insufficient funds')
    })

    it('shows error toast on non-422 errors', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      await vm.handleUpdate({ gp: '-5' })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to update currency',
          color: 'error'
        })
      )
    })

    it('does not set error on non-422 errors', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      await vm.handleUpdate({ gp: '-5' })

      expect(vm.error).toBeNull()
    })

    it('clears error when modal reopens', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateCurrency').mockRejectedValue({
        statusCode: 422,
        data: { message: 'Insufficient funds' }
      })

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM

      // Cause an error
      vm.openModal()
      await vm.handleUpdate({ gp: '-1000' })
      expect(vm.error).toBe('Insufficient funds')

      // Close modal
      vm.modalOpen = false
      await flushPromises()

      // Reopen modal - error should be cleared
      vm.openModal()
      await flushPromises()

      expect(vm.error).toBeNull()
    })
  })

  describe('loading state', () => {
    it('reflects store loading state', async () => {
      const store = setupStore()

      const wrapper = await mountSuspended(CurrencyManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      expect(store.isUpdatingCurrency).toBe(false)

      // Simulate slow update
      vi.spyOn(store, 'updateCurrency').mockImplementation(async () => {
        // Loading should be true during call
        expect(store.isUpdatingCurrency).toBe(true)
      })

      const vm = wrapper.vm as unknown as CurrencyManagerVM
      await vm.handleUpdate({ gp: '-5' })
    })
  })
})

// tests/components/character/sheet/HitPointsManager.test.ts
/**
 * HitPointsManager Component Tests
 *
 * Tests the self-contained HP management component that:
 * - Wraps StatHitPoints display component
 * - Owns modal open state for HP and temp HP modals
 * - Calls store actions for updates
 * - Handles toasts and errors
 * - Emits death saves updates when HP changes affect them
 *
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component behavior via the store and exposed state.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import HitPointsManager from '~/components/character/sheet/HitPointsManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// =============================================================================
// MOCK SETUP
// =============================================================================

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

// =============================================================================
// TYPES
// =============================================================================

interface HitPointsManagerVM {
  hpModalOpen: boolean
  tempHpModalOpen: boolean
  openHpModal: () => void
  openTempHpModal: () => void
  handleHpChange: (delta: number) => Promise<void>
  handleTempHpSet: (value: number) => Promise<void>
  handleTempHpClear: () => Promise<void>
}

// =============================================================================
// HELPERS
// =============================================================================

let pinia: ReturnType<typeof createPinia>

function setupStore(overrides: Partial<{
  characterId: number
  isDead: boolean
  hitPoints: { current: number, max: number, temporary: number }
  deathSaves: { successes: number, failures: number }
}> = {}) {
  pinia = createPinia()
  setActivePinia(pinia)
  const store = useCharacterPlayStateStore()
  store.initialize({
    characterId: overrides.characterId ?? 42,
    isDead: overrides.isDead ?? false,
    hitPoints: overrides.hitPoints ?? { current: 25, max: 30, temporary: 5 },
    deathSaves: overrides.deathSaves ?? { successes: 0, failures: 0 },
    currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
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

describe('HitPointsManager', () => {
  beforeEach(() => {
    toastMock.add.mockClear()
  })

  describe('rendering', () => {
    it('renders StatHitPoints with store data', async () => {
      setupStore({ hitPoints: { current: 20, max: 30, temporary: 5 } })

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: false },
        ...getMountOptions()
      })

      expect(wrapper.text()).toContain('20') // current
      expect(wrapper.text()).toContain('30') // max
    })

    it('displays temp HP when present', async () => {
      setupStore({ hitPoints: { current: 20, max: 30, temporary: 10 } })

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: false },
        ...getMountOptions()
      })

      expect(wrapper.text()).toContain('+10 temp')
    })

    it('passes editable prop to StatHitPoints', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes()).toContain('cursor-pointer')
    })

    it('starts with both modals closed', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      expect(vm.hpModalOpen).toBe(false)
      expect(vm.tempHpModalOpen).toBe(false)
    })
  })

  describe('HP modal interaction', () => {
    it('opens HP modal when StatHitPoints is clicked (editable)', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const cell = wrapper.find('[data-testid="hp-cell"]')
      await cell.trigger('click')

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      expect(vm.hpModalOpen).toBe(true)
    })

    it('does not open HP modal when not editable', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: false },
        ...getMountOptions()
      })

      const cell = wrapper.find('[data-testid="hp-cell"]')
      await cell.trigger('click')

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      expect(vm.hpModalOpen).toBe(false)
    })
  })

  describe('Temp HP modal interaction', () => {
    it('opens temp HP modal via openTempHpModal method', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      vm.openTempHpModal()

      expect(vm.tempHpModalOpen).toBe(true)
    })
  })

  describe('HP update flow', () => {
    it('calls store.updateHp when handleHpChange is called', async () => {
      const store = setupStore()
      const updateSpy = vi.spyOn(store, 'updateHp').mockResolvedValue()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      await vm.handleHpChange(-5)

      expect(updateSpy).toHaveBeenCalledWith(-5)
    })

    it('closes HP modal on successful update', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateHp').mockResolvedValue()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM

      // Open modal first
      vm.openHpModal()
      expect(vm.hpModalOpen).toBe(true)

      // Update should close it
      await vm.handleHpChange(-5)
      expect(vm.hpModalOpen).toBe(false)
    })

    it('shows error toast on failure', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateHp').mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      await vm.handleHpChange(-5)

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to update HP',
          color: 'error'
        })
      )
    })
  })

  describe('Temp HP update flow', () => {
    it('calls store.setTempHp when handleTempHpSet is called', async () => {
      const store = setupStore()
      const setSpy = vi.spyOn(store, 'setTempHp').mockResolvedValue()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      await vm.handleTempHpSet(10)

      expect(setSpy).toHaveBeenCalledWith(10)
    })

    it('calls store.clearTempHp when handleTempHpClear is called', async () => {
      const store = setupStore()
      const clearSpy = vi.spyOn(store, 'clearTempHp').mockResolvedValue()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      await vm.handleTempHpClear()

      expect(clearSpy).toHaveBeenCalled()
    })

    it('closes temp HP modal on successful set', async () => {
      const store = setupStore()
      vi.spyOn(store, 'setTempHp').mockResolvedValue()

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM

      // Open modal first
      vm.openTempHpModal()
      expect(vm.tempHpModalOpen).toBe(true)

      // Set should close it
      await vm.handleTempHpSet(10)
      expect(vm.tempHpModalOpen).toBe(false)
    })

    it('shows error toast on temp HP failure', async () => {
      const store = setupStore()
      vi.spyOn(store, 'setTempHp').mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitPointsManagerVM
      await vm.handleTempHpSet(10)

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to set temp HP',
          color: 'error'
        })
      )
    })
  })

  describe('death state props', () => {
    it('passes isDead prop to StatHitPoints', async () => {
      setupStore({ isDead: true, hitPoints: { current: 0, max: 30, temporary: 0 } })

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // When dead, HP cell should show DEAD status
      expect(wrapper.text()).toContain('DEAD')
    })

    it('passes deathSaveFailures from store to StatHitPoints', async () => {
      setupStore({
        hitPoints: { current: 0, max: 30, temporary: 0 },
        deathSaves: { successes: 0, failures: 2 }
      })

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // At 0 HP with failures, should show DYING
      expect(wrapper.text()).toContain('DYING')
    })

    it('passes deathSaveSuccesses from store to StatHitPoints', async () => {
      setupStore({
        hitPoints: { current: 0, max: 30, temporary: 0 },
        deathSaves: { successes: 3, failures: 0 }
      })

      const wrapper = await mountSuspended(HitPointsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // At 0 HP with 3 successes, should show STABLE
      expect(wrapper.text()).toContain('STABLE')
    })
  })
})

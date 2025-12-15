// tests/components/character/sheet/HitDiceManager.test.ts
/**
 * HitDiceManager Component Tests
 *
 * Tests the Manager component that wraps HitDice display + LongRestConfirmModal.
 * Handles API calls for spending hit dice and rest actions.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import HitDiceManager from '~/components/character/sheet/HitDiceManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// =============================================================================
// MOCK SETUP
// =============================================================================

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// =============================================================================
// TYPES
// =============================================================================

interface HitDiceManagerVM {
  isResting: boolean
  showLongRestModal: boolean
  handleSpend: (payload: { dieType: string }) => Promise<void>
  handleShortRest: () => Promise<void>
  handleLongRest: () => Promise<void>
}

// =============================================================================
// FIXTURES
// =============================================================================

const mockHitDice = [
  { die: 'd10', total: 5, current: 3 },
  { die: 'd8', total: 2, current: 2 }
]

// =============================================================================
// HELPERS
// =============================================================================

let pinia: ReturnType<typeof createPinia>

function setupStore(overrides: Partial<{
  characterId: number
  isDead: boolean
  hitPoints: { current: number, max: number, temporary: number }
}> = {}) {
  pinia = createPinia()
  setActivePinia(pinia)
  const store = useCharacterPlayStateStore()
  store.initialize({
    characterId: overrides.characterId ?? 42,
    isDead: overrides.isDead ?? false,
    hitPoints: overrides.hitPoints ?? { current: 20, max: 30, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
  })
  return store
}

function getMountOptions() {
  return { global: { plugins: [pinia] } }
}

// =============================================================================
// TESTS
// =============================================================================

describe('HitDiceManager', () => {
  beforeEach(() => {
    toastMock.add.mockClear()
    apiFetchMock.mockClear()
  })

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  describe('rendering', () => {
    it('renders HitDice component with provided data', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      // Should show hit dice UI
      expect(wrapper.text()).toContain('Hit Dice')
      expect(wrapper.text()).toContain('d10')
      expect(wrapper.text()).toContain('d8')
    })

    it('passes editable to HitDice based on prop and isDead', async () => {
      setupStore({ isDead: false })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      // Should show rest buttons when editable
      expect(wrapper.find('[data-testid="short-rest-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="long-rest-btn"]').exists()).toBe(true)
    })

    it('is not interactive when isDead is true', async () => {
      setupStore({ isDead: true })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      // Rest buttons should be disabled
      const shortRestBtn = wrapper.find('[data-testid="short-rest-btn"]')
      expect(shortRestBtn.attributes('disabled')).toBeDefined()
    })
  })

  // ===========================================================================
  // SPEND HIT DIE
  // ===========================================================================

  describe('spend hit die', () => {
    it('calls API to spend hit die', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({})

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleSpend({ dieType: 'd10' })

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/hit-dice/spend', {
        method: 'POST',
        body: { die_type: 'd10', quantity: 1 }
      })
    })

    it('emits refresh-hit-dice after successful spend', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({})

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleSpend({ dieType: 'd10' })

      expect(wrapper.emitted('refresh-hit-dice')).toBeTruthy()
    })

    it('shows error toast on spend failure', async () => {
      setupStore()
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleSpend({ dieType: 'd10' })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to spend hit die',
          color: 'error'
        })
      )
    })

    it('prevents concurrent spend operations', async () => {
      setupStore()
      let resolveFirst: () => void
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve
      })
      apiFetchMock.mockImplementationOnce(() => firstPromise)

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM

      // Start first spend
      const firstSpend = vm.handleSpend({ dieType: 'd10' })

      // Try second spend while first is in progress
      await vm.handleSpend({ dieType: 'd8' })

      // Only first call should have been made
      expect(apiFetchMock).toHaveBeenCalledTimes(1)

      // Complete first request
      resolveFirst!()
      await firstSpend
    })
  })

  // ===========================================================================
  // SHORT REST
  // ===========================================================================

  describe('short rest', () => {
    it('calls API for short rest', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: { pact_magic_reset: false, features_reset: [] }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleShortRest()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/short-rest', {
        method: 'POST'
      })
    })

    it('emits refresh-short-rest after successful short rest', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: { pact_magic_reset: false, features_reset: [] }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleShortRest()

      expect(wrapper.emitted('refresh-short-rest')).toBeTruthy()
    })

    it('shows success toast with feature count', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: { pact_magic_reset: true, features_reset: ['Action Surge', 'Second Wind'] }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleShortRest()

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '2 features reset',
          color: 'success'
        })
      )
    })

    it('shows generic success toast when no features reset', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: { pact_magic_reset: false, features_reset: [] }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleShortRest()

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Short rest complete',
          color: 'success'
        })
      )
    })

    it('shows error toast on short rest failure', async () => {
      setupStore()
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleShortRest()

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to take short rest',
          color: 'error'
        })
      )
    })
  })

  // ===========================================================================
  // LONG REST
  // ===========================================================================

  describe('long rest', () => {
    it('opens confirmation modal when long rest button clicked', async () => {
      setupStore()

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      // Click long rest button (on the HitDice component)
      await wrapper.find('[data-testid="long-rest-btn"]').trigger('click')

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      expect(vm.showLongRestModal).toBe(true)
    })

    it('calls API for long rest after confirmation', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: {
          hp_restored: 10,
          hit_dice_recovered: 2,
          spell_slots_reset: true,
          death_saves_cleared: true,
          features_reset: []
        }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleLongRest()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/long-rest', {
        method: 'POST'
      })
    })

    it('emits refresh-long-rest after successful long rest', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: {
          hp_restored: 10,
          hit_dice_recovered: 2,
          spell_slots_reset: true,
          death_saves_cleared: true,
          features_reset: []
        }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleLongRest()

      expect(wrapper.emitted('refresh-long-rest')).toBeTruthy()
    })

    it('shows success toast with restoration details', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: {
          hp_restored: 10,
          hit_dice_recovered: 2,
          spell_slots_reset: true,
          death_saves_cleared: true,
          features_reset: []
        }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleLongRest()

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Long rest complete',
          color: 'success'
        })
      )
    })

    it('shows error toast on long rest failure', async () => {
      setupStore()
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleLongRest()

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to take long rest',
          color: 'error'
        })
      )
    })

    it('closes modal after successful long rest', async () => {
      setupStore()
      apiFetchMock.mockResolvedValue({
        data: {
          hp_restored: 10,
          hit_dice_recovered: 2,
          spell_slots_reset: true,
          death_saves_cleared: true,
          features_reset: []
        }
      })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM

      // Open modal first
      vm.showLongRestModal = true
      await flushPromises()

      // Confirm long rest
      await vm.handleLongRest()

      expect(vm.showLongRestModal).toBe(false)
    })

    it('closes modal on long rest failure', async () => {
      setupStore()
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM

      // Open modal first
      vm.showLongRestModal = true
      await flushPromises()

      // Try long rest (will fail)
      await vm.handleLongRest()

      // Modal should still close
      expect(vm.showLongRestModal).toBe(false)
    })
  })

  // ===========================================================================
  // SSR HYDRATION
  // ===========================================================================

  describe('SSR hydration', () => {
    it('uses initialIsDead prop when store not initialized', async () => {
      // Don't initialize store - simulates SSR
      pinia = createPinia()
      setActivePinia(pinia)

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true,
          initialIsDead: true // Character is dead
        },
        ...getMountOptions()
      })

      // Rest buttons should be disabled when dead (even without store)
      const shortRestBtn = wrapper.find('[data-testid="short-rest-btn"]')
      expect(shortRestBtn.attributes('disabled')).toBeDefined()
    })

    it('uses store.isDead after store is initialized', async () => {
      // Initialize store with isDead=false
      setupStore({ isDead: false })

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true,
          initialIsDead: true // Props say dead, but store says alive
        },
        ...getMountOptions()
      })

      // Store should take precedence - buttons NOT disabled
      const shortRestBtn = wrapper.find('[data-testid="short-rest-btn"]')
      expect(shortRestBtn.attributes('disabled')).toBeUndefined()
    })

    it('defaults to false when no initialIsDead and store not initialized', async () => {
      // Don't initialize store
      pinia = createPinia()
      setActivePinia(pinia)

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
          // No initialIsDead prop
        },
        ...getMountOptions()
      })

      // Should default to not dead - buttons NOT disabled
      const shortRestBtn = wrapper.find('[data-testid="short-rest-btn"]')
      expect(shortRestBtn.attributes('disabled')).toBeUndefined()
    })
  })

  // ===========================================================================
  // ISRESTING STATE
  // ===========================================================================

  describe('isResting state', () => {
    it('sets isResting during spend operation', async () => {
      setupStore()
      let resolveSpend: () => void
      const spendPromise = new Promise<void>((resolve) => {
        resolveSpend = resolve
      })
      apiFetchMock.mockImplementation(() => spendPromise)

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM

      // Start operation
      const spendOp = vm.handleSpend({ dieType: 'd10' })

      // Should be resting
      expect(vm.isResting).toBe(true)

      // Complete operation
      resolveSpend!()
      await spendOp

      // Should no longer be resting
      expect(vm.isResting).toBe(false)
    })

    it('resets isResting on error', async () => {
      setupStore()
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(HitDiceManager, {
        props: {
          hitDice: mockHitDice,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as HitDiceManagerVM
      await vm.handleSpend({ dieType: 'd10' })

      expect(vm.isResting).toBe(false)
    })
  })
})

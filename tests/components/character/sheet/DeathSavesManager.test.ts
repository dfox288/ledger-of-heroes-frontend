// tests/components/character/sheet/DeathSavesManager.test.ts
/**
 * DeathSavesManager Component Tests
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import DeathSavesManager from '~/components/character/sheet/DeathSavesManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// =============================================================================
// MOCK SETUP
// =============================================================================

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

// =============================================================================
// TYPES
// =============================================================================

interface DeathSavesManagerVM {
  canEdit: boolean
  handleUpdate: (field: 'successes' | 'failures', value: number) => Promise<void>
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
    hitPoints: overrides.hitPoints ?? { current: 0, max: 30, temporary: 0 },
    deathSaves: overrides.deathSaves ?? { successes: 1, failures: 1 },
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

describe('DeathSavesManager', () => {
  beforeEach(() => {
    toastMock.add.mockClear()
  })

  describe('rendering', () => {
    it('renders DeathSaves with store data', async () => {
      setupStore({ deathSaves: { successes: 2, failures: 1 } })

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Should show death saves UI - check for success markers
      expect(wrapper.find('[data-testid="success-filled-1"]').exists()).toBe(true)
    })
  })

  describe('editability', () => {
    it('is editable when prop is true, at 0 HP, and not dead', async () => {
      setupStore({
        hitPoints: { current: 0, max: 30, temporary: 0 },
        isDead: false
      })

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as DeathSavesManagerVM
      expect(vm.canEdit).toBe(true)
    })

    it('is not editable when HP > 0', async () => {
      setupStore({
        hitPoints: { current: 10, max: 30, temporary: 0 },
        isDead: false
      })

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as DeathSavesManagerVM
      expect(vm.canEdit).toBe(false)
    })

    it('is not editable when dead', async () => {
      setupStore({
        hitPoints: { current: 0, max: 30, temporary: 0 },
        isDead: true
      })

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as DeathSavesManagerVM
      expect(vm.canEdit).toBe(false)
    })

    it('is not editable when prop is false', async () => {
      setupStore({
        hitPoints: { current: 0, max: 30, temporary: 0 },
        isDead: false
      })

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: false },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as DeathSavesManagerVM
      expect(vm.canEdit).toBe(false)
    })
  })

  describe('update flow', () => {
    it('calls store.updateDeathSaves on handleUpdate', async () => {
      const store = setupStore()
      const updateSpy = vi.spyOn(store, 'updateDeathSaves').mockResolvedValue()

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as DeathSavesManagerVM
      await vm.handleUpdate('successes', 2)

      expect(updateSpy).toHaveBeenCalledWith('successes', 2)
    })

    it('shows error toast on failure', async () => {
      const store = setupStore()
      vi.spyOn(store, 'updateDeathSaves').mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(DeathSavesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as DeathSavesManagerVM
      await vm.handleUpdate('failures', 2)

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to save',
          color: 'error'
        })
      )
    })
  })
})

// tests/components/character/sheet/ClassResourcesManager.test.ts
/**
 * ClassResourcesManager Component Tests
 *
 * Tests the Manager component that delegates to characterPlayState store
 * for spending/restoring class resources (Rage, Ki, Bardic Inspiration, etc.)
 *
 * @see Issue #632 - Class resources
 * @see Issue #696 - Store consolidation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ClassResourcesManager from '~/components/character/sheet/ClassResourcesManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { Counter } from '~/types/character'

// =============================================================================
// MOCK SETUP
// =============================================================================

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// =============================================================================
// FIXTURES
// =============================================================================

// Counter format updated in #725 - uses source_slug instead of source, slug removed (use id for routing)
const createCounter = (overrides: Partial<Counter> = {}): Counter => ({
  id: 1,
  name: 'Bardic Inspiration',
  current: 3,
  max: 5,
  reset_on: 'long_rest',
  source_slug: 'phb:bard',
  source_type: 'class',
  unlimited: false,
  ...overrides
})

// =============================================================================
// HELPERS
// =============================================================================

let pinia: ReturnType<typeof createPinia>

function setupPinia() {
  pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

function getMountOptions() {
  return { global: { plugins: [pinia] } }
}

function setupStore(counters: Counter[] = [createCounter()], characterId = 42) {
  const store = useCharacterPlayStateStore()
  store.initialize({
    characterId,
    isDead: false,
    hitPoints: { current: 10, max: 10, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
  })
  store.initializeCounters(counters)
  return store
}

// =============================================================================
// TESTS
// =============================================================================

describe('ClassResourcesManager', () => {
  beforeEach(() => {
    setupPinia()
    toastMock.add.mockClear()
    apiFetchMock.mockClear()
  })

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  describe('rendering', () => {
    it('renders ClassResources with counters from store', async () => {
      setupStore([createCounter()])

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      expect(wrapper.text()).toContain('Bardic Inspiration')
      expect(wrapper.text()).toContain('Class Resources')
    })

    it('renders nothing when store has no counters', async () => {
      setupStore([])

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      expect(wrapper.text()).not.toContain('Class Resources')
    })

    it('disables counters when store isDead is true', async () => {
      const store = setupStore([createCounter()])
      store.isDead = true

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Icons should not be interactive when dead (tabindex=-1)
      const icon = wrapper.find('[data-testid="counter-icon-filled"]')
      expect(icon.attributes('tabindex')).toBe('-1')
    })
  })

  // ===========================================================================
  // SPEND COUNTER
  // ===========================================================================

  // Counter routing updated in #725 - now uses numeric ID instead of slug
  describe('spend counter', () => {
    it('calls store.useCounter with counter ID to spend counter', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3 })])
      apiFetchMock.mockResolvedValue({ data: { current: 2 } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Trigger spend via store action using numeric ID
      await store.useCounter(1)

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/counters/1',
        { method: 'PATCH', body: { action: 'use' } }
      )
    })

    it('decrements counter value after spend', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3 })])
      apiFetchMock.mockResolvedValue({ data: { current: 2 } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await store.useCounter(1)

      expect(store.counters[0].current).toBe(2)
    })

    it('rolls back on API failure', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3 })])
      apiFetchMock.mockRejectedValueOnce({ data: { message: 'No uses remaining' } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await expect(store.useCounter(1)).rejects.toBeDefined()

      // Counter should be rolled back
      expect(store.counters[0].current).toBe(3)
    })

    it('shows error toast on API failure via handleSpend', async () => {
      setupStore([createCounter({ id: 1, current: 3 })])
      apiFetchMock.mockRejectedValueOnce({ data: { message: 'No uses remaining' } })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Access the component's handleSpend method - now uses numeric ID
      const vm = wrapper.vm as { handleSpend: (id: number) => Promise<void> }
      await vm.handleSpend(1)

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })

    it('does not call API when counter is at 0', async () => {
      const store = setupStore([createCounter({ id: 1, current: 0 })])

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await store.useCounter(1)

      expect(apiFetchMock).not.toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // RESTORE COUNTER
  // ===========================================================================

  describe('restore counter', () => {
    it('calls store.restoreCounter with counter ID to restore counter', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3, max: 5 })])
      apiFetchMock.mockResolvedValue({ data: { current: 4 } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await store.restoreCounter(1)

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/counters/1',
        { method: 'PATCH', body: { action: 'restore' } }
      )
    })

    it('increments counter value after restore', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3, max: 5 })])
      apiFetchMock.mockResolvedValue({ data: { current: 4 } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await store.restoreCounter(1)

      expect(store.counters[0].current).toBe(4)
    })

    it('rolls back on restore API failure', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3, max: 5 })])
      apiFetchMock.mockRejectedValueOnce({ data: { message: 'Already at max' } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await expect(store.restoreCounter(1)).rejects.toBeDefined()

      // Counter should be rolled back
      expect(store.counters[0].current).toBe(3)
    })

    it('does not call API when counter is at max', async () => {
      const store = setupStore([createCounter({ id: 1, current: 5, max: 5 })])

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      await store.restoreCounter(1)

      expect(apiFetchMock).not.toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // STORE REACTIVITY
  // ===========================================================================

  describe('store reactivity', () => {
    it('updates display when store counters change', async () => {
      const store = setupStore([createCounter({ id: 1, current: 3 })])
      apiFetchMock.mockResolvedValue({ data: { current: 2 } })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Initial state - format is "3/5" not "3 / 5"
      expect(wrapper.text()).toContain('3/5')

      // Update via store using numeric ID
      await store.useCounter(1)

      // Should reflect new value
      expect(wrapper.text()).toContain('2/5')
    })
  })

  // ===========================================================================
  // RACE CONDITION PREVENTION
  // ===========================================================================

  describe('race condition prevention', () => {
    it('prevents concurrent spend operations on same counter via store', async () => {
      const store = setupStore([createCounter({ id: 1, current: 5 })])

      let resolveFirst: () => void
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve
      })
      apiFetchMock.mockImplementationOnce(() => firstPromise)

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Start first spend (doesn't complete yet) using numeric ID
      const firstSpend = store.useCounter(1)

      // Try second spend while first is in progress
      await store.useCounter(1)

      // Only one API call should have been made
      expect(apiFetchMock).toHaveBeenCalledTimes(1)

      // Counter should only be decremented once (optimistic)
      expect(store.counters[0].current).toBe(4)

      // Complete first request
      resolveFirst!()
      await firstSpend
    })

    it('allows concurrent operations on different counters', async () => {
      const counters = [
        createCounter({ id: 1, current: 5 }),
        createCounter({ id: 2, current: 3 })
      ]
      const store = setupStore(counters)
      apiFetchMock.mockResolvedValue({ data: { current: 2 } })

      await mountSuspended(ClassResourcesManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // Both operations should complete using numeric IDs
      await Promise.all([
        store.useCounter(1),
        store.useCounter(2)
      ])

      // Both calls should have been made
      expect(apiFetchMock).toHaveBeenCalledTimes(2)
    })
  })
})

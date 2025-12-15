// tests/components/character/sheet/ClassResourcesManager.test.ts
/**
 * ClassResourcesManager Component Tests
 *
 * Tests the Manager component that handles API calls for
 * spending/restoring class resources (Rage, Ki, Bardic Inspiration, etc.)
 *
 * @see Issue #632 - Class resources
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ClassResourcesManager from '~/components/character/sheet/ClassResourcesManager.vue'
import type { Counter } from '~/types/character'

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

interface ClassResourcesManagerVM {
  localCounters: Counter[]
  handleSpend: (slug: string) => Promise<void>
  handleRestore: (slug: string) => Promise<void>
}

// =============================================================================
// FIXTURES
// =============================================================================

const createCounter = (overrides: Partial<Counter> = {}): Counter => ({
  id: 1,
  slug: 'phb:bard:bardic-inspiration',
  name: 'Bardic Inspiration',
  current: 3,
  max: 5,
  reset_on: 'long_rest',
  source: 'Bard',
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
    it('renders ClassResources with counters', async () => {
      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter()],
          characterId: 1
        },
        ...getMountOptions()
      })
      expect(wrapper.text()).toContain('Bardic Inspiration')
      expect(wrapper.text()).toContain('Class Resources')
    })

    it('renders nothing when counters is empty', async () => {
      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [],
          characterId: 1
        },
        ...getMountOptions()
      })
      expect(wrapper.text()).not.toContain('Class Resources')
    })

    it('disables counters when isDead is true', async () => {
      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter()],
          characterId: 1,
          editable: true,
          isDead: true
        },
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

  describe('spend counter', () => {
    it('calls API to spend counter', async () => {
      apiFetchMock.mockResolvedValue({ data: createCounter({ current: 2 }) })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter()],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleSpend('phb:bard:bardic-inspiration')

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/counters/phb%3Abard%3Abardic-inspiration',
        { method: 'PATCH', body: { action: 'use' } }
      )
    })

    it('optimistically decrements counter before API returns', async () => {
      let resolveApi: () => void
      const apiPromise = new Promise<void>((resolve) => {
        resolveApi = resolve
      })
      apiFetchMock.mockImplementation(() => apiPromise)

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 3 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM

      // Start spend operation (don't await)
      const spendOp = vm.handleSpend('phb:bard:bardic-inspiration')

      // Counter should already be decremented optimistically
      expect(vm.localCounters[0].current).toBe(2)

      // Complete API call
      resolveApi!()
      await spendOp
    })

    it('rolls back on API failure', async () => {
      apiFetchMock.mockRejectedValue({ data: { message: 'No uses remaining' } })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 3 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleSpend('phb:bard:bardic-inspiration')

      // Counter should be rolled back
      expect(vm.localCounters[0].current).toBe(3)
    })

    it('shows error toast on API failure', async () => {
      apiFetchMock.mockRejectedValue({ data: { message: 'No uses remaining' } })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter()],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleSpend('phb:bard:bardic-inspiration')

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })

    it('does not call API when counter is at 0', async () => {
      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 0 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleSpend('phb:bard:bardic-inspiration')

      expect(apiFetchMock).not.toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // RESTORE COUNTER
  // ===========================================================================

  describe('restore counter', () => {
    it('calls API to restore counter', async () => {
      apiFetchMock.mockResolvedValue({ data: createCounter({ current: 4 }) })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 3, max: 5 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleRestore('phb:bard:bardic-inspiration')

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/counters/phb%3Abard%3Abardic-inspiration',
        { method: 'PATCH', body: { action: 'restore' } }
      )
    })

    it('optimistically increments counter before API returns', async () => {
      let resolveApi: () => void
      const apiPromise = new Promise<void>((resolve) => {
        resolveApi = resolve
      })
      apiFetchMock.mockImplementation(() => apiPromise)

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 3, max: 5 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM

      // Start restore operation (don't await)
      const restoreOp = vm.handleRestore('phb:bard:bardic-inspiration')

      // Counter should already be incremented optimistically
      expect(vm.localCounters[0].current).toBe(4)

      // Complete API call
      resolveApi!()
      await restoreOp
    })

    it('rolls back on restore API failure', async () => {
      apiFetchMock.mockRejectedValue({ data: { message: 'Already at max' } })

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 3, max: 5 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleRestore('phb:bard:bardic-inspiration')

      // Counter should be rolled back
      expect(vm.localCounters[0].current).toBe(3)
    })

    it('does not call API when counter is at max', async () => {
      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 5, max: 5 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      await vm.handleRestore('phb:bard:bardic-inspiration')

      expect(apiFetchMock).not.toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // PROPS SYNC
  // ===========================================================================

  describe('props synchronization', () => {
    it('syncs localCounters when props.counters change', async () => {
      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 3 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM
      expect(vm.localCounters[0].current).toBe(3)

      // Update props
      await wrapper.setProps({
        counters: [createCounter({ current: 5 })]
      })

      expect(vm.localCounters[0].current).toBe(5)
    })
  })

  // ===========================================================================
  // RACE CONDITION PREVENTION
  // ===========================================================================

  describe('race condition prevention', () => {
    it('prevents concurrent spend operations on same counter', async () => {
      let resolveFirst: () => void
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve
      })
      apiFetchMock.mockImplementationOnce(() => firstPromise)

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters: [createCounter({ current: 5 })],
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM

      // Start first spend (doesn't complete yet)
      const firstSpend = vm.handleSpend('phb:bard:bardic-inspiration')

      // Try second spend while first is in progress
      await vm.handleSpend('phb:bard:bardic-inspiration')

      // Only one API call should have been made
      expect(apiFetchMock).toHaveBeenCalledTimes(1)

      // Counter should only be decremented once (optimistic)
      expect(vm.localCounters[0].current).toBe(4)

      // Complete first request
      resolveFirst!()
      await firstSpend
    })

    it('allows concurrent operations on different counters', async () => {
      let resolveFirst: () => void
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve
      })
      apiFetchMock.mockImplementationOnce(() => firstPromise)
      apiFetchMock.mockResolvedValueOnce({ data: createCounter() })

      const counters = [
        createCounter({ slug: 'counter-1', current: 5 }),
        createCounter({ id: 2, slug: 'counter-2', current: 3 })
      ]

      const wrapper = await mountSuspended(ClassResourcesManager, {
        props: {
          counters,
          characterId: 42,
          editable: true
        },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ClassResourcesManagerVM

      // Start spend on first counter
      const firstSpend = vm.handleSpend('counter-1')

      // Spend on second counter while first is pending
      await vm.handleSpend('counter-2')

      // Both calls should have been made
      expect(apiFetchMock).toHaveBeenCalledTimes(2)

      // Complete first request
      resolveFirst!()
      await firstSpend
    })
  })
})

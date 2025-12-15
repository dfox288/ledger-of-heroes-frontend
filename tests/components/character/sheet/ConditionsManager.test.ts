// tests/components/character/sheet/ConditionsManager.test.ts
/**
 * ConditionsManager Component Tests
 *
 * Tests the Manager component that wraps Conditions display + DeadlyExhaustionConfirmModal.
 * Uses characterPlayState store for condition operations.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ConditionsManager from '~/components/character/sheet/ConditionsManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { CharacterCondition } from '~/types/character'

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

interface ConditionsManagerVM {
  showDeadlyExhaustionModal: boolean
  handleRemove: (conditionSlug: string) => Promise<void>
  handleUpdateLevel: (payload: { slug: string, level: number, source: string | null, duration: string | null }) => Promise<void>
  handleDeadlyExhaustionConfirm: (payload: { slug: string, currentLevel: number, targetLevel: number, source: string | null, duration: string | null }) => void
  handleDeadlyExhaustionConfirmed: () => Promise<void>
}

// =============================================================================
// FIXTURES
// =============================================================================

function createCondition(overrides: Partial<{
  id: number
  conditionId: number
  name: string
  slug: string
  level: number | null
  source: string | null
  duration: string | null
  isDangling: boolean
  isExhaustion: boolean
  exhaustionWarning: string | null
}> = {}): CharacterCondition {
  return {
    id: overrides.id ?? 1,
    condition: {
      id: overrides.conditionId ?? 1,
      name: overrides.name ?? 'Poisoned',
      slug: overrides.slug ?? 'core:poisoned'
    },
    condition_slug: overrides.slug ?? 'core:poisoned',
    is_dangling: overrides.isDangling ?? false,
    level: overrides.level ?? null,
    source: overrides.source ?? null,
    duration: overrides.duration ?? null,
    is_exhaustion: overrides.isExhaustion ?? false,
    exhaustion_warning: overrides.exhaustionWarning ?? null
  }
}

const mockCondition = createCondition({
  id: 1,
  name: 'Poisoned',
  slug: 'core:poisoned',
  source: 'Giant Spider bite',
  duration: '2 hours'
})

const mockExhaustion = createCondition({
  id: 2,
  name: 'Exhaustion',
  slug: 'core:exhaustion',
  level: 2,
  source: 'Forced march',
  duration: 'Until long rest',
  isExhaustion: true
})

// =============================================================================
// HELPERS
// =============================================================================

let pinia: ReturnType<typeof createPinia>
let store: ReturnType<typeof useCharacterPlayStateStore>

/**
 * Initialize store with conditions via direct state setting
 * (The component reads conditions from the store, not props)
 */
function setupStore(options: {
  characterId?: number
  isDead?: boolean
  conditions?: CharacterCondition[]
} = {}) {
  pinia = createPinia()
  setActivePinia(pinia)
  store = useCharacterPlayStateStore()

  // Initialize basic play state
  store.initialize({
    characterId: options.characterId ?? 42,
    isDead: options.isDead ?? false,
    hitPoints: { current: 20, max: 30, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
  })

  // Set conditions directly on store (component reads from store)
  if (options.conditions) {
    store.conditions = options.conditions
  }

  return store
}

function getMountOptions() {
  return { global: { plugins: [pinia] } }
}

// =============================================================================
// TESTS
// =============================================================================

describe('ConditionsManager', () => {
  beforeEach(() => {
    toastMock.add.mockClear()
    apiFetchMock.mockClear()
  })

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  describe('rendering', () => {
    it('renders Conditions component with provided data', async () => {
      setupStore({ conditions: [mockCondition] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      expect(wrapper.text()).toContain('Poisoned')
      expect(wrapper.text()).toContain('Giant Spider bite')
    })

    it('renders nothing when no conditions', async () => {
      setupStore({ conditions: [] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(false)
    })

    it('passes editable and isDead to Conditions component', async () => {
      setupStore({ isDead: true, conditions: [mockCondition] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      // When isDead, remove button should be hidden
      expect(wrapper.find('[data-testid="remove-condition-core:poisoned"]').exists()).toBe(false)
    })
  })

  // ===========================================================================
  // REMOVE CONDITION
  // ===========================================================================

  describe('remove condition', () => {
    it('calls store action to remove condition', async () => {
      setupStore({ conditions: [mockCondition] })
      apiFetchMock.mockResolvedValue({})

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleRemove('core:poisoned')

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/conditions/core:poisoned', {
        method: 'DELETE'
      })
    })

    it('updates store conditions after successful remove', async () => {
      setupStore({ conditions: [mockCondition] })
      apiFetchMock.mockResolvedValue({})

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleRemove('core:poisoned')

      // Store should have removed the condition (optimistic update)
      expect(store.conditions).toHaveLength(0)
    })

    it('shows success toast after remove', async () => {
      setupStore({ conditions: [mockCondition] })
      apiFetchMock.mockResolvedValue({})

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleRemove('core:poisoned')

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Condition removed',
          color: 'success'
        })
      )
    })

    it('shows error toast on remove failure', async () => {
      setupStore({ conditions: [mockCondition] })
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleRemove('core:poisoned')

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to remove condition',
          color: 'error'
        })
      )
    })

    it('prevents concurrent remove operations via store guard', async () => {
      setupStore({ conditions: [mockCondition] })
      let resolveFirst: () => void
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve
      })
      apiFetchMock.mockImplementationOnce(() => firstPromise)

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM

      // Start first remove
      const firstRemove = vm.handleRemove('core:poisoned')

      // Try second remove while first is in progress (store guard should prevent)
      await vm.handleRemove('core:frightened')

      // Only first call should have been made (store.isUpdatingConditions blocks second)
      expect(apiFetchMock).toHaveBeenCalledTimes(1)

      // Complete first request
      resolveFirst!()
      await firstRemove
    })
  })

  // ===========================================================================
  // UPDATE EXHAUSTION LEVEL
  // ===========================================================================

  describe('update exhaustion level', () => {
    it('calls store action to update exhaustion level', async () => {
      setupStore({ conditions: [mockExhaustion] })
      apiFetchMock.mockResolvedValue({})
      // Mock fetchConditions response for refresh
      apiFetchMock.mockResolvedValue({ data: [mockExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleUpdateLevel({
        slug: 'core:exhaustion',
        level: 3,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/conditions', {
        method: 'POST',
        body: {
          condition: 'core:exhaustion',
          level: 3,
          source: 'Forced march',
          duration: 'Until long rest'
        }
      })
    })

    it('refreshes conditions from store after successful update', async () => {
      setupStore({ conditions: [mockExhaustion] })
      const updatedExhaustion = createCondition({
        ...mockExhaustion,
        level: 3
      })
      // First call is POST, second is GET for refresh
      apiFetchMock
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: [updatedExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleUpdateLevel({
        slug: 'core:exhaustion',
        level: 3,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      // Store should fetch updated conditions
      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/conditions')
    })

    it('shows success toast after update', async () => {
      setupStore({ conditions: [mockExhaustion] })
      apiFetchMock.mockResolvedValue({ data: [mockExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleUpdateLevel({
        slug: 'core:exhaustion',
        level: 3,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Exhaustion updated',
          color: 'success'
        })
      )
    })

    it('shows error toast on update failure', async () => {
      setupStore({ conditions: [mockExhaustion] })
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleUpdateLevel({
        slug: 'core:exhaustion',
        level: 3,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to update exhaustion',
          color: 'error'
        })
      )
    })

    it('handles null source and duration', async () => {
      setupStore({ conditions: [mockExhaustion] })
      apiFetchMock.mockResolvedValue({ data: [mockExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleUpdateLevel({
        slug: 'core:exhaustion',
        level: 3,
        source: null,
        duration: null
      })

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/conditions', {
        method: 'POST',
        body: {
          condition: 'core:exhaustion',
          level: 3,
          source: '',
          duration: ''
        }
      })
    })
  })

  // ===========================================================================
  // DEADLY EXHAUSTION CONFIRMATION
  // ===========================================================================

  describe('deadly exhaustion confirmation', () => {
    it('opens confirmation modal when deadly exhaustion requested', async () => {
      setupStore({ conditions: [mockExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      vm.handleDeadlyExhaustionConfirm({
        slug: 'core:exhaustion',
        currentLevel: 5,
        targetLevel: 6,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      expect(vm.showDeadlyExhaustionModal).toBe(true)
    })

    it('calls store action with level 6 after confirmation', async () => {
      setupStore({ conditions: [mockExhaustion] })
      apiFetchMock.mockResolvedValue({ data: [mockExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM

      // Set up pending confirmation
      vm.handleDeadlyExhaustionConfirm({
        slug: 'core:exhaustion',
        currentLevel: 5,
        targetLevel: 6,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      // Confirm
      await vm.handleDeadlyExhaustionConfirmed()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/42/conditions', {
        method: 'POST',
        body: {
          condition: 'core:exhaustion',
          level: 6,
          source: 'Forced march',
          duration: 'Until long rest'
        }
      })
    })

    it('clears pending data after confirmation', async () => {
      setupStore({ conditions: [mockExhaustion] })
      apiFetchMock.mockResolvedValue({ data: [mockExhaustion] })

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM

      // Set up pending confirmation
      vm.handleDeadlyExhaustionConfirm({
        slug: 'core:exhaustion',
        currentLevel: 5,
        targetLevel: 6,
        source: 'Forced march',
        duration: 'Until long rest'
      })

      // Confirm
      await vm.handleDeadlyExhaustionConfirmed()

      // Pending data should be cleared
      expect(vm.showDeadlyExhaustionModal).toBe(false)
    })
  })

  // ===========================================================================
  // ISUPDATINGCONDITIONS STATE (from store)
  // ===========================================================================

  describe('isUpdatingConditions state', () => {
    it('store sets isUpdatingConditions during remove operation', async () => {
      setupStore({ conditions: [mockCondition] })
      let resolveRemove: () => void
      const removePromise = new Promise<void>((resolve) => {
        resolveRemove = resolve
      })
      apiFetchMock.mockImplementation(() => removePromise)

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM

      // Start operation
      const removeOp = vm.handleRemove('core:poisoned')

      // Store should be updating
      expect(store.isUpdatingConditions).toBe(true)

      // Complete operation
      resolveRemove!()
      await removeOp

      // Store should no longer be updating
      expect(store.isUpdatingConditions).toBe(false)
    })

    it('store resets isUpdatingConditions on error', async () => {
      setupStore({ conditions: [mockCondition] })
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const wrapper = await mountSuspended(ConditionsManager, {
        props: { editable: true },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as ConditionsManagerVM
      await vm.handleRemove('core:poisoned')

      expect(store.isUpdatingConditions).toBe(false)
    })
  })
})

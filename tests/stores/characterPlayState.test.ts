// tests/stores/characterPlayState.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for characterPlayState store
 *
 * This store manages reactive play state for the character sheet:
 * - Hit points (current, max, temporary)
 * - Death saves (successes, failures)
 * - Currency (pp, gp, ep, sp, cp)
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// =============================================================================
// API MOCK SETUP
// =============================================================================

const { mockApiFetch } = vi.hoisted(() => ({
  mockApiFetch: vi.fn()
}))

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({ apiFetch: mockApiFetch })
}))

// Import store AFTER mocks are set up
// eslint-disable-next-line import/first
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockInitialData = {
  characterId: 42,
  isDead: false,
  hitPoints: { current: 25, max: 30, temporary: 5 },
  deathSaves: { successes: 1, failures: 0 },
  currency: { pp: 10, gp: 50, ep: 0, sp: 25, cp: 100 }
}

const mockHpResponse = {
  data: {
    current_hit_points: 20,
    max_hit_points: 30,
    temp_hit_points: 5,
    death_save_successes: 1,
    death_save_failures: 0
  }
}

const mockCurrencyResponse = {
  data: {
    pp: 10,
    gp: 45,
    ep: 0,
    sp: 25,
    cp: 100
  }
}

// =============================================================================
// TESTS
// =============================================================================

describe('characterPlayState store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ===========================================================================
  // INITIAL STATE
  // ===========================================================================

  describe('initial state', () => {
    it('starts with null character id', () => {
      const store = useCharacterPlayStateStore()
      expect(store.characterId).toBeNull()
    })

    it('starts with isDead as false', () => {
      const store = useCharacterPlayStateStore()
      expect(store.isDead).toBe(false)
    })

    it('starts with zeroed hit points', () => {
      const store = useCharacterPlayStateStore()
      expect(store.hitPoints).toEqual({ current: 0, max: 0, temporary: 0 })
    })

    it('starts with zeroed death saves', () => {
      const store = useCharacterPlayStateStore()
      expect(store.deathSaves).toEqual({ successes: 0, failures: 0 })
    })

    it('starts with zeroed currency', () => {
      const store = useCharacterPlayStateStore()
      expect(store.currency).toEqual({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 })
    })

    it('starts with no loading flags', () => {
      const store = useCharacterPlayStateStore()
      expect(store.isUpdatingHp).toBe(false)
      expect(store.isUpdatingCurrency).toBe(false)
      expect(store.isUpdatingDeathSaves).toBe(false)
    })
  })

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  describe('initialize', () => {
    it('sets character id', () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)
      expect(store.characterId).toBe(42)
    })

    it('sets isDead flag', () => {
      const store = useCharacterPlayStateStore()
      store.initialize({ ...mockInitialData, isDead: true })
      expect(store.isDead).toBe(true)
    })

    it('sets hit points', () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)
      expect(store.hitPoints).toEqual({ current: 25, max: 30, temporary: 5 })
    })

    it('sets death saves', () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)
      expect(store.deathSaves).toEqual({ successes: 1, failures: 0 })
    })

    it('sets currency', () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)
      expect(store.currency).toEqual({ pp: 10, gp: 50, ep: 0, sp: 25, cp: 100 })
    })

    it('handles null/undefined hit points gracefully', () => {
      const store = useCharacterPlayStateStore()
      store.initialize({
        ...mockInitialData,
        hitPoints: { current: null as unknown as number, max: 30, temporary: undefined as unknown as number }
      })
      expect(store.hitPoints).toEqual({ current: 0, max: 30, temporary: 0 })
    })
  })

  // ===========================================================================
  // HP UPDATES
  // ===========================================================================

  describe('updateHp', () => {
    beforeEach(() => {
      mockApiFetch.mockResolvedValue(mockHpResponse)
    })

    it('sends delta as signed string to API', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateHp(-5)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/hp', {
        method: 'PATCH',
        body: { hp: '-5' }
      })
    })

    it('sends positive delta with + prefix', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateHp(10)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/hp', {
        method: 'PATCH',
        body: { hp: '+10' }
      })
    })

    it('updates hit points from response', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateHp(-5)

      expect(store.hitPoints.current).toBe(20)
      expect(store.hitPoints.max).toBe(30)
      expect(store.hitPoints.temporary).toBe(5)
    })

    it('syncs death saves from response', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      mockApiFetch.mockResolvedValue({
        data: {
          ...mockHpResponse.data,
          death_save_successes: 0,
          death_save_failures: 0
        }
      })

      await store.updateHp(10)

      expect(store.deathSaves.successes).toBe(0)
      expect(store.deathSaves.failures).toBe(0)
    })

    it('updates isDead from response when character dies from damage', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)
      expect(store.isDead).toBe(false)

      mockApiFetch.mockResolvedValue({
        data: {
          current_hit_points: 0,
          max_hit_points: 30,
          temp_hit_points: 0,
          death_save_successes: 0,
          death_save_failures: 0,
          is_dead: true // Massive damage killed them
        }
      })

      await store.updateHp(-100)

      expect(store.isDead).toBe(true)
    })

    it('sets loading flag during update', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      let loadingDuringCall = false
      mockApiFetch.mockImplementation(() => {
        loadingDuringCall = store.isUpdatingHp
        return Promise.resolve(mockHpResponse)
      })

      await store.updateHp(-5)

      expect(loadingDuringCall).toBe(true)
      expect(store.isUpdatingHp).toBe(false)
    })

    it('does nothing if no character id', async () => {
      const store = useCharacterPlayStateStore()
      // Not initialized

      await store.updateHp(-5)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('does nothing for zero delta', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateHp(0)

      expect(mockApiFetch).not.toHaveBeenCalled()
    })

    it('rolls back on error', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      mockApiFetch.mockRejectedValue(new Error('Network error'))

      await expect(store.updateHp(-5)).rejects.toThrow('Network error')

      // Should roll back to original values
      expect(store.hitPoints.current).toBe(25)
    })

    it('prevents concurrent updates', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      // Simulate slow request
      mockApiFetch.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve(mockHpResponse), 100)
      ))

      // Start first update
      const first = store.updateHp(-5)
      // Try second update while first is in progress
      await store.updateHp(-10)

      await first

      // Only first call should have been made
      expect(mockApiFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('setTempHp', () => {
    beforeEach(() => {
      mockApiFetch.mockResolvedValue(mockHpResponse)
    })

    it('sends temp_hp value to API', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.setTempHp(10)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/hp', {
        method: 'PATCH',
        body: { temp_hp: 10 }
      })
    })

    it('updates temporary hit points from response', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      mockApiFetch.mockResolvedValue({
        data: { ...mockHpResponse.data, temp_hit_points: 15 }
      })

      await store.setTempHp(15)

      expect(store.hitPoints.temporary).toBe(15)
    })
  })

  describe('clearTempHp', () => {
    beforeEach(() => {
      mockApiFetch.mockResolvedValue({
        data: { ...mockHpResponse.data, temp_hit_points: 0 }
      })
    })

    it('sends temp_hp: 0 to API', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.clearTempHp()

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/hp', {
        method: 'PATCH',
        body: { temp_hp: 0 }
      })
    })

    it('clears temporary hit points', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.clearTempHp()

      expect(store.hitPoints.temporary).toBe(0)
    })
  })

  // ===========================================================================
  // CURRENCY UPDATES
  // ===========================================================================

  describe('updateCurrency', () => {
    beforeEach(() => {
      mockApiFetch.mockResolvedValue(mockCurrencyResponse)
    })

    it('sends payload to API', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateCurrency({ gp: '-5' })

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42/currency', {
        method: 'PATCH',
        body: { gp: '-5' }
      })
    })

    it('updates currency from response', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateCurrency({ gp: '-5' })

      expect(store.currency.gp).toBe(45)
    })

    it('sets loading flag during update', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      let loadingDuringCall = false
      mockApiFetch.mockImplementation(() => {
        loadingDuringCall = store.isUpdatingCurrency
        return Promise.resolve(mockCurrencyResponse)
      })

      await store.updateCurrency({ gp: '-5' })

      expect(loadingDuringCall).toBe(true)
      expect(store.isUpdatingCurrency).toBe(false)
    })

    it('rolls back on error', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      mockApiFetch.mockRejectedValue({ statusCode: 422, data: { message: 'Insufficient funds' } })

      await expect(store.updateCurrency({ gp: '-100' })).rejects.toMatchObject({
        statusCode: 422
      })

      // Should roll back to original values
      expect(store.currency.gp).toBe(50)
    })

    it('prevents concurrent updates', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      mockApiFetch.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve(mockCurrencyResponse), 100)
      ))

      const first = store.updateCurrency({ gp: '-5' })
      await store.updateCurrency({ gp: '-10' })

      await first

      expect(mockApiFetch).toHaveBeenCalledTimes(1)
    })
  })

  // ===========================================================================
  // DEATH SAVES UPDATES
  // ===========================================================================

  describe('updateDeathSaves', () => {
    beforeEach(() => {
      mockApiFetch.mockResolvedValue({ data: {} })
    })

    it('sends successes update to API', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateDeathSaves('successes', 2)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { death_save_successes: 2 }
      })
    })

    it('sends failures update to API', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      await store.updateDeathSaves('failures', 1)

      expect(mockApiFetch).toHaveBeenCalledWith('/characters/42', {
        method: 'PATCH',
        body: { death_save_failures: 1 }
      })
    })

    it('updates local state optimistically', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      // Check value is updated before API returns
      let valuesDuringCall = { successes: 0, failures: 0 }
      mockApiFetch.mockImplementation(() => {
        valuesDuringCall = { ...store.deathSaves }
        return Promise.resolve({ data: {} })
      })

      await store.updateDeathSaves('successes', 3)

      expect(valuesDuringCall.successes).toBe(3)
    })

    it('rolls back on error', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      mockApiFetch.mockRejectedValue(new Error('Network error'))

      await expect(store.updateDeathSaves('successes', 3)).rejects.toThrow()

      expect(store.deathSaves.successes).toBe(1) // Original value
    })

    it('sets loading flag during update', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      let loadingDuringCall = false
      mockApiFetch.mockImplementation(() => {
        loadingDuringCall = store.isUpdatingDeathSaves
        return Promise.resolve({ data: {} })
      })

      await store.updateDeathSaves('failures', 1)

      expect(loadingDuringCall).toBe(true)
      expect(store.isUpdatingDeathSaves).toBe(false)
    })

    it('updates isDead from response when 3 failures recorded', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)
      expect(store.isDead).toBe(false)

      mockApiFetch.mockResolvedValue({
        data: {
          is_dead: true,
          death_save_successes: 0,
          death_save_failures: 3
        }
      })

      await store.updateDeathSaves('failures', 3)

      expect(store.isDead).toBe(true)
    })
  })

  // ===========================================================================
  // SPELL SLOT TRACKING
  // ===========================================================================

  describe('spell slot tracking', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })

    it('initializes spell slots from stats', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([
        { level: 1, total: 4 },
        { level: 2, total: 3 }
      ])

      expect(store.getSlotState(1)).toEqual({ total: 4, spent: 0, available: 4 })
      expect(store.getSlotState(2)).toEqual({ total: 3, spent: 0, available: 3 })
    })

    it('useSpellSlot increments spent count', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellSlots([{ level: 1, total: 4 }])

      // Mock API call
      vi.spyOn(store, 'useSpellSlot').mockImplementation(async (level) => {
        store.spellSlots.set(level, { total: 4, spent: 1, slotType: 'standard' })
      })

      await store.useSpellSlot(1)

      expect(store.getSlotState(1).spent).toBe(1)
      expect(store.getSlotState(1).available).toBe(3)
    })

    it('restoreSpellSlot decrements spent count', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellSlots([{ level: 1, total: 4 }])
      store.spellSlots.set(1, { total: 4, spent: 2, slotType: 'standard' })

      vi.spyOn(store, 'restoreSpellSlot').mockImplementation(async (level) => {
        store.spellSlots.set(level, { total: 4, spent: 1, slotType: 'standard' })
      })

      await store.restoreSpellSlot(1)

      expect(store.getSlotState(1).spent).toBe(1)
      expect(store.getSlotState(1).available).toBe(3)
    })

    it('cannot use slot when none available', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([{ level: 1, total: 2 }])
      store.spellSlots.set(1, { total: 2, spent: 2, slotType: 'standard' })

      expect(store.canUseSlot(1)).toBe(false)
    })

    it('cannot restore slot when none spent', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([{ level: 1, total: 2 }])

      expect(store.canRestoreSlot(1)).toBe(false)
    })

    it('initializes spell slots with spent values from API', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([
        { level: 1, total: 4, spent: 2 },
        { level: 2, total: 3, spent: 1 }
      ])

      expect(store.getSlotState(1)).toEqual({ total: 4, spent: 2, available: 2 })
      expect(store.getSlotState(2)).toEqual({ total: 3, spent: 1, available: 2 })
    })

    it('defaults spent to 0 when not provided (backwards compatibility)', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([
        { level: 1, total: 4 }
      ])

      expect(store.getSlotState(1)).toEqual({ total: 4, spent: 0, available: 4 })
    })

    it('initializes pact magic slots separately', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([], {
        level: 2,
        total: 2,
        spent: 1
      })

      // Pact slots are stored with negative key to avoid collision with standard slots
      const pactState = store.spellSlots.get(-2)
      expect(pactState).toEqual({ total: 2, spent: 1, slotType: 'pact_magic' })
    })

    it('handles both standard and pact magic slots', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots(
        [{ level: 1, total: 4, spent: 0 }],
        { level: 1, total: 2, spent: 1 }
      )

      // Standard slots at level 1
      const standardState = store.spellSlots.get(1)
      expect(standardState).toEqual({ total: 4, spent: 0, slotType: 'standard' })

      // Pact slots stored with negative key to avoid collision
      const pactState = store.spellSlots.get(-1)
      expect(pactState).toEqual({ total: 2, spent: 1, slotType: 'pact_magic' })
    })

    it('clamps negative spent values to 0', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([
        { level: 1, total: 4, spent: -5 }
      ])

      expect(store.getSlotState(1)).toEqual({ total: 4, spent: 0, available: 4 })
    })

    it('clamps spent values that exceed total', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([
        { level: 1, total: 4, spent: 10 }
      ])

      expect(store.getSlotState(1)).toEqual({ total: 4, spent: 4, available: 0 })
    })

    it('does not store pact magic with total 0', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([], { level: 2, total: 0, spent: 0 })

      // Pact magic should not be stored
      expect(store.spellSlots.get(-2)).toBeUndefined()
    })

    it('validates pact magic spent values', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellSlots([], { level: 2, total: 2, spent: 5 })

      const pactState = store.spellSlots.get(-2)
      expect(pactState).toEqual({ total: 2, spent: 2, slotType: 'pact_magic' })
    })
  })

  // ===========================================================================
  // SPELL PREPARATION TRACKING
  // ===========================================================================

  describe('spell preparation tracking', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })

    it('initializes prepared spell IDs from spells array', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellPreparation({
        spells: [
          { id: 1, is_prepared: true, is_always_prepared: false },
          { id: 2, is_prepared: false, is_always_prepared: false },
          { id: 3, is_prepared: true, is_always_prepared: true }
        ] as any[],
        preparationLimit: 5
      })

      expect(store.preparedSpellIds.has(1)).toBe(true)
      expect(store.preparedSpellIds.has(2)).toBe(false)
      expect(store.preparedSpellIds.has(3)).toBe(true)
      expect(store.preparedSpellCount).toBe(2)
    })

    it('atPreparationLimit returns true when at limit', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellPreparation({
        spells: [
          { id: 1, is_prepared: true, is_always_prepared: false },
          { id: 2, is_prepared: true, is_always_prepared: false }
        ] as any[],
        preparationLimit: 2
      })

      expect(store.atPreparationLimit).toBe(true)
    })

    it('atPreparationLimit returns false when under limit', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellPreparation({
        spells: [
          { id: 1, is_prepared: true, is_always_prepared: false }
        ] as any[],
        preparationLimit: 5
      })

      expect(store.atPreparationLimit).toBe(false)
    })

    it('atPreparationLimit returns false when no limit (known casters)', () => {
      const store = useCharacterPlayStateStore()
      store.initializeSpellPreparation({
        spells: [
          { id: 1, is_prepared: true, is_always_prepared: false }
        ] as any[],
        preparationLimit: null
      })

      expect(store.atPreparationLimit).toBe(false)
    })

    it('toggleSpellPreparation prepares an unprepared spell', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellPreparation({
        spells: [{ id: 42, is_prepared: false, is_always_prepared: false }] as any[],
        preparationLimit: 5
      })

      vi.spyOn(store, 'toggleSpellPreparation').mockImplementation(async (id, current) => {
        if (!current) store.preparedSpellIds.add(id)
        else store.preparedSpellIds.delete(id)
      })

      await store.toggleSpellPreparation(42, false)

      expect(store.preparedSpellIds.has(42)).toBe(true)
    })

    it('toggleSpellPreparation unprepares a prepared spell', async () => {
      const store = useCharacterPlayStateStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellPreparation({
        spells: [{ id: 42, is_prepared: true, is_always_prepared: false }] as any[],
        preparationLimit: 5
      })

      vi.spyOn(store, 'toggleSpellPreparation').mockImplementation(async (id, current) => {
        if (!current) store.preparedSpellIds.add(id)
        else store.preparedSpellIds.delete(id)
      })

      await store.toggleSpellPreparation(42, true)

      expect(store.preparedSpellIds.has(42)).toBe(false)
    })
  })

  // ===========================================================================
  // CLASS RESOURCE COUNTERS
  // ===========================================================================

  describe('class resource counters', () => {
    const mockCounters = [
      { id: 1, slug: 'rage', name: 'Rage', current: 3, max: 3, reset_on: 'long_rest' as const, source: 'Barbarian', source_type: 'class', unlimited: false },
      { id: 2, slug: 'ki-points', name: 'Ki Points', current: 4, max: 5, reset_on: 'short_rest' as const, source: 'Monk', source_type: 'class', unlimited: false }
    ]

    describe('initializeCounters', () => {
      it('sets counters from array', () => {
        const store = useCharacterPlayStateStore()
        store.initializeCounters(mockCounters)

        expect(store.counters).toHaveLength(2)
        expect(store.counters[0].slug).toBe('rage')
        expect(store.counters[1].slug).toBe('ki-points')
      })

      it('deep copies counters to avoid mutation', () => {
        const store = useCharacterPlayStateStore()
        const original = [...mockCounters]
        store.initializeCounters(original)

        // Mutate original
        original[0].current = 0

        // Store should be unaffected
        expect(store.counters[0].current).toBe(3)
      })

      it('clears existing counters on re-initialize', () => {
        const store = useCharacterPlayStateStore()
        store.initializeCounters(mockCounters)
        store.initializeCounters([mockCounters[0]])

        expect(store.counters).toHaveLength(1)
      })
    })

    describe('useCounter', () => {
      beforeEach(() => {
        mockApiFetch.mockResolvedValue({ data: { current: 2 } })
      })

      it('sends use action to API', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        // Use fresh counter data with current > 0 to allow useCounter
        store.initializeCounters([{ ...mockCounters[0], current: 3 }])

        await store.useCounter('rage')

        expect(mockApiFetch).toHaveBeenCalledWith(
          '/characters/42/counters/rage',
          { method: 'PATCH', body: { action: 'use' } }
        )
      })

      it('decrements current value after API call', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        // Use fresh counter data with current > 0
        store.initializeCounters([{ ...mockCounters[0], current: 3 }])

        await store.useCounter('rage')

        // After API call completes, value should be decremented
        expect(store.counters.find(c => c.slug === 'rage')!.current).toBe(2)
      })

      it('does nothing if counter is at 0', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        store.initializeCounters([{ ...mockCounters[0], current: 0 }])

        await store.useCounter('rage')

        expect(mockApiFetch).not.toHaveBeenCalled()
      })

      it('does nothing if counter not found', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        store.initializeCounters(mockCounters)

        await store.useCounter('nonexistent')

        expect(mockApiFetch).not.toHaveBeenCalled()
      })

      it('rolls back on error', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        store.initializeCounters([{ ...mockCounters[0], current: 3 }])

        mockApiFetch.mockRejectedValueOnce(new Error('Network error'))

        await expect(store.useCounter('rage')).rejects.toThrow('Network error')

        expect(store.counters.find(c => c.slug === 'rage')!.current).toBe(3) // Original value
      })
    })

    describe('restoreCounter', () => {
      beforeEach(() => {
        mockApiFetch.mockResolvedValue({ data: { current: 4 } })
      })

      it('sends restore action to API', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        store.initializeCounters([{ ...mockCounters[0], current: 2 }])

        await store.restoreCounter('rage')

        expect(mockApiFetch).toHaveBeenCalledWith(
          '/characters/42/counters/rage',
          { method: 'PATCH', body: { action: 'restore' } }
        )
      })

      it('increments current value after API call', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        store.initializeCounters([{ ...mockCounters[0], current: 2 }])

        await store.restoreCounter('rage')

        // After API call completes, value should be incremented
        expect(store.counters.find(c => c.slug === 'rage')!.current).toBe(3)
      })

      it('does nothing if counter is at max', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        // Use fresh counter data to avoid any test isolation issues
        store.initializeCounters([{ ...mockCounters[0], current: 3, max: 3 }])

        await store.restoreCounter('rage')

        expect(mockApiFetch).not.toHaveBeenCalled()
      })

      it('rolls back on error', async () => {
        const store = useCharacterPlayStateStore()
        store.initialize(mockInitialData)
        store.initializeCounters([{ ...mockCounters[0], current: 2 }])

        mockApiFetch.mockRejectedValueOnce(new Error('Network error'))

        await expect(store.restoreCounter('rage')).rejects.toThrow('Network error')

        expect(store.counters.find(c => c.slug === 'rage')!.current).toBe(2) // Original value
      })
    })
  })

  // ===========================================================================
  // RESET
  // ===========================================================================

  describe('$reset', () => {
    it('resets all state to initial values', () => {
      const store = useCharacterPlayStateStore()
      store.initialize(mockInitialData)

      store.$reset()

      expect(store.characterId).toBeNull()
      expect(store.isDead).toBe(false)
      expect(store.hitPoints).toEqual({ current: 0, max: 0, temporary: 0 })
      expect(store.deathSaves).toEqual({ successes: 0, failures: 0 })
      expect(store.currency).toEqual({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 })
    })

    it('resets counters', () => {
      const store = useCharacterPlayStateStore()
      store.initializeCounters([
        { id: 1, slug: 'rage', name: 'Rage', current: 2, max: 3, reset_on: 'long_rest', source: 'Barbarian', source_type: 'class', unlimited: false }
      ])

      store.$reset()

      expect(store.counters).toEqual([])
    })
  })
})

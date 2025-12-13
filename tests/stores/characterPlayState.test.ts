// tests/stores/characterPlayState.test.ts
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
  })
})

// app/stores/characterPlayState.ts
/**
 * Character Play State Store
 *
 * Manages reactive play state for the character sheet:
 * - Hit points (current, max, temporary)
 * - Death saves (successes, failures)
 * - Currency (pp, gp, ep, sp, cp)
 *
 * Used by manager components (CurrencyManager, HitPointsManager, DeathSavesManager)
 * to provide self-contained, reusable character sheet interactions.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { defineStore } from 'pinia'
import type { CharacterCurrency } from '~/types/character'

// =============================================================================
// TYPES
// =============================================================================

export interface HitPoints {
  current: number
  max: number
  temporary: number
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface CharacterPlayData {
  characterId: number
  isDead: boolean
  hitPoints: { current: number | null, max: number | null, temporary?: number | null }
  deathSaves: { successes: number, failures: number }
  currency: CharacterCurrency
}

export interface CurrencyDelta {
  pp?: string
  gp?: string
  ep?: string
  sp?: string
  cp?: string
}

interface HpUpdateResponse {
  data: {
    current_hit_points: number
    max_hit_points: number
    temp_hit_points: number
    death_save_successes: number
    death_save_failures: number
    is_dead?: boolean
  }
}

interface DeathSaveUpdateResponse {
  data: {
    is_dead?: boolean
    death_save_successes?: number
    death_save_failures?: number
  }
}

interface CurrencyUpdateResponse {
  data: CharacterCurrency
}

// =============================================================================
// STORE
// =============================================================================

export const useCharacterPlayStateStore = defineStore('characterPlayState', () => {
  const { apiFetch } = useApi()

  // ===========================================================================
  // STATE
  // ===========================================================================

  /** Character being managed */
  const characterId = ref<number | null>(null)

  /** Whether character is dead (disables all interactions) */
  const isDead = ref(false)

  /** Hit points state */
  const hitPoints = reactive<HitPoints>({
    current: 0,
    max: 0,
    temporary: 0
  })

  /** Death saves state */
  const deathSaves = reactive<DeathSaves>({
    successes: 0,
    failures: 0
  })

  /** Currency state */
  const currency = reactive<CharacterCurrency>({
    pp: 0,
    gp: 0,
    ep: 0,
    sp: 0,
    cp: 0
  })

  /** Loading flags to prevent race conditions */
  const isUpdatingHp = ref(false)
  const isUpdatingCurrency = ref(false)
  const isUpdatingDeathSaves = ref(false)

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  /**
   * Initialize store from server data
   *
   * Call this when character data loads. Handles null/undefined values gracefully.
   */
  function initialize(data: CharacterPlayData) {
    characterId.value = data.characterId
    isDead.value = data.isDead

    // Set hit points (handle null/undefined)
    hitPoints.current = data.hitPoints.current ?? 0
    hitPoints.max = data.hitPoints.max ?? 0
    hitPoints.temporary = data.hitPoints.temporary ?? 0

    // Set death saves
    deathSaves.successes = data.deathSaves.successes
    deathSaves.failures = data.deathSaves.failures

    // Set currency
    currency.pp = data.currency.pp
    currency.gp = data.currency.gp
    currency.ep = data.currency.ep
    currency.sp = data.currency.sp
    currency.cp = data.currency.cp
  }

  // ===========================================================================
  // HP ACTIONS
  // ===========================================================================

  /**
   * Update HP by delta (damage or healing)
   *
   * Sends delta as signed string to backend which handles D&D rules:
   * - Temp HP absorbs damage first
   * - Healing caps at max HP
   * - Death saves reset when healing from 0
   *
   * @param delta - Positive for healing, negative for damage
   */
  async function updateHp(delta: number): Promise<void> {
    if (!characterId.value || isUpdatingHp.value) return
    if (delta === 0) return

    isUpdatingHp.value = true

    // Store old values for rollback
    const oldCurrent = hitPoints.current
    const oldMax = hitPoints.max
    const oldTemporary = hitPoints.temporary
    const oldDeathSuccesses = deathSaves.successes
    const oldDeathFailures = deathSaves.failures

    try {
      const hpDelta = delta > 0 ? `+${delta}` : `${delta}`
      const response = await apiFetch<HpUpdateResponse>(`/characters/${characterId.value}/hp`, {
        method: 'PATCH',
        body: { hp: hpDelta }
      })

      // Update from authoritative backend response
      hitPoints.current = response.data.current_hit_points
      hitPoints.max = response.data.max_hit_points
      hitPoints.temporary = response.data.temp_hit_points
      deathSaves.successes = response.data.death_save_successes
      deathSaves.failures = response.data.death_save_failures
      if (response.data.is_dead !== undefined) {
        isDead.value = response.data.is_dead
      }
    } catch (err) {
      // Rollback on error
      hitPoints.current = oldCurrent
      hitPoints.max = oldMax
      hitPoints.temporary = oldTemporary
      deathSaves.successes = oldDeathSuccesses
      deathSaves.failures = oldDeathFailures
      throw err
    } finally {
      isUpdatingHp.value = false
    }
  }

  /**
   * Set temporary HP
   *
   * Backend enforces D&D rule: Temp HP uses higher-wins (doesn't stack)
   */
  async function setTempHp(value: number): Promise<void> {
    if (!characterId.value || isUpdatingHp.value) return

    isUpdatingHp.value = true
    const oldTemporary = hitPoints.temporary

    try {
      const response = await apiFetch<HpUpdateResponse>(`/characters/${characterId.value}/hp`, {
        method: 'PATCH',
        body: { temp_hp: value }
      })

      hitPoints.current = response.data.current_hit_points
      hitPoints.max = response.data.max_hit_points
      hitPoints.temporary = response.data.temp_hit_points
      deathSaves.successes = response.data.death_save_successes
      deathSaves.failures = response.data.death_save_failures
      if (response.data.is_dead !== undefined) {
        isDead.value = response.data.is_dead
      }
    } catch (err) {
      hitPoints.temporary = oldTemporary
      throw err
    } finally {
      isUpdatingHp.value = false
    }
  }

  /**
   * Clear temporary HP
   *
   * Sends temp_hp: 0 to clear (overrides higher-wins rule)
   */
  async function clearTempHp(): Promise<void> {
    if (!characterId.value || isUpdatingHp.value) return

    isUpdatingHp.value = true
    const oldTemporary = hitPoints.temporary

    try {
      const response = await apiFetch<HpUpdateResponse>(`/characters/${characterId.value}/hp`, {
        method: 'PATCH',
        body: { temp_hp: 0 }
      })

      hitPoints.current = response.data.current_hit_points
      hitPoints.max = response.data.max_hit_points
      hitPoints.temporary = response.data.temp_hit_points
      deathSaves.successes = response.data.death_save_successes
      deathSaves.failures = response.data.death_save_failures
      if (response.data.is_dead !== undefined) {
        isDead.value = response.data.is_dead
      }
    } catch (err) {
      hitPoints.temporary = oldTemporary
      throw err
    } finally {
      isUpdatingHp.value = false
    }
  }

  // ===========================================================================
  // CURRENCY ACTIONS
  // ===========================================================================

  /**
   * Update currency
   *
   * Sends delta payload to backend which handles:
   * - Add/subtract/set operations
   * - Auto-conversion ("making change") when needed
   * - Validation of sufficient funds
   */
  async function updateCurrency(payload: CurrencyDelta): Promise<void> {
    if (!characterId.value || isUpdatingCurrency.value) return

    isUpdatingCurrency.value = true

    // Store old values for rollback
    const oldCurrency = { ...currency }

    try {
      const response = await apiFetch<CurrencyUpdateResponse>(
        `/characters/${characterId.value}/currency`,
        {
          method: 'PATCH',
          body: payload
        }
      )

      // Update from authoritative backend response
      currency.pp = response.data.pp
      currency.gp = response.data.gp
      currency.ep = response.data.ep
      currency.sp = response.data.sp
      currency.cp = response.data.cp
    } catch (err) {
      // Rollback on error
      Object.assign(currency, oldCurrency)
      throw err
    } finally {
      isUpdatingCurrency.value = false
    }
  }

  // ===========================================================================
  // DEATH SAVES ACTIONS
  // ===========================================================================

  /**
   * Update death saves
   *
   * Uses optimistic UI - updates local state immediately, rolls back on error
   */
  async function updateDeathSaves(
    field: 'successes' | 'failures',
    value: number
  ): Promise<void> {
    if (!characterId.value || isUpdatingDeathSaves.value) return

    isUpdatingDeathSaves.value = true
    const oldValue = deathSaves[field]

    // Optimistic update
    deathSaves[field] = value

    try {
      const response = await apiFetch<DeathSaveUpdateResponse>(`/characters/${characterId.value}`, {
        method: 'PATCH',
        body: {
          [`death_save_${field}`]: value
        }
      })

      // Update isDead from authoritative backend response
      if (response.data.is_dead !== undefined) {
        isDead.value = response.data.is_dead
      }
    } catch (err) {
      // Rollback on error
      deathSaves[field] = oldValue
      throw err
    } finally {
      isUpdatingDeathSaves.value = false
    }
  }

  // ===========================================================================
  // RESET
  // ===========================================================================

  /**
   * Reset store to initial state
   *
   * Call this when leaving the character page
   */
  function $reset() {
    characterId.value = null
    isDead.value = false

    hitPoints.current = 0
    hitPoints.max = 0
    hitPoints.temporary = 0

    deathSaves.successes = 0
    deathSaves.failures = 0

    currency.pp = 0
    currency.gp = 0
    currency.ep = 0
    currency.sp = 0
    currency.cp = 0

    isUpdatingHp.value = false
    isUpdatingCurrency.value = false
    isUpdatingDeathSaves.value = false
  }

  // ===========================================================================
  // RETURN
  // ===========================================================================

  return {
    // State
    characterId,
    isDead,
    hitPoints,
    deathSaves,
    currency,
    isUpdatingHp,
    isUpdatingCurrency,
    isUpdatingDeathSaves,

    // Actions
    initialize,
    updateHp,
    setTempHp,
    clearTempHp,
    updateCurrency,
    updateDeathSaves,
    $reset
  }
})

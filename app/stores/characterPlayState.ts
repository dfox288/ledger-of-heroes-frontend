// app/stores/characterPlayState.ts
/**
 * Character Play State Store
 *
 * Manages reactive play state for the character sheet:
 * - Hit points (current, max, temporary)
 * - Death saves (successes, failures)
 * - Currency (pp, gp, ep, sp, cp)
 * - Spell slots and preparation
 * - Active conditions
 *
 * Used by manager components (CurrencyManager, HitPointsManager, DeathSavesManager)
 * to provide self-contained, reusable character sheet interactions.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { defineStore } from 'pinia'
import type { CharacterCurrency, CharacterCondition, CharacterNote, Counter } from '~/types/character'
import { logger } from '~/utils/logger'

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
  }
}

interface CurrencyUpdateResponse {
  data: CharacterCurrency
}

export interface NotePayload {
  category?: string
  title?: string | null
  content: string
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

  /**
   * Whether play mode is active (enables interactive features)
   * Stored in cookie for SSR hydration (available on both server and client)
   */
  const playModeCookie = useCookie<boolean>('character-play-mode', {
    default: () => false,
    watch: true
  })
  const isPlayMode = computed({
    get: () => playModeCookie.value,
    set: (val: boolean) => { playModeCookie.value = val }
  })

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

  /** Spell slots state - tracks total and spent for each level */
  const spellSlots = ref(new Map<number, { total: number, spent: number, slotType: 'standard' | 'pact_magic' }>())

  /** Spell preparation state - tracks which spells are prepared */
  const preparedSpellIds = ref(new Set<number>())

  /** Preparation limit for prepared casters (null for known casters) */
  const preparationLimit = ref<number | null>(null)

  /** Active conditions (status effects) */
  const conditions = ref<CharacterCondition[]>([])

  /** Class resource counters (Rage, Ki Points, etc.) */
  const counters = ref<Counter[]>([])

  /** Track pending counter updates by ID to prevent race conditions */
  const pendingCounterUpdates = ref<Set<number>>(new Set())

  /** Character notes grouped by category */
  const notes = ref<Record<string, CharacterNote[]>>({})

  /** Temp ID counter for optimistic note creates (negative to avoid server ID collisions) */
  let noteTempIdCounter = -1

  /** Optimistic notes pending API confirmation */
  const pendingNoteCreates = ref<CharacterNote[]>([])

  /** Note IDs pending deletion */
  const pendingNoteDeletes = ref<Set<number>>(new Set())

  /** Notes with pending edits (id -> updated note) */
  const pendingNoteEdits = ref<Map<number, CharacterNote>>(new Map())

  /** Loading flags to prevent race conditions */
  const isUpdatingHp = ref(false)
  const isUpdatingCurrency = ref(false)
  const isUpdatingDeathSaves = ref(false)
  const isUpdatingSpellSlot = ref(false)
  const isUpdatingSpellPreparation = ref(false)
  const isUpdatingConditions = ref(false)
  const isUpdatingNotes = ref(false)

  // ===========================================================================
  // COMPUTED
  // ===========================================================================

  /** Can the user interact with the character? (play mode ON and not dead) */
  const canEdit = computed(() => isPlayMode.value && !isDead.value)

  /**
   * Display notes: merges notes with optimistic updates
   * - Filters out notes pending deletion
   * - Applies pending edits
   * - Adds pending creates
   */
  const displayNotes = computed(() => {
    const result: Record<string, CharacterNote[]> = {}

    // Process existing notes
    for (const [category, categoryNotes] of Object.entries(notes.value)) {
      const filteredNotes = categoryNotes
        .filter(note => !pendingNoteDeletes.value.has(note.id))
        .map(note => pendingNoteEdits.value.get(note.id) ?? note)

      if (filteredNotes.length > 0) {
        result[category] = filteredNotes
      }
    }

    // Add pending creates
    for (const note of pendingNoteCreates.value) {
      const category = note.category
      if (!result[category]) {
        result[category] = []
      }
      result[category]!.push(note)
    }

    return result
  })

  // ===========================================================================
  // SPELL SLOT GETTERS
  // ===========================================================================

  /**
   * Get spell slot state for a given level
   */
  function getSlotState(level: number): { total: number, spent: number, available: number } {
    const slot = spellSlots.value.get(level)
    if (!slot) return { total: 0, spent: 0, available: 0 }
    return {
      total: slot.total,
      spent: slot.spent,
      available: slot.total - slot.spent
    }
  }

  /**
   * Check if a slot can be used (has available slots)
   */
  function canUseSlot(level: number): boolean {
    const slot = spellSlots.value.get(level)
    return slot ? slot.spent < slot.total : false
  }

  /**
   * Check if a slot can be restored (has spent slots)
   */
  function canRestoreSlot(level: number): boolean {
    const slot = spellSlots.value.get(level)
    return slot ? slot.spent > 0 : false
  }

  // ===========================================================================
  // SPELL PREPARATION GETTERS
  // ===========================================================================

  /**
   * Get count of prepared spells
   */
  const preparedSpellCount = computed(() => {
    return preparedSpellIds.value.size
  })

  /**
   * Check if character is at preparation limit
   *
   * Returns false for known casters (limit is null)
   */
  const atPreparationLimit = computed(() => {
    if (preparationLimit.value === null) return false
    return preparedSpellIds.value.size >= preparationLimit.value
  })

  /**
   * Check if a spell is prepared
   */
  function isSpellPrepared(characterSpellId: number): boolean {
    return preparedSpellIds.value.has(characterSpellId)
  }

  // ===========================================================================
  // PLAY MODE
  // ===========================================================================

  /**
   * Set play mode state
   *
   * Automatically persisted to cookie for SSR compatibility
   */
  function setPlayMode(enabled: boolean) {
    isPlayMode.value = enabled
  }

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

    // Force play mode off for dead characters
    if (isDead.value && isPlayMode.value) {
      isPlayMode.value = false
    }

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
  // SPELL SLOT ACTIONS
  // ===========================================================================

  /**
   * Initialize spell slots from character stats
   *
   * Call this when character data loads. Accepts the new API format with
   * spent values included, and optional pact magic for Warlocks.
   *
   * @param slots - Standard spell slots with total and optional spent count
   * @param pactMagic - Optional pact magic slots for Warlocks
   *
   * @see Issue #618 - Spell slots format change
   */
  function initializeSpellSlots(
    slots: Array<{ level: number, total: number, spent?: number }>,
    pactMagic?: { level: number, total: number, spent?: number } | null
  ) {
    spellSlots.value.clear()

    // Initialize standard slots
    for (const slot of slots) {
      // Validate spent: must be >= 0 and <= total
      const validSpent = Math.max(0, Math.min(slot.spent ?? 0, slot.total))
      spellSlots.value.set(slot.level, {
        total: slot.total,
        spent: validSpent,
        slotType: 'standard'
      })
    }

    // Initialize pact magic slots (stored with negative key to avoid collision)
    // Negative keys distinguish pact slots from standard slots at the same spell level
    if (pactMagic && pactMagic.total > 0) {
      // Validate spent: must be >= 0 and <= total
      const validSpent = Math.max(0, Math.min(pactMagic.spent ?? 0, pactMagic.total))
      spellSlots.value.set(-pactMagic.level, {
        total: pactMagic.total,
        spent: validSpent,
        slotType: 'pact_magic'
      })
    }
  }

  /**
   * Use a spell slot (optimistic update)
   *
   * Increments spent count, calls API, reverts on error
   */
  async function useSpellSlot(level: number): Promise<void> {
    if (!canUseSlot(level) || !characterId.value || isUpdatingSpellSlot.value) return

    const slot = spellSlots.value.get(level)
    if (!slot) return

    isUpdatingSpellSlot.value = true

    // Optimistic update
    const previousSpent = slot.spent
    slot.spent += 1
    spellSlots.value.set(level, { ...slot })

    try {
      await apiFetch(`/characters/${characterId.value}/spell-slots/${level}`, {
        method: 'PATCH',
        body: { action: 'use' }
      })
    } catch (error) {
      // Revert on failure
      slot.spent = previousSpent
      spellSlots.value.set(level, { ...slot })
      throw error
    } finally {
      isUpdatingSpellSlot.value = false
    }
  }

  /**
   * Restore a spell slot (optimistic update)
   *
   * Decrements spent count, calls API, reverts on error
   */
  async function restoreSpellSlot(level: number): Promise<void> {
    if (!canRestoreSlot(level) || !characterId.value || isUpdatingSpellSlot.value) return

    const slot = spellSlots.value.get(level)
    if (!slot) return

    isUpdatingSpellSlot.value = true

    // Optimistic update
    const previousSpent = slot.spent
    slot.spent -= 1
    spellSlots.value.set(level, { ...slot })

    try {
      await apiFetch(`/characters/${characterId.value}/spell-slots/${level}`, {
        method: 'PATCH',
        body: { action: 'restore' }
      })
    } catch (error) {
      // Revert on failure
      slot.spent = previousSpent
      spellSlots.value.set(level, { ...slot })
      throw error
    } finally {
      isUpdatingSpellSlot.value = false
    }
  }

  /**
   * Reset all spell slots to 0 spent
   *
   * Called during long rest (backend handles persistence)
   */
  async function resetSpellSlots(): Promise<void> {
    if (!characterId.value) return

    // Reset all slots to 0 spent
    for (const [level, slot] of spellSlots.value) {
      spellSlots.value.set(level, { ...slot, spent: 0 })
    }

    // Note: Long rest endpoint handles this on backend
  }

  // ===========================================================================
  // SPELL PREPARATION ACTIONS
  // ===========================================================================

  /**
   * Initialize spell preparation state from character data
   *
   * Call this when character spells load.
   * Only tracks manually prepared spells (not always-prepared) since:
   * - Always-prepared spells can't be toggled
   * - Always-prepared spells don't count against preparation limit
   */
  function initializeSpellPreparation(data: {
    spells: Array<{ id: number, is_prepared: boolean, is_always_prepared: boolean }>
    preparationLimit: number | null
  }) {
    preparedSpellIds.value.clear()
    preparationLimit.value = data.preparationLimit

    for (const spell of data.spells) {
      // Only track manually prepared spells, not always-prepared
      // Always-prepared don't count against the limit and can't be toggled
      if (spell.is_prepared && !spell.is_always_prepared) {
        preparedSpellIds.value.add(spell.id)
      }
    }
  }

  /**
   * Toggle spell preparation (optimistic update)
   *
   * Uses the /prepare and /unprepare endpoints which accept spell slug.
   * Checks preparation limit before preparing a spell.
   *
   * @param characterSpellId - Numeric ID used for optimistic UI updates
   * @param currentlyPrepared - Current preparation state
   * @param spellSlug - Spell slug for API call (e.g., "phb:bless")
   * @param classSlug - Optional class slug for multiclass characters
   */
  async function toggleSpellPreparation(
    characterSpellId: number,
    currentlyPrepared: boolean,
    spellSlug: string,
    classSlug?: string
  ): Promise<void> {
    if (!characterId.value || isUpdatingSpellPreparation.value) return

    const newPreparedState = !currentlyPrepared

    // Check limit when preparing
    if (newPreparedState && atPreparationLimit.value) {
      throw new Error('Preparation limit reached')
    }

    isUpdatingSpellPreparation.value = true

    // Optimistic update
    if (newPreparedState) {
      preparedSpellIds.value.add(characterSpellId)
    } else {
      preparedSpellIds.value.delete(characterSpellId)
    }

    try {
      const endpoint = newPreparedState ? 'prepare' : 'unprepare'
      await apiFetch(`/characters/${characterId.value}/spells/${spellSlug}/${endpoint}`, {
        method: 'PATCH',
        body: classSlug ? { class_slug: classSlug } : {}
      })
    } catch (error) {
      // Revert on failure
      if (newPreparedState) {
        preparedSpellIds.value.delete(characterSpellId)
      } else {
        preparedSpellIds.value.add(characterSpellId)
      }
      throw error
    } finally {
      isUpdatingSpellPreparation.value = false
    }
  }

  // ===========================================================================
  // CONDITIONS ACTIONS
  // ===========================================================================

  /**
   * Fetch conditions from API
   *
   * Call this when initializing the store or when conditions need refresh
   */
  async function fetchConditions(): Promise<void> {
    if (!characterId.value) return

    try {
      const response = await apiFetch<{ data: CharacterCondition[] }>(
        `/characters/${characterId.value}/conditions`
      )
      conditions.value = response.data
    } catch (err) {
      logger.error('Failed to fetch conditions:', err)
      conditions.value = []
    }
  }

  /**
   * Add a condition to the character
   */
  async function addCondition(payload: {
    condition: string
    source: string
    duration: string
    level?: number
  }): Promise<boolean> {
    if (!characterId.value || isUpdatingConditions.value) return false

    isUpdatingConditions.value = true

    try {
      await apiFetch(`/characters/${characterId.value}/conditions`, {
        method: 'POST',
        body: payload
      })
      // Refresh conditions from server to get full data
      await fetchConditions()
      return true
    } catch (err) {
      logger.error('Failed to add condition:', err)
      return false
    } finally {
      isUpdatingConditions.value = false
    }
  }

  /**
   * Remove a condition from the character
   */
  async function removeCondition(conditionSlug: string): Promise<boolean> {
    if (!characterId.value || isUpdatingConditions.value) return false

    isUpdatingConditions.value = true
    const oldConditions = [...conditions.value]

    // Optimistic update
    conditions.value = conditions.value.filter(c => c.condition_slug !== conditionSlug)

    try {
      await apiFetch(`/characters/${characterId.value}/conditions/${conditionSlug}`, {
        method: 'DELETE'
      })
      return true
    } catch (err) {
      // Rollback on error
      conditions.value = oldConditions
      logger.error('Failed to remove condition:', err)
      return false
    } finally {
      isUpdatingConditions.value = false
    }
  }

  /**
   * Update exhaustion level
   *
   * POSTs updated level to backend (upsert behavior)
   */
  async function updateExhaustionLevel(payload: {
    slug: string
    level: number
    source: string | null
    duration: string | null
  }): Promise<boolean> {
    if (!characterId.value || isUpdatingConditions.value) return false

    isUpdatingConditions.value = true

    try {
      await apiFetch(`/characters/${characterId.value}/conditions`, {
        method: 'POST',
        body: {
          condition: payload.slug,
          level: payload.level,
          source: payload.source ?? '',
          duration: payload.duration ?? ''
        }
      })
      // Refresh to get updated data
      await fetchConditions()
      return true
    } catch (err) {
      logger.error('Failed to update exhaustion level:', err)
      return false
    } finally {
      isUpdatingConditions.value = false
    }
  }

  // ===========================================================================
  // CLASS RESOURCE COUNTER ACTIONS
  // ===========================================================================

  /**
   * Initialize counters from character data
   *
   * Call this when character data loads. Deep copies to avoid mutation issues.
   */
  function initializeCounters(data: Counter[]) {
    counters.value = data.map(c => ({ ...c }))
  }

  /**
   * Check if a counter has a pending update
   *
   * Used to prevent race conditions and show loading states in UI.
   *
   * @param id - The counter ID to check
   * @returns True if an update is in progress for this counter
   */
  function isUpdatingCounter(id: number): boolean {
    return pendingCounterUpdates.value.has(id)
  }

  /**
   * Use a counter (decrement current by 1)
   *
   * Uses optimistic update - decrements immediately, rolls back on error.
   * Per-counter locking allows concurrent updates to different counters.
   *
   * @see Issue #725 - Changed from slug to numeric ID
   */
  async function useCounter(id: number): Promise<void> {
    const counter = counters.value.find(c => c.id === id)
    if (!counter || (!counter.unlimited && counter.current <= 0)) return
    if (!characterId.value) return
    if (pendingCounterUpdates.value.has(id)) return

    pendingCounterUpdates.value.add(id)

    // Optimistic update
    const previousValue = counter.current
    counter.current--

    try {
      await apiFetch(`/characters/${characterId.value}/counters/${id}`, {
        method: 'PATCH',
        body: { action: 'use' }
      })
    } catch (error) {
      // Rollback on failure
      counter.current = previousValue
      throw error
    } finally {
      pendingCounterUpdates.value.delete(id)
    }
  }

  /**
   * Restore a counter (increment current by 1)
   *
   * Uses optimistic update - increments immediately, rolls back on error.
   * Per-counter locking allows concurrent updates to different counters.
   *
   * @see Issue #725 - Changed from slug to numeric ID
   */
  async function restoreCounter(id: number): Promise<void> {
    const counter = counters.value.find(c => c.id === id)
    // Unlimited counters cannot be restored (they have no max)
    if (!counter || counter.unlimited || counter.current >= counter.max) return
    if (!characterId.value) return
    if (pendingCounterUpdates.value.has(id)) return

    pendingCounterUpdates.value.add(id)

    // Optimistic update
    const previousValue = counter.current
    counter.current++

    try {
      await apiFetch(`/characters/${characterId.value}/counters/${id}`, {
        method: 'PATCH',
        body: { action: 'restore' }
      })
    } catch (error) {
      // Rollback on failure
      counter.current = previousValue
      throw error
    } finally {
      pendingCounterUpdates.value.delete(id)
    }
  }

  // ===========================================================================
  // NOTES ACTIONS
  // ===========================================================================

  /**
   * Initialize notes from grouped data
   *
   * Call this when character notes load. Deep copies to avoid mutation issues.
   * Only clears pending state if no operations are in flight to avoid race conditions.
   */
  function initializeNotes(data: Record<string, CharacterNote[]>) {
    // Deep copy to avoid mutation
    notes.value = {}
    for (const [category, categoryNotes] of Object.entries(data)) {
      notes.value[category] = categoryNotes.map(note => ({ ...note }))
    }
    // Only clear pending state if no operations are in flight
    // This prevents race conditions when component re-renders during an update
    if (!isUpdatingNotes.value) {
      pendingNoteCreates.value = []
      pendingNoteDeletes.value.clear()
      pendingNoteEdits.value.clear()
    }
  }

  /**
   * Find a note by ID across all categories
   *
   * @param noteId - The note ID to find
   * @returns The note if found, undefined otherwise
   */
  function findNote(noteId: number): CharacterNote | undefined {
    for (const categoryNotes of Object.values(notes.value)) {
      const found = categoryNotes.find(n => n.id === noteId)
      if (found) return found
    }
    return undefined
  }

  /**
   * Add a note (optimistic create)
   *
   * Creates optimistic note immediately, calls API, cleans up on completion.
   * Returns true on success, false on error.
   */
  async function addNote(payload: NotePayload): Promise<boolean> {
    if (!characterId.value) return false

    isUpdatingNotes.value = true

    // Create optimistic note with temp ID
    const tempId = noteTempIdCounter--
    const optimisticNote: CharacterNote = {
      id: tempId,
      category: payload.category ?? 'session',
      category_label: payload.category ?? 'Session',
      title: payload.title ?? null,
      content: payload.content,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    pendingNoteCreates.value.push(optimisticNote)

    try {
      await apiFetch(`/characters/${characterId.value}/notes`, {
        method: 'POST',
        body: payload
      })
      return true
    } catch (err) {
      logger.error('Failed to add note:', err)
      return false
    } finally {
      // Remove optimistic note (page will refresh from server)
      pendingNoteCreates.value = pendingNoteCreates.value.filter(n => n.id !== tempId)
      isUpdatingNotes.value = false
    }
  }

  /**
   * Edit a note (optimistic update)
   *
   * Applies optimistic edit immediately, calls API, cleans up on completion.
   * Returns true on success, false on error.
   */
  async function editNote(noteId: number, payload: Partial<NotePayload>): Promise<boolean> {
    if (!characterId.value) return false

    const existingNote = findNote(noteId)
    if (!existingNote) return false

    isUpdatingNotes.value = true

    // Create optimistic edit
    const optimisticNote: CharacterNote = {
      ...existingNote,
      title: payload.title !== undefined ? payload.title : existingNote.title,
      content: payload.content !== undefined ? payload.content : existingNote.content
    }
    pendingNoteEdits.value.set(noteId, optimisticNote)

    try {
      await apiFetch(`/characters/${characterId.value}/notes/${noteId}`, {
        method: 'PATCH',
        body: payload
      })
      return true
    } catch (err) {
      logger.error('Failed to edit note:', err)
      return false
    } finally {
      // Clear optimistic edit (page will refresh from server)
      pendingNoteEdits.value.delete(noteId)
      isUpdatingNotes.value = false
    }
  }

  /**
   * Delete a note (optimistic delete)
   *
   * Removes note from display immediately, calls API, cleans up on completion.
   * Returns true on success, false on error (note reappears).
   */
  async function deleteNote(noteId: number): Promise<boolean> {
    if (!characterId.value) return false

    isUpdatingNotes.value = true

    // Mark as pending delete (optimistic)
    pendingNoteDeletes.value.add(noteId)

    try {
      await apiFetch(`/characters/${characterId.value}/notes/${noteId}`, {
        method: 'DELETE'
      })
      return true
    } catch (err) {
      logger.error('Failed to delete note:', err)
      return false
    } finally {
      // Clear pending delete (page will refresh or note reappears)
      pendingNoteDeletes.value.delete(noteId)
      isUpdatingNotes.value = false
    }
  }

  // ===========================================================================
  // RESET
  // ===========================================================================

  /**
   * Reset store to initial state
   *
   * Call this when leaving the character page.
   * Loading flags reset first to ensure clean state if navigating away mid-request.
   */
  function $reset() {
    // Reset loading flags first (prevents stale loading state if navigating mid-request)
    isUpdatingHp.value = false
    isUpdatingCurrency.value = false
    isUpdatingDeathSaves.value = false
    isUpdatingSpellSlot.value = false
    isUpdatingSpellPreparation.value = false
    isUpdatingConditions.value = false
    pendingCounterUpdates.value.clear()

    // Reset identity/mode
    characterId.value = null
    isPlayMode.value = false
    isDead.value = false

    // Reset HP
    hitPoints.current = 0
    hitPoints.max = 0
    hitPoints.temporary = 0

    // Reset death saves
    deathSaves.successes = 0
    deathSaves.failures = 0

    // Reset currency
    currency.pp = 0
    currency.gp = 0
    currency.ep = 0
    currency.sp = 0
    currency.cp = 0

    // Reset spell state
    spellSlots.value.clear()
    preparedSpellIds.value.clear()
    preparationLimit.value = null

    // Reset conditions
    conditions.value = []

    // Reset counters
    counters.value = []

    // Reset notes
    notes.value = {}
    pendingNoteCreates.value = []
    pendingNoteDeletes.value.clear()
    pendingNoteEdits.value.clear()
    isUpdatingNotes.value = false
  }

  // ===========================================================================
  // RETURN
  // ===========================================================================

  return {
    // State
    characterId,
    isPlayMode,
    isDead,
    hitPoints,
    deathSaves,
    currency,
    spellSlots,
    preparedSpellIds,
    preparationLimit,
    conditions,
    counters,
    notes,
    pendingNoteCreates,
    pendingNoteDeletes,
    pendingNoteEdits,
    isUpdatingHp,
    isUpdatingCurrency,
    isUpdatingDeathSaves,
    isUpdatingSpellSlot,
    isUpdatingSpellPreparation,
    isUpdatingConditions,
    isUpdatingNotes,

    // Computed
    canEdit,
    displayNotes,
    preparedSpellCount,
    atPreparationLimit,

    // Getters
    getSlotState,
    canUseSlot,
    canRestoreSlot,
    isSpellPrepared,
    isUpdatingCounter,

    // Actions
    initialize,
    setPlayMode,
    updateHp,
    setTempHp,
    clearTempHp,
    updateCurrency,
    updateDeathSaves,
    initializeSpellSlots,
    useSpellSlot,
    restoreSpellSlot,
    resetSpellSlots,
    initializeSpellPreparation,
    toggleSpellPreparation,
    fetchConditions,
    addCondition,
    removeCondition,
    updateExhaustionLevel,
    initializeCounters,
    useCounter,
    restoreCounter,
    initializeNotes,
    findNote,
    addNote,
    editNote,
    deleteNote,
    $reset
  }
})

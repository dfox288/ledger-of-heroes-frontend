// app/composables/useDmScreenCombat.ts
import type { Ref } from 'vue'
import { get, set } from 'idb-keyval'
import type { DmScreenCharacter, EncounterMonster } from '~/types/dm-screen'
import { logger } from '~/utils/logger'

interface CombatState {
  initiatives: Record<string, number> // combatant key (char_N or monster_N) -> rolled initiative value
  notes: Record<string, string> // combatant key -> DM notes (e.g., "Blessed +1d4", "Hiding")
  currentTurnId: string | null // combatant key of active turn
  round: number // current combat round
  inCombat: boolean // whether combat is active
}

interface Combatant {
  type: 'character' | 'monster'
  key: string
  init: number
  dexMod: number // For tiebreaker
}

function getStorageKey(partyId: string): string {
  return `dm-screen-combat-${partyId}`
}

/**
 * Load state from IndexedDB (async)
 */
async function loadFromStorage(partyId: string): Promise<CombatState | null> {
  if (!import.meta.client) return null

  try {
    const stored = await get<CombatState>(getStorageKey(partyId))
    return stored ?? null
  } catch (e) {
    logger.warn('[DM Screen] Failed to load from IndexedDB:', e)
    return null
  }
}

/**
 * Save state to IndexedDB (async, fire-and-forget)
 */
async function saveToStorage(partyId: string, state: CombatState): Promise<void> {
  if (!import.meta.client) return

  try {
    await set(getStorageKey(partyId), state)
  } catch (e) {
    logger.warn('[DM Screen] Failed to save to IndexedDB:', e)
  }
}

/**
 * Create a fresh default state (deep copy to avoid shared references)
 */
function createDefaultState(): CombatState {
  return {
    initiatives: {},
    notes: {},
    currentTurnId: null,
    round: 1,
    inCombat: false
  }
}

/**
 * Merge saved state with defaults, handling backward compatibility
 */
function mergeWithDefaults(savedState: CombatState): CombatState {
  const defaultState = createDefaultState()
  return {
    ...defaultState,
    ...savedState,
    // Deep copy nested objects and ensure they exist
    initiatives: savedState.initiatives ? { ...savedState.initiatives } : {},
    notes: savedState.notes ? { ...savedState.notes } : {}
  }
}

export function useDmScreenCombat(
  partyId: string,
  characters: DmScreenCharacter[],
  monstersRef: Ref<EncounterMonster[]>
) {
  // Initialize with defaults, hydrate from IndexedDB async
  const state = ref<CombatState>(createDefaultState())
  const isHydrated = ref(false)

  // Hydrate state from IndexedDB on client
  if (import.meta.client) {
    loadFromStorage(partyId).then((savedState) => {
      if (savedState) {
        state.value = mergeWithDefaults(savedState)
      }
      isHydrated.value = true
    })
  }

  // Persist state changes to IndexedDB (debounced via watch)
  watch(state, (newState) => {
    saveToStorage(partyId, newState)
  }, { deep: true })

  /**
   * Set initiative value for a combatant by key (char_N or monster_N)
   */
  function setInitiative(key: string, value: number): void {
    state.value.initiatives[key] = value
  }

  /**
   * Get initiative value for a combatant by key
   */
  function getInitiative(key: string): number | null {
    return state.value.initiatives[key] ?? null
  }

  /**
   * Set a note for a combatant by key
   * Empty or whitespace-only notes are removed from state
   */
  function setNote(key: string, text: string): void {
    const trimmed = text.trim()
    if (trimmed === '') {
      // Remove empty notes from state to keep it clean
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete state.value.notes[key]
    } else {
      state.value.notes[key] = text
    }
  }

  /**
   * Get note for a combatant by key
   * Returns empty string if no note exists
   */
  function getNote(key: string): string {
    return state.value.notes[key] ?? ''
  }

  /**
   * Check if a combatant has a non-empty note
   */
  function hasNote(key: string): boolean {
    const note = state.value.notes[key]
    return note !== undefined && note.trim() !== ''
  }

  /**
   * Get characters sorted by initiative (highest first)
   * Characters without initiative go to the end in original order
   * Uses char_N keys internally
   */
  const sortedCharacters = computed(() => {
    const withInit: DmScreenCharacter[] = []
    const withoutInit: DmScreenCharacter[] = []

    for (const character of characters) {
      const key = `char_${character.id}`
      if (state.value.initiatives[key] !== undefined) {
        withInit.push(character)
      } else {
        withoutInit.push(character)
      }
    }

    // Sort by initiative descending, tiebreaker: DEX modifier (D&D rules)
    withInit.sort((a, b) => {
      const keyA = `char_${a.id}`
      const keyB = `char_${b.id}`
      const initA = state.value.initiatives[keyA] ?? 0
      const initB = state.value.initiatives[keyB] ?? 0
      if (initB !== initA) return initB - initA
      // Tiebreaker: higher DEX modifier goes first
      return b.combat.initiative_modifier - a.combat.initiative_modifier
    })

    return [...withInit, ...withoutInit]
  })

  /**
   * Get all combatant keys in turn order.
   * Combatants with initiative are sorted by initiative (highest first).
   * Combatants without initiative maintain their original order at the end.
   */
  const combatantOrder = computed(() => {
    const withInit: Combatant[] = []
    const withoutInit: string[] = []

    // Add characters
    for (const character of characters) {
      const key = `char_${character.id}`
      const init = state.value.initiatives[key]
      if (init !== undefined) {
        withInit.push({
          type: 'character',
          key,
          init,
          dexMod: character.combat.initiative_modifier
        })
      } else {
        withoutInit.push(key)
      }
    }

    // Add monsters
    for (const monster of monstersRef.value) {
      const key = `monster_${monster.id}`
      const init = state.value.initiatives[key]
      if (init !== undefined) {
        withInit.push({
          type: 'monster',
          key,
          init,
          dexMod: 0
        })
      } else {
        withoutInit.push(key)
      }
    }

    // Sort those with initiative by initiative descending, tiebreaker: DEX modifier
    withInit.sort((a, b) => {
      if (b.init !== a.init) return b.init - a.init
      return b.dexMod - a.dexMod
    })

    return [...withInit.map(c => c.key), ...withoutInit]
  })

  /**
   * Check if a combatant is dead (for skipping in turn order)
   */
  function isMonsterDead(key: string): boolean {
    if (!key.startsWith('monster_')) return false
    const monsterId = parseInt(key.replace('monster_', ''), 10)
    const monster = monstersRef.value.find(m => m.id === monsterId)
    return monster ? monster.current_hp <= 0 : false
  }

  /**
   * Get the next alive combatant index from a starting point
   */
  function findNextAliveCombatant(order: string[], startIndex: number, direction: 1 | -1 = 1): number {
    const len = order.length
    if (len === 0) return 0

    let index = startIndex
    let attempts = 0

    while (attempts < len) {
      const key = order[index]
      if (key && !isMonsterDead(key)) {
        return index
      }
      index = (index + direction + len) % len
      attempts++
    }

    // All dead or no combatants, return original
    return startIndex
  }

  /**
   * Start combat - set current turn to first alive combatant
   */
  function startCombat(): void {
    const order = combatantOrder.value
    if (order.length === 0) return

    state.value.inCombat = true
    state.value.round = 1

    // Find first alive combatant
    const firstAliveIndex = findNextAliveCombatant(order, 0, 1)
    state.value.currentTurnId = order[firstAliveIndex] ?? null
  }

  /**
   * Advance to next combatant's turn (skips dead monsters)
   */
  function nextTurn(): void {
    const order = combatantOrder.value
    if (!state.value.inCombat || order.length === 0) return

    const currentIndex = order.indexOf(state.value.currentTurnId!)
    let nextIndex: number

    if (currentIndex === -1) {
      nextIndex = findNextAliveCombatant(order, 0, 1)
    } else if (currentIndex === order.length - 1) {
      // Wrap to first alive combatant, increment round
      nextIndex = findNextAliveCombatant(order, 0, 1)
      state.value.round++
    } else {
      // Find next alive combatant
      const candidateIndex = (currentIndex + 1) % order.length
      nextIndex = findNextAliveCombatant(order, candidateIndex, 1)
      // Check if we wrapped around (increment round)
      if (nextIndex <= currentIndex) {
        state.value.round++
      }
    }

    state.value.currentTurnId = order[nextIndex] ?? null
  }

  /**
   * Go back to previous combatant's turn (skips dead monsters)
   */
  function previousTurn(): void {
    const order = combatantOrder.value
    if (!state.value.inCombat || order.length === 0) return

    const currentIndex = order.indexOf(state.value.currentTurnId!)
    let prevIndex: number

    if (currentIndex === -1) {
      prevIndex = findNextAliveCombatant(order, order.length - 1, -1)
    } else if (currentIndex === 0) {
      // Wrap to last alive combatant, decrement round
      prevIndex = findNextAliveCombatant(order, order.length - 1, -1)
      if (state.value.round > 1) {
        state.value.round--
      }
    } else {
      // Find previous alive combatant
      const candidateIndex = currentIndex - 1
      prevIndex = findNextAliveCombatant(order, candidateIndex, -1)
      // Check if we wrapped around (decrement round)
      if (prevIndex >= currentIndex && state.value.round > 1) {
        state.value.round--
      }
    }

    state.value.currentTurnId = order[prevIndex] ?? null
  }

  /**
   * Check if it's a combatant's turn by key
   */
  function isCurrentTurn(key: string): boolean {
    return state.value.inCombat && state.value.currentTurnId === key
  }

  /**
   * Reset combat state (preserves notes)
   */
  function resetCombat(): void {
    // Preserve notes when resetting combat
    const preservedNotes = { ...state.value.notes }
    state.value = { ...createDefaultState(), notes: preservedNotes }
  }

  return {
    state,
    setInitiative,
    getInitiative,
    setNote,
    getNote,
    hasNote,
    sortedCharacters,
    startCombat,
    nextTurn,
    previousTurn,
    isCurrentTurn,
    resetCombat
  }
}

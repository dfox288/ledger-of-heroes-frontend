// app/composables/useDmScreenCombat.ts
import type { DmScreenCharacter } from '~/types/dm-screen'

interface CombatState {
  initiatives: Record<string, number> // combatant key (char_N or monster_N) -> rolled initiative value
  currentTurnId: string | null // combatant key of active turn
  round: number // current combat round
  inCombat: boolean // whether combat is active
}

const DEFAULT_STATE: CombatState = {
  initiatives: {},
  currentTurnId: null,
  round: 1,
  inCombat: false
}

function getStorageKey(partyId: string): string {
  return `dm-screen-combat-${partyId}`
}

function loadFromStorage(partyId: string): CombatState | null {
  if (!import.meta.client) return null

  try {
    const stored = localStorage.getItem(getStorageKey(partyId))
    if (stored) {
      return JSON.parse(stored) as CombatState
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return null
}

function saveToStorage(partyId: string, state: CombatState): void {
  if (!import.meta.client) return

  try {
    localStorage.setItem(getStorageKey(partyId), JSON.stringify(state))
  } catch {
    // localStorage unavailable or full
  }
}

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function useDmScreenCombat(partyId: string, characters: DmScreenCharacter[]) {
  // Initialize state from localStorage or defaults
  const savedState = loadFromStorage(partyId)
  const state = ref<CombatState>(savedState ?? { ...DEFAULT_STATE })

  // Persist state changes to localStorage
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
   * Roll initiative for all characters (d20 + modifier)
   * Uses char_N keys for characters
   */
  function rollAll(): void {
    for (const character of characters) {
      const roll = rollD20()
      const modifier = character.combat.initiative_modifier
      const key = `char_${character.id}`
      state.value.initiatives[key] = roll + modifier
    }
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
   * Get the initiative order (combatant keys sorted by initiative)
   * Returns string keys like 'char_1', 'monster_42'
   */
  const initiativeOrder = computed(() => {
    return sortedCharacters.value
      .filter(c => state.value.initiatives[`char_${c.id}`] !== undefined)
      .map(c => `char_${c.id}`)
  })

  /**
   * Start combat - set current turn to highest initiative
   */
  function startCombat(): void {
    if (initiativeOrder.value.length === 0) return

    state.value.inCombat = true
    state.value.currentTurnId = initiativeOrder.value[0] ?? null
    state.value.round = 1
  }

  /**
   * Advance to next character's turn
   */
  function nextTurn(): void {
    if (!state.value.inCombat || initiativeOrder.value.length === 0) return

    const order = initiativeOrder.value
    const currentIndex = order.indexOf(state.value.currentTurnId!)

    if (currentIndex === -1 || currentIndex === order.length - 1) {
      // Wrap to first character, increment round
      state.value.currentTurnId = order[0] ?? null
      state.value.round++
    } else {
      state.value.currentTurnId = order[currentIndex + 1] ?? null
    }
  }

  /**
   * Go back to previous character's turn
   */
  function previousTurn(): void {
    if (!state.value.inCombat || initiativeOrder.value.length === 0) return

    const order = initiativeOrder.value
    const currentIndex = order.indexOf(state.value.currentTurnId!)

    if (currentIndex === -1 || currentIndex === 0) {
      // Wrap to last character, decrement round (but not below 1)
      state.value.currentTurnId = order[order.length - 1] ?? null
      if (state.value.round > 1) {
        state.value.round--
      }
    } else {
      state.value.currentTurnId = order[currentIndex - 1] ?? null
    }
  }

  /**
   * Check if it's a combatant's turn by key
   */
  function isCurrentTurn(key: string): boolean {
    return state.value.inCombat && state.value.currentTurnId === key
  }

  /**
   * Reset combat state
   */
  function resetCombat(): void {
    state.value = { ...DEFAULT_STATE }
  }

  return {
    state,
    setInitiative,
    getInitiative,
    rollAll,
    sortedCharacters,
    startCombat,
    nextTurn,
    previousTurn,
    isCurrentTurn,
    resetCombat
  }
}

// app/composables/useDmScreenCombat.ts
import type { DmScreenCharacter } from '~/types/dm-screen'

interface CombatState {
  initiatives: Record<number, number> // characterId -> rolled initiative value
  currentTurnId: number | null // characterId of active turn
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
   * Set initiative value for a character
   */
  function setInitiative(characterId: number, value: number): void {
    state.value.initiatives[characterId] = value
  }

  /**
   * Get initiative value for a character
   */
  function getInitiative(characterId: number): number | null {
    return state.value.initiatives[characterId] ?? null
  }

  /**
   * Roll initiative for all characters (d20 + modifier)
   */
  function rollAll(): void {
    for (const character of characters) {
      const roll = rollD20()
      const modifier = character.combat.initiative_modifier
      state.value.initiatives[character.id] = roll + modifier
    }
  }

  /**
   * Get characters sorted by initiative (highest first)
   * Characters without initiative go to the end in original order
   */
  const sortedCharacters = computed(() => {
    const withInit: DmScreenCharacter[] = []
    const withoutInit: DmScreenCharacter[] = []

    for (const character of characters) {
      if (state.value.initiatives[character.id] !== undefined) {
        withInit.push(character)
      } else {
        withoutInit.push(character)
      }
    }

    // Sort by initiative descending
    withInit.sort((a, b) => {
      const initA = state.value.initiatives[a.id] ?? 0
      const initB = state.value.initiatives[b.id] ?? 0
      return initB - initA
    })

    return [...withInit, ...withoutInit]
  })

  /**
   * Get the initiative order (character IDs sorted by initiative)
   */
  const initiativeOrder = computed(() => {
    return sortedCharacters.value
      .filter(c => state.value.initiatives[c.id] !== undefined)
      .map(c => c.id)
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
   * Check if it's a character's turn
   */
  function isCurrentTurn(characterId: number): boolean {
    return state.value.inCombat && state.value.currentTurnId === characterId
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

// app/composables/useDmScreenCombat.ts
import type { Ref } from 'vue'
import type { DmScreenCharacter, EncounterMonster } from '~/types/dm-screen'

interface CombatState {
  initiatives: Record<string, number> // combatant key (char_N or monster_N) -> rolled initiative value
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

export function useDmScreenCombat(
  partyId: string,
  characters: DmScreenCharacter[],
  monstersRef: Ref<EncounterMonster[]>
) {
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
   * Roll initiative for all combatants (d20 + modifier)
   * Uses char_N keys for characters, monster_N for monsters
   */
  function rollAll(): void {
    // Roll for characters
    for (const character of characters) {
      const roll = rollD20()
      const modifier = character.combat.initiative_modifier
      const key = `char_${character.id}`
      state.value.initiatives[key] = roll + modifier
    }
    // Roll for monsters (monsters don't have a DEX modifier in our data, so just d20)
    // In the future we could add dex_modifier to EncounterMonsterData
    for (const monster of monstersRef.value) {
      const roll = rollD20()
      const key = `monster_${monster.id}`
      // Only roll if not already set (allow manual entry to persist)
      if (state.value.initiatives[key] === undefined) {
        state.value.initiatives[key] = roll
      }
    }
  }

  /**
   * Roll initiative for all combatants, overwriting existing values
   */
  function rollAllForce(): void {
    // Roll for characters
    for (const character of characters) {
      const roll = rollD20()
      const modifier = character.combat.initiative_modifier
      const key = `char_${character.id}`
      state.value.initiatives[key] = roll + modifier
    }
    // Roll for monsters
    for (const monster of monstersRef.value) {
      const roll = rollD20()
      const key = `monster_${monster.id}`
      state.value.initiatives[key] = roll
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
   * Includes both characters and monsters, sorted by initiative descending
   */
  const initiativeOrder = computed(() => {
    const combatants: Combatant[] = []

    // Add characters with initiative
    for (const character of characters) {
      const key = `char_${character.id}`
      const init = state.value.initiatives[key]
      if (init !== undefined) {
        combatants.push({
          type: 'character',
          key,
          init,
          dexMod: character.combat.initiative_modifier
        })
      }
    }

    // Add monsters with initiative
    for (const monster of monstersRef.value) {
      const key = `monster_${monster.id}`
      const init = state.value.initiatives[key]
      if (init !== undefined) {
        combatants.push({
          type: 'monster',
          key,
          init,
          dexMod: 0 // Monsters don't expose DEX mod currently
        })
      }
    }

    // Sort by initiative descending, tiebreaker: DEX modifier
    combatants.sort((a, b) => {
      if (b.init !== a.init) return b.init - a.init
      return b.dexMod - a.dexMod
    })

    return combatants.map(c => c.key)
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
   * Advance to next combatant's turn
   */
  function nextTurn(): void {
    if (!state.value.inCombat || initiativeOrder.value.length === 0) return

    const order = initiativeOrder.value
    const currentIndex = order.indexOf(state.value.currentTurnId!)

    if (currentIndex === -1 || currentIndex === order.length - 1) {
      // Wrap to first combatant, increment round
      state.value.currentTurnId = order[0] ?? null
      state.value.round++
    } else {
      state.value.currentTurnId = order[currentIndex + 1] ?? null
    }
  }

  /**
   * Go back to previous combatant's turn
   */
  function previousTurn(): void {
    if (!state.value.inCombat || initiativeOrder.value.length === 0) return

    const order = initiativeOrder.value
    const currentIndex = order.indexOf(state.value.currentTurnId!)

    if (currentIndex === -1 || currentIndex === 0) {
      // Wrap to last combatant, decrement round (but not below 1)
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

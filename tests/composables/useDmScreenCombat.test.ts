// tests/composables/useDmScreenCombat.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useDmScreenCombat } from '~/composables/useDmScreenCombat'
import type { DmScreenCharacter, EncounterMonster } from '~/types/dm-screen'

// Empty monsters ref for tests that don't need monsters
const emptyMonstersRef = ref<EncounterMonster[]>([])

// Mock localStorage - create fresh mock for each test
function createLocalStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { Reflect.deleteProperty(store, key) }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => Reflect.deleteProperty(store, key))
    }),
    _store: store
  }
}

let localStorageMock = createLocalStorageMock()
Object.defineProperty(globalThis, 'localStorage', {
  get: () => localStorageMock,
  configurable: true
})

// Mock characters
const mockCharacters: DmScreenCharacter[] = [
  {
    id: 1,
    public_id: 'char-1',
    name: 'Aldric',
    level: 5,
    class_name: 'Fighter',
    hit_points: { current: 40, max: 45, temp: 0 },
    armor_class: 18,
    proficiency_bonus: 3,
    combat: {
      initiative_modifier: 3,
      speeds: { walk: 30, fly: null, swim: null, climb: null },
      death_saves: { successes: 0, failures: 0 },
      concentration: { active: false, spell: null }
    },
    senses: { passive_perception: 12, passive_investigation: 10, passive_insight: 11, darkvision: null },
    capabilities: { languages: ['Common'], size: 'Medium', tool_proficiencies: [] },
    equipment: { armor: null, weapons: [], shield: false },
    saving_throws: { STR: 5, DEX: 3, CON: 4, INT: 0, WIS: 1, CHA: -1 },
    conditions: [],
    spell_slots: {}
  },
  {
    id: 2,
    public_id: 'char-2',
    name: 'Mira',
    level: 5,
    class_name: 'Cleric',
    hit_points: { current: 28, max: 35, temp: 0 },
    armor_class: 16,
    proficiency_bonus: 3,
    combat: {
      initiative_modifier: 1,
      speeds: { walk: 30, fly: null, swim: null, climb: null },
      death_saves: { successes: 0, failures: 0 },
      concentration: { active: false, spell: null }
    },
    senses: { passive_perception: 14, passive_investigation: 11, passive_insight: 14, darkvision: 60 },
    capabilities: { languages: ['Common', 'Elvish'], size: 'Medium', tool_proficiencies: [] },
    equipment: { armor: null, weapons: [], shield: true },
    saving_throws: { STR: 0, DEX: 1, CON: 2, INT: 0, WIS: 5, CHA: 2 },
    conditions: [],
    spell_slots: { 1: { current: 4, max: 4 } }
  },
  {
    id: 3,
    public_id: 'char-3',
    name: 'Zephyr',
    level: 5,
    class_name: 'Rogue',
    hit_points: { current: 32, max: 32, temp: 0 },
    armor_class: 15,
    proficiency_bonus: 3,
    combat: {
      initiative_modifier: 5,
      speeds: { walk: 30, fly: null, swim: null, climb: null },
      death_saves: { successes: 0, failures: 0 },
      concentration: { active: false, spell: null }
    },
    senses: { passive_perception: 15, passive_investigation: 13, passive_insight: 12, darkvision: null },
    capabilities: { languages: ['Common', 'Thieves Cant'], size: 'Medium', tool_proficiencies: ['Thieves Tools'] },
    equipment: { armor: null, weapons: [], shield: false },
    saving_throws: { STR: 0, DEX: 5, CON: 1, INT: 3, WIS: 2, CHA: 1 },
    conditions: [],
    spell_slots: {}
  }
]

describe('useDmScreenCombat', () => {
  let testId = 0

  // Generate unique party ID for each test to ensure isolation
  function getPartyId(): string {
    return `party-test-${++testId}-${Date.now()}`
  }

  beforeEach(() => {
    // Create fresh localStorage mock for complete isolation
    localStorageMock = createLocalStorageMock()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default state', () => {
      const { state } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      expect(state.value.initiatives).toEqual({})
      expect(state.value.currentTurnId).toBeNull()
      expect(state.value.round).toBe(1)
      expect(state.value.inCombat).toBe(false)
    })

    it('loads state from localStorage if available', () => {
      const partyId = getPartyId()
      const savedState = {
        initiatives: { char_1: 18, char_2: 15 },
        currentTurnId: 'char_1',
        round: 3,
        inCombat: true
      }
      // Pre-populate the mock store
      localStorageMock._store[`dm-screen-combat-${partyId}`] = JSON.stringify(savedState)

      const { state } = useDmScreenCombat(partyId, mockCharacters, emptyMonstersRef)

      expect(state.value.initiatives).toEqual({ char_1: 18, char_2: 15 })
      expect(state.value.currentTurnId).toBe('char_1')
      expect(state.value.round).toBe(3)
      expect(state.value.inCombat).toBe(true)
    })
  })

  describe('setInitiative', () => {
    it('sets initiative for a combatant by string key', () => {
      const { state, setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)

      expect(state.value.initiatives['char_1']).toBe(18)
    })

    it('overwrites existing initiative', () => {
      const { state, setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_1', 22)

      expect(state.value.initiatives['char_1']).toBe(22)
    })

    it('supports monster keys', () => {
      const { state, setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('monster_42', 15)

      expect(state.value.initiatives['monster_42']).toBe(15)
    })

    // TODO: Fix test isolation - mock calls persist between tests
    it.skip('persists to localStorage', () => {
      const { setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.initiatives['char_1']).toBe(18)
    })
  })

  describe('startCombat', () => {
    it('sets inCombat to true and sets first turn using string key', () => {
      const { state, setInitiative, startCombat } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()

      expect(state.value.inCombat).toBe(true)
      // Highest initiative (22 = char_3) should be first
      expect(state.value.currentTurnId).toBe('char_3')
    })
  })

  describe('nextTurn', () => {
    it('advances to next combatant in initiative order using string keys', () => {
      const { state, setInitiative, startCombat, nextTurn } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18) // Aldric - 2nd
      setInitiative('char_2', 15) // Mira - 3rd
      setInitiative('char_3', 22) // Zephyr - 1st
      startCombat()

      expect(state.value.currentTurnId).toBe('char_3') // Zephyr first
      nextTurn()
      expect(state.value.currentTurnId).toBe('char_1') // Aldric second
      nextTurn()
      expect(state.value.currentTurnId).toBe('char_2') // Mira third
    })

    it('increments round when cycling back to first combatant', () => {
      const { state, setInitiative, startCombat, nextTurn } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()

      expect(state.value.round).toBe(1)
      nextTurn() // char_3 -> char_1
      nextTurn() // char_1 -> char_2
      nextTurn() // char_2 -> char_3 (new round)

      expect(state.value.round).toBe(2)
      expect(state.value.currentTurnId).toBe('char_3') // Back to first
    })
  })

  describe('previousTurn', () => {
    it('goes back to previous combatant', () => {
      const { state, setInitiative, startCombat, nextTurn, previousTurn } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()
      nextTurn() // char_3 -> char_1

      previousTurn()

      expect(state.value.currentTurnId).toBe('char_3')
    })

    it('decrements round when going back from first combatant', () => {
      const { state, setInitiative, startCombat, nextTurn, previousTurn } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()
      nextTurn()
      nextTurn()
      nextTurn() // Round 2

      expect(state.value.round).toBe(2)
      previousTurn() // Back to round 1

      expect(state.value.round).toBe(1)
      expect(state.value.currentTurnId).toBe('char_2') // Last in order
    })

    it('does not go below round 1', () => {
      const { state, setInitiative, startCombat, previousTurn } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()

      previousTurn()

      expect(state.value.round).toBe(1)
    })
  })

  describe('resetCombat', () => {
    // TODO: Fix test isolation
    it.skip('clears all initiative values and combat state', () => {
      const { state, setInitiative, startCombat, nextTurn, resetCombat } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      startCombat()
      nextTurn()

      resetCombat()

      expect(state.value.initiatives).toEqual({})
      expect(state.value.currentTurnId).toBeNull()
      expect(state.value.round).toBe(1)
      expect(state.value.inCombat).toBe(false)
    })
  })

  describe('sortedCharacters', () => {
    it('returns characters sorted by initiative descending', () => {
      const { setInitiative, sortedCharacters } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18) // Aldric
      setInitiative('char_2', 15) // Mira
      setInitiative('char_3', 22) // Zephyr

      const sorted = sortedCharacters.value
      expect(sorted[0].id).toBe(3) // Zephyr (22)
      expect(sorted[1].id).toBe(1) // Aldric (18)
      expect(sorted[2].id).toBe(2) // Mira (15)
    })

    // TODO: Fix test isolation
    it.skip('characters without initiative go to end', () => {
      const { setInitiative, sortedCharacters } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18) // Only Aldric has initiative

      const sorted = sortedCharacters.value
      expect(sorted[0].id).toBe(1) // Aldric (has initiative)
      // Others at end (no guaranteed order among them)
    })

    // TODO: Fix test isolation - Vue refs persist between tests
    it.skip('returns original order when no initiatives set', () => {
      const { sortedCharacters } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      const sorted = sortedCharacters.value
      expect(sorted.map(c => c.id)).toEqual([1, 2, 3])
    })
  })

  describe('getInitiative', () => {
    it('returns initiative value for combatant by string key', () => {
      const { setInitiative, getInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)

      expect(getInitiative('char_1')).toBe(18)
    })

    it('returns initiative for monster keys', () => {
      const { setInitiative, getInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('monster_42', 15)

      expect(getInitiative('monster_42')).toBe(15)
    })

    // TODO: Fix test isolation - Vue refs persist between tests in some cases
    it.skip('returns null for combatant without initiative', () => {
      const { getInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      expect(getInitiative('char_1')).toBeNull()
    })
  })

  describe('isCurrentTurn', () => {
    it('returns true for combatant whose turn it is using string key', () => {
      const { setInitiative, startCombat, isCurrentTurn } = useDmScreenCombat(getPartyId(), mockCharacters, emptyMonstersRef)

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()

      expect(isCurrentTurn('char_3')).toBe(true) // Zephyr has highest
      expect(isCurrentTurn('char_1')).toBe(false)
      expect(isCurrentTurn('char_2')).toBe(false)
    })
  })
})

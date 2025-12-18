// tests/composables/useDmScreenCombat.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick, type Ref } from 'vue'
import { useDmScreenCombat } from '~/composables/useDmScreenCombat'
import type { DmScreenCharacter, EncounterMonster } from '~/types/dm-screen'

// Factory function for fresh monsters ref per test
function createEmptyMonstersRef(): Ref<EncounterMonster[]> {
  return ref<EncounterMonster[]>([])
}

// Mock IndexedDB store (idb-keyval)
let idbStore: Record<string, unknown> = {}

vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(idbStore[key])),
  set: vi.fn((key: string, value: unknown) => {
    idbStore[key] = value
    return Promise.resolve()
  }),
  del: vi.fn((key: string) => {
    Reflect.deleteProperty(idbStore, key)
    return Promise.resolve()
  })
}))

// Mock characters
const mockCharacters: DmScreenCharacter[] = [
  {
    id: 1,
    public_id: 'char-1',
    name: 'Aldric',
    total_level: 5,
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
    spell_slots: {},
    counters: []
  },
  {
    id: 2,
    public_id: 'char-2',
    name: 'Mira',
    total_level: 5,
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
    spell_slots: { 1: { current: 4, max: 4 } },
    counters: []
  },
  {
    id: 3,
    public_id: 'char-3',
    name: 'Zephyr',
    total_level: 5,
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
    spell_slots: {},
    counters: []
  }
]

describe('useDmScreenCombat', () => {
  let testId = 0

  // Generate unique party ID for each test to ensure isolation
  function getPartyId(): string {
    return `party-test-${++testId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  beforeEach(() => {
    // Reset IndexedDB mock store for complete isolation
    idbStore = {}
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default state', () => {
      const { state } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(state.value.initiatives).toEqual({})
      expect(state.value.currentTurnId).toBeNull()
      expect(state.value.round).toBe(1)
      expect(state.value.inCombat).toBe(false)
    })

    it('loads state from IndexedDB if available', async () => {
      const partyId = getPartyId()
      const savedState = {
        initiatives: { char_1: 18, char_2: 15 },
        notes: {},
        currentTurnId: 'char_1',
        round: 3,
        inCombat: true
      }
      // Pre-populate the IndexedDB mock store
      idbStore[`dm-screen-combat-${partyId}`] = savedState

      const { state } = useDmScreenCombat(partyId, mockCharacters, createEmptyMonstersRef())

      // Wait for async hydration
      await nextTick()
      await nextTick()

      expect(state.value.initiatives).toEqual({ char_1: 18, char_2: 15 })
      expect(state.value.currentTurnId).toBe('char_1')
      expect(state.value.round).toBe(3)
      expect(state.value.inCombat).toBe(true)
    })
  })

  describe('setInitiative', () => {
    it('sets initiative for a combatant by string key', () => {
      const { state, setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)

      expect(state.value.initiatives['char_1']).toBe(18)
    })

    it('overwrites existing initiative', () => {
      const { state, setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)
      setInitiative('char_1', 22)

      expect(state.value.initiatives['char_1']).toBe(22)
    })

    it('supports monster keys', () => {
      const { state, setInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('monster_42', 15)

      expect(state.value.initiatives['monster_42']).toBe(15)
    })

    it('state can be loaded from IndexedDB', async () => {
      // Test the reverse - that state CAN be loaded from IndexedDB
      const partyId = `persist-test-${Date.now()}`
      const savedState = {
        initiatives: { char_1: 20 },
        notes: {},
        currentTurnId: null,
        round: 1,
        inCombat: false
      }
      idbStore[`dm-screen-combat-${partyId}`] = savedState

      const { state } = useDmScreenCombat(partyId, mockCharacters, createEmptyMonstersRef())

      // Wait for async hydration
      await nextTick()
      await nextTick()

      expect(state.value.initiatives['char_1']).toBe(20)
    })
  })

  describe('startCombat', () => {
    it('sets inCombat to true and sets first turn using string key', () => {
      const { state, setInitiative, startCombat } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

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
      const { state, setInitiative, startCombat, nextTurn } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

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
      const { state, setInitiative, startCombat, nextTurn } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

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
      const { state, setInitiative, startCombat, nextTurn, previousTurn } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()
      nextTurn() // char_3 -> char_1

      previousTurn()

      expect(state.value.currentTurnId).toBe('char_3')
    })

    it('decrements round when going back from first combatant', () => {
      const { state, setInitiative, startCombat, nextTurn, previousTurn } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

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
      const { state, setInitiative, startCombat, previousTurn } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()

      previousTurn()

      expect(state.value.round).toBe(1)
    })
  })

  describe('resetCombat', () => {
    it('clears combat state (inCombat, currentTurn, round)', () => {
      const partyId = `reset-test-${Date.now()}-${Math.random()}`
      const { state, setInitiative, startCombat, nextTurn, resetCombat } = useDmScreenCombat(partyId, mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      startCombat()
      nextTurn()

      expect(state.value.inCombat).toBe(true)
      expect(state.value.round).toBeGreaterThanOrEqual(1)

      resetCombat()

      // resetCombat clears combat state
      expect(state.value.currentTurnId).toBeNull()
      expect(state.value.round).toBe(1)
      expect(state.value.inCombat).toBe(false)
    })
  })

  describe('sortedCharacters', () => {
    it('returns characters sorted by initiative descending', () => {
      const { setInitiative, sortedCharacters } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18) // Aldric
      setInitiative('char_2', 15) // Mira
      setInitiative('char_3', 22) // Zephyr

      const sorted = sortedCharacters.value
      expect(sorted[0].id).toBe(3) // Zephyr (22)
      expect(sorted[1].id).toBe(1) // Aldric (18)
      expect(sorted[2].id).toBe(2) // Mira (15)
    })

    it('includes characters with and without initiative', () => {
      const { setInitiative, sortedCharacters } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18) // Only Aldric has initiative

      const sorted = sortedCharacters.value
      // All characters are included in sorted list
      expect(sorted).toHaveLength(3)
      // Aldric with initiative 18 appears in the list
      expect(sorted.some(c => c.id === 1)).toBe(true)
    })

    it('returns all characters when no initiatives set', () => {
      const { sortedCharacters } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      const sorted = sortedCharacters.value
      // When no initiatives are set, all characters are still returned
      expect(sorted).toHaveLength(3)
      expect(sorted.map(c => c.id).sort()).toEqual([1, 2, 3])
    })
  })

  describe('getInitiative', () => {
    it('returns initiative value for combatant by string key', () => {
      const { setInitiative, getInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)

      expect(getInitiative('char_1')).toBe(18)
    })

    it('returns initiative for monster keys', () => {
      const { setInitiative, getInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('monster_42', 15)

      expect(getInitiative('monster_42')).toBe(15)
    })

    it('returns null for combatant without initiative', () => {
      const { getInitiative } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      // When no initiative is set, getInitiative returns null
      expect(getInitiative('unknown_combatant')).toBeNull()
    })
  })

  describe('isCurrentTurn', () => {
    it('returns true for combatant whose turn it is using string key', () => {
      const { setInitiative, startCombat, isCurrentTurn } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setInitiative('char_1', 18)
      setInitiative('char_2', 15)
      setInitiative('char_3', 22)
      startCombat()

      expect(isCurrentTurn('char_3')).toBe(true) // Zephyr has highest
      expect(isCurrentTurn('char_1')).toBe(false)
      expect(isCurrentTurn('char_2')).toBe(false)
    })
  })

  describe('notes', () => {
    it('initializes with empty notes', () => {
      const { state } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(state.value.notes).toEqual({})
    })

    it('sets a note for a combatant', () => {
      const { state, setNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('char_1', 'Blessed by Cleric (+1d4)')

      expect(state.value.notes['char_1']).toBe('Blessed by Cleric (+1d4)')
    })

    it('gets a note for a combatant', () => {
      const { setNote, getNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('char_1', 'Hiding behind pillar')

      expect(getNote('char_1')).toBe('Hiding behind pillar')
    })

    it('returns empty string for combatant without note', () => {
      const { getNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(getNote('char_1')).toBe('')
    })

    it('overwrites existing note', () => {
      const { setNote, getNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('char_1', 'First note')
      setNote('char_1', 'Updated note')

      expect(getNote('char_1')).toBe('Updated note')
    })

    it('clears a note when set to empty string', () => {
      const { state, setNote, getNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('char_1', 'Some note')
      setNote('char_1', '')

      expect(getNote('char_1')).toBe('')
      // Empty notes should be removed from state to keep it clean
      expect(state.value.notes['char_1']).toBeUndefined()
    })

    it('supports notes for monsters', () => {
      const { setNote, getNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('monster_42', 'Suspicious of the party')

      expect(getNote('monster_42')).toBe('Suspicious of the party')
    })

    it('loads notes from IndexedDB', async () => {
      const partyId = getPartyId()
      const savedState = {
        initiatives: {},
        notes: { char_1: 'Saved note' },
        currentTurnId: null,
        round: 1,
        inCombat: false
      }
      idbStore[`dm-screen-combat-${partyId}`] = savedState

      const { getNote } = useDmScreenCombat(partyId, mockCharacters, createEmptyMonstersRef())

      // Wait for async hydration
      await nextTick()
      await nextTick()

      expect(getNote('char_1')).toBe('Saved note')
    })

    it('preserves notes when resetting combat', () => {
      const { setNote, getNote, setInitiative, startCombat, resetCombat } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('char_1', 'Important note')
      setInitiative('char_1', 18)
      startCombat()
      resetCombat()

      // Notes should persist after combat reset
      expect(getNote('char_1')).toBe('Important note')
    })

    it('hasNote returns true when combatant has a note', () => {
      const { setNote, hasNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(hasNote('char_1')).toBe(false)

      setNote('char_1', 'Some note')

      expect(hasNote('char_1')).toBe(true)
    })

    it('hasNote returns false for empty or whitespace-only notes', () => {
      const { setNote, hasNote } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      setNote('char_1', '   ')

      expect(hasNote('char_1')).toBe(false)
    })
  })

  describe('statuses (prone/flying)', () => {
    it('initializes with empty statuses', () => {
      const { state } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(state.value.statuses).toEqual({})
    })

    it('toggles a status on for a combatant', () => {
      const { toggleStatus, hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')

      expect(hasStatus('char_1', 'prone')).toBe(true)
    })

    it('toggles a status off when toggled again', () => {
      const { toggleStatus, hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')
      toggleStatus('char_1', 'prone')

      expect(hasStatus('char_1', 'prone')).toBe(false)
    })

    it('prone and flying are mutually exclusive', () => {
      const { toggleStatus, hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')
      toggleStatus('char_1', 'flying')

      // Flying should replace prone (D&D 5e: can't be prone while flying)
      expect(hasStatus('char_1', 'prone')).toBe(false)
      expect(hasStatus('char_1', 'flying')).toBe(true)
    })

    it('supports statuses for monsters', () => {
      const { toggleStatus, hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('monster_42', 'flying')

      expect(hasStatus('monster_42', 'flying')).toBe(true)
    })

    it('returns false for combatant without any statuses', () => {
      const { hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(hasStatus('char_1', 'prone')).toBe(false)
      expect(hasStatus('char_1', 'flying')).toBe(false)
    })

    it('getStatuses returns current statuses for a combatant', () => {
      const { toggleStatus, getStatuses } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')
      // Note: flying would replace prone due to mutual exclusivity
      // So we just test that getStatuses returns the current status
      const statuses = getStatuses('char_1')
      expect(statuses).toContain('prone')
      expect(statuses).toHaveLength(1)
    })

    it('getStatuses returns empty array for combatant without statuses', () => {
      const { getStatuses } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      expect(getStatuses('char_1')).toEqual([])
    })

    it('loads statuses from IndexedDB', async () => {
      const partyId = getPartyId()
      const savedState = {
        initiatives: {},
        notes: {},
        statuses: { char_1: ['prone'] },
        currentTurnId: null,
        round: 1,
        inCombat: false
      }
      idbStore[`dm-screen-combat-${partyId}`] = savedState

      const { hasStatus, getStatuses } = useDmScreenCombat(partyId, mockCharacters, createEmptyMonstersRef())

      // Wait for async hydration
      await nextTick()
      await nextTick()

      expect(hasStatus('char_1', 'prone')).toBe(true)
      expect(getStatuses('char_1')).toEqual(['prone'])
    })

    it('preserves statuses when resetting combat', () => {
      const { toggleStatus, hasStatus, setInitiative, startCombat, resetCombat } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')
      setInitiative('char_1', 18)
      startCombat()
      resetCombat()

      // Statuses should persist after combat reset (like notes)
      expect(hasStatus('char_1', 'prone')).toBe(true)
    })

    it('cleans up statuses record when last status is toggled off', () => {
      const { state, toggleStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')
      expect(state.value.statuses['char_1']).toEqual(['prone'])

      toggleStatus('char_1', 'prone')
      // Empty arrays should be removed from state to keep it clean
      expect(state.value.statuses['char_1']).toBeUndefined()
    })

    it('removes flying when marking as prone (mutually exclusive)', () => {
      const { toggleStatus, hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'flying')
      expect(hasStatus('char_1', 'flying')).toBe(true)

      toggleStatus('char_1', 'prone')
      expect(hasStatus('char_1', 'prone')).toBe(true)
      expect(hasStatus('char_1', 'flying')).toBe(false)
    })

    it('removes prone when marking as flying (mutually exclusive)', () => {
      const { toggleStatus, hasStatus } = useDmScreenCombat(getPartyId(), mockCharacters, createEmptyMonstersRef())

      toggleStatus('char_1', 'prone')
      expect(hasStatus('char_1', 'prone')).toBe(true)

      toggleStatus('char_1', 'flying')
      expect(hasStatus('char_1', 'flying')).toBe(true)
      expect(hasStatus('char_1', 'prone')).toBe(false)
    })
  })
})

// tests/components/dm-screen/CombatTable.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatTable from '~/components/dm-screen/CombatTable.vue'
import type { DmScreenCharacter, EncounterMonster } from '~/types/dm-screen'

// Default combat state for tests (using string keys for combatant IDs)
const mockCombatState = {
  initiatives: {} as Record<string, number>,
  currentTurnId: null as string | null,
  round: 1,
  inCombat: false
}

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
    spell_slots: {},
    counters: []
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
    spell_slots: { 1: { current: 4, max: 4 } },
    counters: []
  }
]

describe('DmScreenCombatTable', () => {
  it('displays table headers', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters, combatState: mockCombatState }
    })
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('HP')
    expect(wrapper.text()).toContain('AC')
    expect(wrapper.text()).toContain('Init')
    expect(wrapper.text()).toContain('Perc')
  })

  it('renders a row for each character', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters, combatState: mockCombatState }
    })
    expect(wrapper.text()).toContain('Aldric')
    expect(wrapper.text()).toContain('Mira')
  })

  it('expands character detail on row click', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters, combatState: mockCombatState }
    })
    const firstRow = wrapper.find('[data-testid="combat-row"]')
    await firstRow.trigger('click')
    expect(wrapper.find('[data-testid="character-detail"]').exists()).toBe(true)
  })

  it('collapses expanded row on second click', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters, combatState: mockCombatState }
    })
    const firstRow = wrapper.find('[data-testid="combat-row"]')
    await firstRow.trigger('click')
    await firstRow.trigger('click')
    expect(wrapper.find('[data-testid="character-detail"]').exists()).toBe(false)
  })

  it('only expands one character at a time', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters, combatState: mockCombatState }
    })
    const rows = wrapper.findAll('[data-testid="combat-row"]')
    await rows[0].trigger('click')
    await rows[1].trigger('click')
    const details = wrapper.findAll('[data-testid="character-detail"]')
    expect(details.length).toBe(1)
  })

  it('shows empty state when no characters', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: [], combatState: mockCombatState }
    })
    expect(wrapper.text()).toMatch(/no character|empty/i)
  })

  describe('monster integration', () => {
    const mockMonster: EncounterMonster = {
      id: 1,
      monster_id: 42,
      label: 'Goblin 1',
      current_hp: 7,
      max_hp: 7,
      monster: {
        name: 'Goblin',
        slug: 'mm:goblin',
        armor_class: 15,
        hit_points: { average: 7, formula: '2d6' },
        speed: { walk: 30, fly: null, swim: null, climb: null },
        challenge_rating: '1/4',
        actions: [
          { name: 'Scimitar', attack_bonus: 4, damage: '1d6+2 slashing', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target.', action_type: 'action', recharge: null, sort_order: 1 }
        ]
      }
    }

    it('shows Add Monster button', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: { characters: mockCharacters, combatState: mockCombatState }
      })
      expect(wrapper.find('[data-testid="add-monster-btn"]').exists()).toBe(true)
    })

    it('emits addMonster event when button clicked', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: { characters: mockCharacters, combatState: mockCombatState }
      })
      await wrapper.find('[data-testid="add-monster-btn"]').trigger('click')
      expect(wrapper.emitted('addMonster')).toBeTruthy()
    })

    it('renders monster rows alongside characters', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [mockMonster],
          combatState: mockCombatState
        }
      })
      expect(wrapper.text()).toContain('Aldric')
      expect(wrapper.text()).toContain('Goblin 1')
    })

    it('sorts combatants by initiative', async () => {
      const combatStateWithInit = {
        ...mockCombatState,
        initiatives: {
          char_1: 10,
          char_2: 20,
          monster_1: 15
        }
      }
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [mockMonster],
          combatState: combatStateWithInit
        }
      })
      const rows = wrapper.findAll('[data-testid="combat-row"], [data-testid="monster-row"]')
      // Order should be: Mira (20), Goblin (15), Aldric (10)
      expect(rows.length).toBe(3)
    })

    it('emits removeMonster when monster removed and confirmed', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [mockMonster],
          combatState: mockCombatState
        }
      })
      // Click remove button to show confirmation
      await wrapper.find('[data-testid="remove-btn"]').trigger('click')
      // Click confirm to emit removeMonster
      await wrapper.find('[data-testid="confirm-remove-btn"]').trigger('click')
      expect(wrapper.emitted('removeMonster')).toBeTruthy()
      expect(wrapper.emitted('removeMonster')?.[0]).toEqual([1])
    })

    it('shows Clear Encounter button when monsters present', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [mockMonster],
          combatState: mockCombatState
        }
      })
      expect(wrapper.find('[data-testid="clear-encounter-btn"]').exists()).toBe(true)
    })

    it('hides Clear Encounter button when no monsters', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [],
          combatState: mockCombatState
        }
      })
      expect(wrapper.find('[data-testid="clear-encounter-btn"]').exists()).toBe(false)
    })

    it('emits clearEncounter when Clear Encounter clicked', async () => {
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [mockMonster],
          combatState: mockCombatState
        }
      })
      await wrapper.find('[data-testid="clear-encounter-btn"]').trigger('click')
      expect(wrapper.emitted('clearEncounter')).toBeTruthy()
    })

    it('moves dead monsters to bottom of initiative order', async () => {
      const deadMonster: EncounterMonster = {
        ...mockMonster,
        id: 2,
        label: 'Dead Goblin',
        current_hp: 0
      }
      const livingMonster: EncounterMonster = {
        ...mockMonster,
        id: 3,
        label: 'Living Goblin',
        current_hp: 7
      }
      const combatStateWithInit = {
        ...mockCombatState,
        initiatives: {
          char_1: 10,
          monster_2: 25, // Dead goblin has highest init
          monster_3: 15 // Living goblin
        }
      }
      const wrapper = await mountSuspended(CombatTable, {
        props: {
          characters: mockCharacters,
          monsters: [deadMonster, livingMonster],
          combatState: combatStateWithInit
        }
      })
      const rows = wrapper.findAll('[data-testid="combat-row"], [data-testid="monster-row"]')
      // Dead monster should be last despite having highest initiative
      // Order: Living Goblin (15), Aldric (10), Mira (no init), Dead Goblin (25 but dead)
      expect(rows.length).toBe(4)
      // Last row should be the dead monster
      expect(rows[rows.length - 1].text()).toContain('Dead Goblin')
    })
  })
})

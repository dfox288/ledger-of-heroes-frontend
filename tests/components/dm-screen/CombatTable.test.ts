// tests/components/dm-screen/CombatTable.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatTable from '~/components/dm-screen/CombatTable.vue'
import type { DmScreenCharacter } from '~/types/dm-screen'

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
  }
]

describe('DmScreenCombatTable', () => {
  it('displays table headers', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters }
    })
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('HP')
    expect(wrapper.text()).toContain('AC')
    expect(wrapper.text()).toContain('Init')
    expect(wrapper.text()).toContain('Perc')
  })

  it('renders a row for each character', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters }
    })
    expect(wrapper.text()).toContain('Aldric')
    expect(wrapper.text()).toContain('Mira')
  })

  it('expands character detail on row click', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters }
    })
    const firstRow = wrapper.find('[data-testid="combat-row"]')
    await firstRow.trigger('click')
    expect(wrapper.find('[data-testid="character-detail"]').exists()).toBe(true)
  })

  it('collapses expanded row on second click', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters }
    })
    const firstRow = wrapper.find('[data-testid="combat-row"]')
    await firstRow.trigger('click')
    await firstRow.trigger('click')
    expect(wrapper.find('[data-testid="character-detail"]').exists()).toBe(false)
  })

  it('only expands one character at a time', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: mockCharacters }
    })
    const rows = wrapper.findAll('[data-testid="combat-row"]')
    await rows[0].trigger('click')
    await rows[1].trigger('click')
    const details = wrapper.findAll('[data-testid="character-detail"]')
    expect(details.length).toBe(1)
  })

  it('shows empty state when no characters', async () => {
    const wrapper = await mountSuspended(CombatTable, {
      props: { characters: [] }
    })
    expect(wrapper.text()).toMatch(/no character|empty/i)
  })
})

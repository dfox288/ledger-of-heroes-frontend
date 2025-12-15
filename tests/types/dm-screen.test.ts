import { describe, it, expect } from 'vitest'
import type {
  DmScreenCharacter,
  DmScreenPartyStats,
  DmScreenPartySummary
} from '~/types/dm-screen'

describe('DmScreen Types', () => {
  it('DmScreenCharacter has required fields', () => {
    const character: DmScreenCharacter = {
      id: 1,
      public_id: 'brave-mage-3aBc',
      name: 'Gandalf',
      level: 5,
      class_name: 'Wizard',
      hit_points: { current: 28, max: 35, temp: 0 },
      armor_class: 15,
      proficiency_bonus: 3,
      combat: {
        initiative_modifier: 2,
        speeds: { walk: 30, fly: null, swim: null, climb: null },
        death_saves: { successes: 0, failures: 0 },
        concentration: { active: false, spell: null }
      },
      senses: {
        passive_perception: 14,
        passive_investigation: 12,
        passive_insight: 14,
        darkvision: 60
      },
      capabilities: {
        languages: ['Common', 'Elvish'],
        size: 'Medium',
        tool_proficiencies: ['Thieves\' Tools']
      },
      equipment: {
        armor: { name: 'Studded Leather', type: 'light', stealth_disadvantage: false },
        weapons: [{ name: 'Longsword', damage: '1d8 slashing', range: null }],
        shield: false
      },
      saving_throws: { STR: 0, DEX: 2, CON: 1, INT: 4, WIS: 2, CHA: -1 },
      conditions: [],
      spell_slots: { 1: { current: 4, max: 4 } }
    }
    expect(character.name).toBe('Gandalf')
  })

  it('DmScreenPartySummary has aggregation fields', () => {
    const summary: DmScreenPartySummary = {
      all_languages: ['Common', 'Dwarvish'],
      darkvision_count: 3,
      no_darkvision: ['Aldric'],
      has_healer: true,
      healers: ['Mira (Cleric)'],
      has_detect_magic: true,
      has_dispel_magic: false,
      has_counterspell: true
    }
    expect(summary.darkvision_count).toBe(3)
  })

  it('DmScreenPartyStats combines characters and summary', () => {
    const stats: DmScreenPartyStats = {
      party: { id: 1, name: 'The Brave', description: null },
      characters: [],
      party_summary: {
        all_languages: [],
        darkvision_count: 0,
        no_darkvision: [],
        has_healer: false,
        healers: [],
        has_detect_magic: false,
        has_dispel_magic: false,
        has_counterspell: false
      }
    }
    expect(stats.party.name).toBe('The Brave')
  })
})

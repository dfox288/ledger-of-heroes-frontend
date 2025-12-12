/**
 * Human Fighter Level 3 - Subclass Selection
 *
 * This fixture represents a Human Fighter at level 3, testing:
 * - Martial Archetype (subclass) selection
 * - HP progression (3 hit dice)
 * - No ASI at this level (ASI at L4)
 *
 * Fighter picks subclass at level 3, unlike Wizard (L2) or Cleric (L1).
 * This is the most common subclass selection timing.
 *
 * Build path: L1 complete → L2 (Action Surge) → L3 (Martial Archetype)
 */

import type { components } from '~/types/api/generated'
import type { LevelUpResult } from '~/types/character'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 1,
  public_id: 'iron-phoenix-X7k2',
  name: 'Thorin Ironforge',
  level: 3,
  experience_points: 900,
  status: 'draft', // Draft because subclass pending
  race: {
    id: 1,
    name: 'Human',
    slug: 'phb:human'
  },
  subrace: null,
  class: {
    id: 1,
    name: 'Fighter',
    slug: 'phb:fighter',
    hit_die: 10
  },
  subclass: null, // Pending selection
  background: {
    id: 2,
    name: 'Soldier',
    slug: 'phb:soldier'
  },
  ability_scores: {
    STR: 16, // +1 Human to all stats
    DEX: 14,
    CON: 15,
    INT: 10,
    WIS: 12,
    CHA: 9
  },
  base_ability_scores: {
    STR: 15,
    DEX: 13,
    CON: 14,
    INT: 9,
    WIS: 11,
    CHA: 8
  },
  hit_points: {
    current: 28,
    max: 28, // 10 + 2(CON) + 2×(6avg + 2) = 10 + 2 + 16 = 28
    temporary: 0
  },
  armor_class: 18, // Chain mail (16) + shield (+2)
  speed: 30,
  proficiency_bonus: 2,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-02-15T14:00:00Z'
}

const stats: CharacterStats = {
  ability_scores: {
    STR: { score: 16, modifier: 3, saving_throw: 5, proficient: true },
    DEX: { score: 14, modifier: 2, saving_throw: 2, proficient: false },
    CON: { score: 15, modifier: 2, saving_throw: 4, proficient: true },
    INT: { score: 10, modifier: 0, saving_throw: 0, proficient: false },
    WIS: { score: 12, modifier: 1, saving_throw: 1, proficient: false },
    CHA: { score: 9, modifier: -1, saving_throw: -1, proficient: false }
  },
  skills: [
    { slug: 'athletics', name: 'Athletics', ability: 'STR', modifier: 5, proficient: true },
    { slug: 'intimidation', name: 'Intimidation', ability: 'CHA', modifier: 1, proficient: true }
  ],
  combat: {
    armor_class: 18,
    initiative: 2,
    speed: 30,
    hit_points: { current: 28, max: 28, temporary: 0 },
    hit_dice: { total: 3, remaining: 3, die: 'd10' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 11,
    investigation: 10,
    insight: 11
  },
  proficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: ['Gaming Set (Dice)'],
    languages: ['Common', 'Orc']
  },
  spellcasting: null
}

const summary: CharacterSummary = {
  id: 1,
  public_id: 'iron-phoenix-X7k2',
  name: 'Thorin Ironforge',
  level: 3,
  race: 'Human',
  class: 'Fighter',
  subclass: null,
  background: 'Soldier',
  status: 'draft',
  pending_choices: {
    total: 1,
    proficiency: 0,
    equipment: 0,
    spell: 0,
    language: 0,
    ability_score: 0,
    feature: 1, // Subclass counts as feature
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices - Martial Archetype selection
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'subclass|class|phb:fighter|3|martial_archetype',
      type: 'subclass',
      subtype: null,
      source: 'class',
      source_name: 'Fighter',
      level_granted: 3,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        {
          slug: 'phb:champion',
          name: 'Champion',
          description: 'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection.'
        },
        {
          slug: 'phb:battle-master',
          name: 'Battle Master',
          description: 'Those who emulate the archetypal Battle Master employ martial techniques passed down through generations.'
        },
        {
          slug: 'phb:eldritch-knight',
          name: 'Eldritch Knight',
          description: 'The archetypal Eldritch Knight combines the martial mastery common to all fighters with a careful study of magic.'
        }
      ]
    }
  ]
}

// Level-up result from POST /characters/:id/classes/phb:fighter/level-up
// This simulates going from L2 → L3
const levelUpResult: LevelUpResult = {
  previous_level: 2,
  new_level: 3,
  hp_increase: 8, // d10 roll (6) + CON mod (2)
  new_max_hp: 28,
  features_gained: [
    {
      id: 101,
      name: 'Martial Archetype',
      description: 'At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques.'
    }
  ],
  spell_slots: {}, // Fighter has no spellcasting (unless Eldritch Knight)
  asi_pending: false,
  hp_choice_pending: false // HP already rolled/chosen in this fixture
}

// Alternative level-up result with HP choice still pending
const levelUpResultHpPending: LevelUpResult = {
  previous_level: 2,
  new_level: 3,
  hp_increase: 0, // Not yet determined
  new_max_hp: 20, // Previous max, will update after HP choice
  features_gained: [
    {
      id: 101,
      name: 'Martial Archetype',
      description: 'At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques.'
    }
  ],
  spell_slots: {},
  asi_pending: false,
  hp_choice_pending: true
}

export const humanFighterL3 = {
  character,
  stats,
  summary,
  pendingChoices,
  levelUpResult,
  levelUpResultHpPending
}

export { character, stats, summary, pendingChoices, levelUpResult, levelUpResultHpPending }

/**
 * Human Fighter Level 1 - Complete Character Fixture
 *
 * This fixture represents a complete Human Fighter at level 1,
 * including all related API responses (stats, summary, pending-choices).
 *
 * Use this as a template for creating other character fixtures.
 */

import type { components } from '~/types/api/generated'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

// The main character record
const character: Character = {
  id: 1,
  public_id: 'iron-phoenix-X7k2',
  name: 'Thorin Ironforge',
  level: 1,
  experience_points: 0,
  status: 'complete',
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
  subclass: null,
  background: {
    id: 2,
    name: 'Soldier',
    slug: 'phb:soldier'
  },
  ability_scores: {
    STR: 16,
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
    current: 12,
    max: 12,
    temporary: 0
  },
  armor_class: 16,
  speed: 30,
  proficiency_bonus: 2,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:45:00Z'
}

// Character stats (from /characters/:id/stats)
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
    { slug: 'intimidation', name: 'Intimidation', ability: 'CHA', modifier: 1, proficient: true },
    { slug: 'perception', name: 'Perception', ability: 'WIS', modifier: 1, proficient: false },
    { slug: 'acrobatics', name: 'Acrobatics', ability: 'DEX', modifier: 2, proficient: false },
    { slug: 'stealth', name: 'Stealth', ability: 'DEX', modifier: 2, proficient: false }
  ],
  combat: {
    armor_class: 16,
    initiative: 2,
    speed: 30,
    hit_points: { current: 12, max: 12, temporary: 0 },
    hit_dice: { total: 1, remaining: 1, die: 'd10' },
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

// Character summary (from /characters/:id/summary)
const summary: CharacterSummary = {
  id: 1,
  public_id: 'iron-phoenix-X7k2',
  name: 'Thorin Ironforge',
  level: 1,
  race: 'Human',
  class: 'Fighter',
  subclass: null,
  background: 'Soldier',
  status: 'complete',
  pending_choices: {
    total: 0,
    proficiency: 0,
    equipment: 0,
    spell: 0,
    language: 0,
    ability_score: 0,
    feature: 0,
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices (from /characters/:id/pending-choices)
// Empty for a complete character
const pendingChoices: { choices: PendingChoice[] } = {
  choices: []
}

// Export all related data as a single fixture
export const humanFighterL1 = {
  character,
  stats,
  summary,
  pendingChoices
}

// Also export individually for flexibility
export { character, stats, summary, pendingChoices }

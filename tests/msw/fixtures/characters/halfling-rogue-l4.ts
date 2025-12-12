/**
 * Lightfoot Halfling Rogue Level 4 - ASI/Feat Choice
 *
 * This fixture represents a Lightfoot Halfling Rogue at level 4, testing:
 * - Ability Score Improvement OR Feat selection
 * - Expertise gained at L1 (already selected)
 * - Sneak Attack progression (2d6 at L4)
 *
 * Level 4 is when ALL classes get their first ASI/Feat choice.
 * This is a critical milestone for character customization.
 *
 * Build path: L1 → L2 (Cunning Action) → L3 (Thief subclass) → L4 (ASI)
 */

import type { components } from '~/types/api/generated'
import type { LevelUpResult } from '~/types/character'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 5,
  public_id: 'shadow-whisper-R4m9',
  name: 'Pip Lightfoot',
  level: 4,
  experience_points: 2700,
  status: 'draft', // Draft because ASI pending
  race: {
    id: 4,
    name: 'Halfling',
    slug: 'phb:halfling'
  },
  subrace: {
    id: 5,
    name: 'Lightfoot',
    slug: 'phb:lightfoot-halfling'
  },
  class: {
    id: 3,
    name: 'Rogue',
    slug: 'phb:rogue',
    hit_die: 8
  },
  subclass: {
    id: 10,
    name: 'Thief',
    slug: 'phb:thief'
  },
  background: {
    id: 4,
    name: 'Criminal',
    slug: 'phb:criminal'
  },
  ability_scores: {
    STR: 8,
    DEX: 18, // 16 base + 2 Halfling
    CON: 14,
    INT: 12,
    WIS: 10,
    CHA: 15 // 14 base + 1 Lightfoot
  },
  base_ability_scores: {
    STR: 8,
    DEX: 16,
    CON: 14,
    INT: 12,
    WIS: 10,
    CHA: 14
  },
  hit_points: {
    current: 31,
    max: 31, // 8+2 (L1) + 3×(5avg+2) = 10 + 21 = 31
    temporary: 0
  },
  armor_class: 15, // Leather (11) + 4 DEX
  speed: 25, // Halfling base speed
  proficiency_bonus: 2,
  created_at: '2024-03-01T14:00:00Z',
  updated_at: '2024-03-15T16:30:00Z'
}

const stats: CharacterStats = {
  ability_scores: {
    STR: { score: 8, modifier: -1, saving_throw: -1, proficient: false },
    DEX: { score: 18, modifier: 4, saving_throw: 6, proficient: true }, // Rogue save
    CON: { score: 14, modifier: 2, saving_throw: 2, proficient: false },
    INT: { score: 12, modifier: 1, saving_throw: 3, proficient: true }, // Rogue save
    WIS: { score: 10, modifier: 0, saving_throw: 0, proficient: false },
    CHA: { score: 15, modifier: 2, saving_throw: 2, proficient: false }
  },
  skills: [
    // Expertise in Stealth and Thieves' Tools (granted at L1)
    { slug: 'stealth', name: 'Stealth', ability: 'DEX', modifier: 10, proficient: true }, // 4 DEX + 2×2 prof (expertise)
    { slug: 'sleight-of-hand', name: 'Sleight of Hand', ability: 'DEX', modifier: 6, proficient: true },
    { slug: 'acrobatics', name: 'Acrobatics', ability: 'DEX', modifier: 6, proficient: true },
    { slug: 'perception', name: 'Perception', ability: 'WIS', modifier: 2, proficient: true },
    { slug: 'deception', name: 'Deception', ability: 'CHA', modifier: 4, proficient: true } // Criminal background
  ],
  combat: {
    armor_class: 15,
    initiative: 4,
    speed: 25,
    hit_points: { current: 31, max: 31, temporary: 0 },
    hit_dice: { total: 4, remaining: 4, die: 'd8' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 12,
    investigation: 11,
    insight: 10
  },
  proficiencies: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    tools: ["Thieves' Tools", 'Gaming Set (Dice)'],
    languages: ['Common', 'Halfling', 'Thieves\' Cant']
  },
  spellcasting: null
}

const summary: CharacterSummary = {
  id: 5,
  public_id: 'shadow-whisper-R4m9',
  name: 'Pip Lightfoot',
  level: 4,
  race: 'Lightfoot Halfling',
  class: 'Rogue',
  subclass: 'Thief',
  background: 'Criminal',
  status: 'draft',
  pending_choices: {
    total: 1,
    proficiency: 0,
    equipment: 0,
    spell: 0,
    language: 0,
    ability_score: 1, // ASI pending
    feature: 0,
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices - ASI or Feat selection
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'ability_score|class|phb:rogue|4|asi',
      type: 'ability_score',
      subtype: 'asi_or_feat',
      source: 'class',
      source_name: 'Rogue',
      level_granted: 4,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        // ASI Option
        {
          type: 'asi',
          label: 'Ability Score Improvement',
          description: 'Increase one ability score by 2, or two ability scores by 1 each.'
        },
        // Feat options
        { slug: 'phb:alert', name: 'Alert', type: 'feat' },
        { slug: 'phb:athlete', name: 'Athlete', type: 'feat' },
        { slug: 'phb:actor', name: 'Actor', type: 'feat' },
        { slug: 'phb:charger', name: 'Charger', type: 'feat' },
        { slug: 'phb:crossbow-expert', name: 'Crossbow Expert', type: 'feat' },
        { slug: 'phb:defensive-duelist', name: 'Defensive Duelist', type: 'feat' },
        { slug: 'phb:dual-wielder', name: 'Dual Wielder', type: 'feat' },
        { slug: 'phb:dungeon-delver', name: 'Dungeon Delver', type: 'feat' },
        { slug: 'phb:durable', name: 'Durable', type: 'feat' },
        { slug: 'phb:healer', name: 'Healer', type: 'feat' },
        { slug: 'phb:keen-mind', name: 'Keen Mind', type: 'feat' },
        { slug: 'phb:linguist', name: 'Linguist', type: 'feat' },
        { slug: 'phb:lucky', name: 'Lucky', type: 'feat' },
        { slug: 'phb:mage-slayer', name: 'Mage Slayer', type: 'feat' },
        { slug: 'phb:magic-initiate', name: 'Magic Initiate', type: 'feat' },
        { slug: 'phb:mobile', name: 'Mobile', type: 'feat' },
        { slug: 'phb:observant', name: 'Observant', type: 'feat' },
        { slug: 'phb:resilient', name: 'Resilient', type: 'feat' },
        { slug: 'phb:ritual-caster', name: 'Ritual Caster', type: 'feat' },
        { slug: 'phb:sentinel', name: 'Sentinel', type: 'feat' },
        { slug: 'phb:sharpshooter', name: 'Sharpshooter', type: 'feat' },
        { slug: 'phb:skilled', name: 'Skilled', type: 'feat' },
        { slug: 'phb:skulker', name: 'Skulker', type: 'feat' },
        { slug: 'phb:tough', name: 'Tough', type: 'feat' }
      ]
    }
  ]
}

// Level-up result from POST /characters/:id/classes/phb:rogue/level-up
// This simulates going from L3 → L4
const levelUpResult: LevelUpResult = {
  previous_level: 3,
  new_level: 4,
  hp_increase: 7, // d8 roll (5) + CON mod (2)
  new_max_hp: 31,
  features_gained: [
    {
      id: 301,
      name: 'Ability Score Improvement',
      description: 'When you reach 4th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. Alternatively, you can take a feat.'
    }
  ],
  spell_slots: {},
  asi_pending: true, // This is the key difference - ASI is pending
  hp_choice_pending: false
}

// Alternative level-up result with both HP and ASI pending
const levelUpResultAllPending: LevelUpResult = {
  previous_level: 3,
  new_level: 4,
  hp_increase: 0,
  new_max_hp: 24, // Previous max
  features_gained: [
    {
      id: 301,
      name: 'Ability Score Improvement',
      description: 'When you reach 4th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. Alternatively, you can take a feat.'
    }
  ],
  spell_slots: {},
  asi_pending: true,
  hp_choice_pending: true
}

// Post-ASI version (after player chooses +2 DEX)
const characterAfterAsi: Character = {
  ...character,
  status: 'complete',
  ability_scores: {
    ...character.ability_scores,
    DEX: 20 // 18 + 2 from ASI
  }
}

export const halflingRogueL4 = {
  character,
  stats,
  summary,
  pendingChoices,
  levelUpResult,
  levelUpResultAllPending,
  characterAfterAsi
}

export { character, stats, summary, pendingChoices, levelUpResult, levelUpResultAllPending, characterAfterAsi }

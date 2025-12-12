/**
 * High Elf Wizard Level 2 - Arcane Tradition Selection
 *
 * This fixture represents a High Elf Wizard at level 2, testing:
 * - Arcane Tradition (subclass) selection at L2
 * - Spell slot progression (2 → 3 first-level slots)
 * - INT-based spellcasting with increased spell save DC
 *
 * Wizard picks subclass at level 2, earlier than most classes.
 * This is a critical milestone for full casters.
 *
 * Build path: L1 complete → L2 (Arcane Tradition)
 */

import type { components } from '~/types/api/generated'
import type { LevelUpResult } from '~/types/character'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 3,
  public_id: 'mystic-tome-K8n3',
  name: 'Aelindra Starweaver',
  level: 2,
  experience_points: 300,
  status: 'draft', // Draft because subclass pending
  race: {
    id: 2,
    name: 'Elf',
    slug: 'phb:elf'
  },
  subrace: {
    id: 3,
    name: 'High Elf',
    slug: 'phb:high-elf'
  },
  class: {
    id: 2,
    name: 'Wizard',
    slug: 'phb:wizard',
    hit_die: 6
  },
  subclass: null, // Pending selection
  background: {
    id: 3,
    name: 'Sage',
    slug: 'phb:sage'
  },
  ability_scores: {
    STR: 8,
    DEX: 16, // 14 base + 2 Elf
    CON: 13,
    INT: 17, // 16 base + 1 High Elf
    WIS: 12,
    CHA: 10
  },
  base_ability_scores: {
    STR: 8,
    DEX: 14,
    CON: 13,
    INT: 16,
    WIS: 12,
    CHA: 10
  },
  hit_points: {
    current: 11,
    max: 11, // 6 (L1 max) + 1 (CON) + 4 (L2 avg+CON) = 11
    temporary: 0
  },
  armor_class: 13, // 10 + 3 DEX (no armor proficiency)
  speed: 30,
  proficiency_bonus: 2,
  created_at: '2024-02-01T09:00:00Z',
  updated_at: '2024-02-20T11:00:00Z'
}

const stats: CharacterStats = {
  ability_scores: {
    STR: { score: 8, modifier: -1, saving_throw: -1, proficient: false },
    DEX: { score: 16, modifier: 3, saving_throw: 3, proficient: false },
    CON: { score: 13, modifier: 1, saving_throw: 1, proficient: false },
    INT: { score: 17, modifier: 3, saving_throw: 5, proficient: true }, // Wizard save
    WIS: { score: 12, modifier: 1, saving_throw: 3, proficient: true }, // Wizard save
    CHA: { score: 10, modifier: 0, saving_throw: 0, proficient: false }
  },
  skills: [
    { slug: 'arcana', name: 'Arcana', ability: 'INT', modifier: 5, proficient: true },
    { slug: 'history', name: 'History', ability: 'INT', modifier: 5, proficient: true },
    { slug: 'perception', name: 'Perception', ability: 'WIS', modifier: 3, proficient: true } // Elf racial
  ],
  combat: {
    armor_class: 13,
    initiative: 3,
    speed: 30,
    hit_points: { current: 11, max: 11, temporary: 0 },
    hit_dice: { total: 2, remaining: 2, die: 'd6' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 13,
    investigation: 13,
    insight: 11
  },
  proficiencies: {
    armor: [],
    weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows', 'Longswords', 'Shortswords', 'Shortbows', 'Longbows'],
    tools: [],
    languages: ['Common', 'Elvish', 'Draconic', 'Celestial']
  },
  spellcasting: {
    ability: 'INT',
    spell_save_dc: 13, // 8 + 2 (prof) + 3 (INT mod)
    spell_attack_bonus: 5, // 2 (prof) + 3 (INT mod)
    cantrips_known: 4, // 3 (Wizard) + 1 (High Elf bonus)
    spells_prepared: null, // Wizards prepare from spellbook
    spell_slots: {
      1: { total: 3, remaining: 3 } // L2 has 3 first-level slots
    }
  }
}

const summary: CharacterSummary = {
  id: 3,
  public_id: 'mystic-tome-K8n3',
  name: 'Aelindra Starweaver',
  level: 2,
  race: 'High Elf',
  class: 'Wizard',
  subclass: null,
  background: 'Sage',
  status: 'draft',
  pending_choices: {
    total: 1,
    proficiency: 0,
    equipment: 0,
    spell: 0, // No new spells at L2 (wizard learns via spellbook)
    language: 0,
    ability_score: 0,
    feature: 1, // Subclass counts as feature
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices - Arcane Tradition selection
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'subclass|class|phb:wizard|2|arcane_tradition',
      type: 'subclass',
      subtype: null,
      source: 'class',
      source_name: 'Wizard',
      level_granted: 2,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        {
          slug: 'phb:school-of-abjuration',
          name: 'School of Abjuration',
          description: 'The School of Abjuration emphasizes magic that blocks, banishes, or protects.'
        },
        {
          slug: 'phb:school-of-conjuration',
          name: 'School of Conjuration',
          description: 'As a conjurer, you favor spells that produce objects and creatures out of thin air.'
        },
        {
          slug: 'phb:school-of-divination',
          name: 'School of Divination',
          description: 'The counsel of a diviner is sought by royalty and commoners alike.'
        },
        {
          slug: 'phb:school-of-enchantment',
          name: 'School of Enchantment',
          description: 'As a member of the School of Enchantment, you have honed your ability to magically entrance and beguile other people and monsters.'
        },
        {
          slug: 'phb:school-of-evocation',
          name: 'School of Evocation',
          description: 'You focus your study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid.'
        },
        {
          slug: 'phb:school-of-illusion',
          name: 'School of Illusion',
          description: 'You focus your studies on magic that dazzles the senses, befuddles the mind, and tricks even the wisest folk.'
        },
        {
          slug: 'phb:school-of-necromancy',
          name: 'School of Necromancy',
          description: 'The School of Necromancy explores the cosmic forces of life, death, and undeath.'
        },
        {
          slug: 'phb:school-of-transmutation',
          name: 'School of Transmutation',
          description: 'You are a student of spells that modify energy and matter.'
        }
      ]
    }
  ]
}

// Level-up result from POST /characters/:id/classes/phb:wizard/level-up
// This simulates going from L1 → L2
const levelUpResult: LevelUpResult = {
  previous_level: 1,
  new_level: 2,
  hp_increase: 4, // d6 roll (3) + CON mod (1)
  new_max_hp: 11,
  features_gained: [
    {
      id: 201,
      name: 'Arcane Tradition',
      description: 'When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic.'
    }
  ],
  spell_slots: {
    '1st': 3 // Increased from 2 to 3
  },
  asi_pending: false,
  hp_choice_pending: false
}

// Alternative level-up result with HP choice still pending
const levelUpResultHpPending: LevelUpResult = {
  previous_level: 1,
  new_level: 2,
  hp_increase: 0,
  new_max_hp: 7, // Previous max
  features_gained: [
    {
      id: 201,
      name: 'Arcane Tradition',
      description: 'When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic.'
    }
  ],
  spell_slots: {
    '1st': 3
  },
  asi_pending: false,
  hp_choice_pending: true
}

export const highElfWizardL2 = {
  character,
  stats,
  summary,
  pendingChoices,
  levelUpResult,
  levelUpResultHpPending
}

export { character, stats, summary, pendingChoices, levelUpResult, levelUpResultHpPending }

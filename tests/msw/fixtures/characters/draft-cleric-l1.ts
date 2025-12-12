/**
 * Draft Cleric Level 1 - Character with Pending Choices
 *
 * This fixture represents a Cleric in draft state with pending choices
 * that need to be resolved in the wizard. Useful for testing:
 * - Pending choices display
 * - Choice resolution flow
 * - Spell selection (Clerics get spells at L1)
 * - Subclass selection (Clerics choose Divine Domain at L1)
 */

import type { components } from '~/types/api/generated'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 2,
  public_id: 'divine-spark-R4m9',
  name: 'Sister Elara',
  level: 1,
  experience_points: 0,
  status: 'draft',
  race: {
    id: 1,
    name: 'Human',
    slug: 'phb:human'
  },
  subrace: null,
  class: {
    id: 3,
    name: 'Cleric',
    slug: 'phb:cleric',
    hit_die: 8
  },
  subclass: null, // Needs to choose Divine Domain
  background: {
    id: 1,
    name: 'Acolyte',
    slug: 'phb:acolyte'
  },
  ability_scores: {
    STR: 11,
    DEX: 11,
    CON: 13,
    INT: 11,
    WIS: 16,
    CHA: 13
  },
  base_ability_scores: {
    STR: 10,
    DEX: 10,
    CON: 12,
    INT: 10,
    WIS: 15,
    CHA: 12
  },
  hit_points: {
    current: 9,
    max: 9,
    temporary: 0
  },
  armor_class: 16,
  speed: 30,
  proficiency_bonus: 2,
  created_at: '2024-01-20T14:00:00Z',
  updated_at: '2024-01-20T14:00:00Z'
}

const stats: CharacterStats = {
  ability_scores: {
    STR: { score: 11, modifier: 0, saving_throw: 0, proficient: false },
    DEX: { score: 11, modifier: 0, saving_throw: 0, proficient: false },
    CON: { score: 13, modifier: 1, saving_throw: 1, proficient: false },
    INT: { score: 11, modifier: 0, saving_throw: 0, proficient: false },
    WIS: { score: 16, modifier: 3, saving_throw: 5, proficient: true },
    CHA: { score: 13, modifier: 1, saving_throw: 3, proficient: true }
  },
  skills: [
    { slug: 'insight', name: 'Insight', ability: 'WIS', modifier: 5, proficient: true },
    { slug: 'religion', name: 'Religion', ability: 'INT', modifier: 2, proficient: true }
  ],
  combat: {
    armor_class: 16,
    initiative: 0,
    speed: 30,
    hit_points: { current: 9, max: 9, temporary: 0 },
    hit_dice: { total: 1, remaining: 1, die: 'd8' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 13,
    investigation: 10,
    insight: 15
  },
  proficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons'],
    tools: [],
    languages: ['Common', 'Celestial']
  },
  spellcasting: {
    ability: 'WIS',
    spell_save_dc: 13,
    spell_attack_bonus: 5,
    cantrips_known: 3,
    spells_prepared: 4,
    spell_slots: {
      1: { total: 2, remaining: 2 }
    }
  }
}

const summary: CharacterSummary = {
  id: 2,
  public_id: 'divine-spark-R4m9',
  name: 'Sister Elara',
  level: 1,
  race: 'Human',
  class: 'Cleric',
  subclass: null,
  background: 'Acolyte',
  status: 'draft',
  pending_choices: {
    total: 4,
    proficiency: 1, // Class skill choice
    equipment: 1, // Equipment choice
    spell: 1, // Cantrip/spell selection
    language: 1, // Background language
    ability_score: 0,
    feature: 0,
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices that the wizard needs to resolve
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'proficiency|class|phb:cleric|1|skill_choice_1',
      type: 'proficiency',
      subtype: 'skill',
      source: 'class',
      source_name: 'Cleric',
      level_granted: 1,
      required: true,
      quantity: 2,
      remaining: 2,
      selected: [],
      options: [
        { slug: 'history', name: 'History' },
        { slug: 'insight', name: 'Insight' },
        { slug: 'medicine', name: 'Medicine' },
        { slug: 'persuasion', name: 'Persuasion' },
        { slug: 'religion', name: 'Religion' }
      ]
    },
    {
      id: 'spell|class|phb:cleric|1|cantrips',
      type: 'spell',
      subtype: 'cantrip',
      source: 'class',
      source_name: 'Cleric',
      level_granted: 1,
      required: true,
      quantity: 3,
      remaining: 3,
      selected: [],
      options: [
        { slug: 'phb:guidance', name: 'Guidance', level: 0 },
        { slug: 'phb:light', name: 'Light', level: 0 },
        { slug: 'phb:mending', name: 'Mending', level: 0 },
        { slug: 'phb:resistance', name: 'Resistance', level: 0 },
        { slug: 'phb:sacred-flame', name: 'Sacred Flame', level: 0 },
        { slug: 'phb:spare-the-dying', name: 'Spare the Dying', level: 0 },
        { slug: 'phb:thaumaturgy', name: 'Thaumaturgy', level: 0 }
      ]
    },
    {
      id: 'equipment|class|phb:cleric|1|choice_1',
      type: 'equipment',
      subtype: null,
      source: 'class',
      source_name: 'Cleric',
      level_granted: 1,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        { option: 'a', label: 'a mace', items: [{ slug: 'phb:mace', quantity: 1 }] },
        { option: 'b', label: 'a warhammer (if proficient)', items: [{ slug: 'phb:warhammer', quantity: 1 }] }
      ]
    },
    {
      id: 'language|background|phb:acolyte|1|choice_1',
      type: 'language',
      subtype: null,
      source: 'background',
      source_name: 'Acolyte',
      level_granted: 1,
      required: true,
      quantity: 2,
      remaining: 2,
      selected: [],
      options: [
        { slug: 'abyssal', name: 'Abyssal' },
        { slug: 'celestial', name: 'Celestial' },
        { slug: 'deep-speech', name: 'Deep Speech' },
        { slug: 'draconic', name: 'Draconic' },
        { slug: 'dwarvish', name: 'Dwarvish' },
        { slug: 'elvish', name: 'Elvish' },
        { slug: 'giant', name: 'Giant' },
        { slug: 'gnomish', name: 'Gnomish' },
        { slug: 'goblin', name: 'Goblin' },
        { slug: 'halfling', name: 'Halfling' },
        { slug: 'infernal', name: 'Infernal' },
        { slug: 'orc', name: 'Orc' },
        { slug: 'primordial', name: 'Primordial' },
        { slug: 'sylvan', name: 'Sylvan' },
        { slug: 'undercommon', name: 'Undercommon' }
      ]
    }
  ]
}

export const draftClericL1 = {
  character,
  stats,
  summary,
  pendingChoices
}

export { character, stats, summary, pendingChoices }

/**
 * High Elf Wizard Level 1 - Character with Subrace
 *
 * This fixture represents a High Elf Wizard at level 1, testing:
 * - Subrace selection flow (Elf → High Elf)
 * - INT-based spellcaster with spell selection
 * - Wizard picks subclass at level 2 (no subclass step at L1)
 *
 * Key differences from Human Fighter:
 * - needsSubraceStep = true (Elf has subraces)
 * - isSpellcaster = true (Wizard)
 * - needsSubclassStep = false (Wizard picks at level 2)
 */

import type { components } from '~/types/api/generated'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 3,
  public_id: 'mystic-tome-K8n3',
  name: 'Aelindra Starweaver',
  level: 1,
  experience_points: 0,
  status: 'draft',
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
  subclass: null, // Wizard picks at level 2
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
    current: 7,
    max: 7, // 6 (hit die max) + 1 (CON mod)
    temporary: 0
  },
  armor_class: 13, // 10 + 3 DEX (no armor proficiency)
  speed: 30,
  proficiency_bonus: 2,
  created_at: '2024-02-01T09:00:00Z',
  updated_at: '2024-02-01T09:00:00Z'
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
    initiative: 3, // DEX mod
    speed: 30,
    hit_points: { current: 7, max: 7, temporary: 0 },
    hit_dice: { total: 1, remaining: 1, die: 'd6' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 13, // 10 + 3 (proficient Perception)
    investigation: 13, // 10 + 3 (INT mod)
    insight: 11
  },
  proficiencies: {
    armor: [],
    weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows', 'Longswords', 'Shortswords', 'Shortbows', 'Longbows'], // Wizard + Elf
    tools: [],
    languages: ['Common', 'Elvish', 'Draconic', 'Celestial'] // Common + Elvish (Elf) + 2 from Sage
  },
  spellcasting: {
    ability: 'INT',
    spell_save_dc: 13, // 8 + 2 (prof) + 3 (INT mod)
    spell_attack_bonus: 5, // 2 (prof) + 3 (INT mod)
    cantrips_known: 4, // 3 (Wizard) + 1 (High Elf bonus)
    spells_prepared: null, // Wizards prepare from spellbook
    spell_slots: {
      1: { total: 2, remaining: 2 }
    }
  }
}

const summary: CharacterSummary = {
  id: 3,
  public_id: 'mystic-tome-K8n3',
  name: 'Aelindra Starweaver',
  level: 1,
  race: 'High Elf',
  class: 'Wizard',
  subclass: null,
  background: 'Sage',
  status: 'draft',
  pending_choices: {
    total: 3,
    proficiency: 1, // Wizard skill choices
    equipment: 1, // Equipment pack choice
    spell: 1, // Cantrip/spellbook selection
    language: 0, // Sage already has 2 languages selected
    ability_score: 0,
    feature: 0,
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices that need resolution
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'proficiency|class|phb:wizard|1|skill_choice_1',
      type: 'proficiency',
      subtype: 'skill',
      source: 'class',
      source_name: 'Wizard',
      level_granted: 1,
      required: true,
      quantity: 2,
      remaining: 2,
      selected: [],
      options: [
        { slug: 'arcana', name: 'Arcana' },
        { slug: 'history', name: 'History' },
        { slug: 'insight', name: 'Insight' },
        { slug: 'investigation', name: 'Investigation' },
        { slug: 'medicine', name: 'Medicine' },
        { slug: 'religion', name: 'Religion' }
      ]
    },
    {
      id: 'spell|class|phb:wizard|1|cantrips',
      type: 'spell',
      subtype: 'cantrip',
      source: 'class',
      source_name: 'Wizard',
      level_granted: 1,
      required: true,
      quantity: 3,
      remaining: 3,
      selected: [],
      options: [
        { slug: 'phb:acid-splash', name: 'Acid Splash', level: 0 },
        { slug: 'phb:chill-touch', name: 'Chill Touch', level: 0 },
        { slug: 'phb:dancing-lights', name: 'Dancing Lights', level: 0 },
        { slug: 'phb:fire-bolt', name: 'Fire Bolt', level: 0 },
        { slug: 'phb:light', name: 'Light', level: 0 },
        { slug: 'phb:mage-hand', name: 'Mage Hand', level: 0 },
        { slug: 'phb:mending', name: 'Mending', level: 0 },
        { slug: 'phb:message', name: 'Message', level: 0 },
        { slug: 'phb:minor-illusion', name: 'Minor Illusion', level: 0 },
        { slug: 'phb:prestidigitation', name: 'Prestidigitation', level: 0 },
        { slug: 'phb:ray-of-frost', name: 'Ray of Frost', level: 0 },
        { slug: 'phb:shocking-grasp', name: 'Shocking Grasp', level: 0 }
      ]
    },
    {
      id: 'equipment|class|phb:wizard|1|choice_1',
      type: 'equipment',
      subtype: null,
      source: 'class',
      source_name: 'Wizard',
      level_granted: 1,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        { option: 'a', label: 'a quarterstaff', items: [{ slug: 'phb:quarterstaff', quantity: 1 }] },
        { option: 'b', label: 'a dagger', items: [{ slug: 'phb:dagger', quantity: 1 }] }
      ]
    }
  ]
}

export const highElfWizardL1 = {
  character,
  stats,
  summary,
  pendingChoices
}

export { character, stats, summary, pendingChoices }

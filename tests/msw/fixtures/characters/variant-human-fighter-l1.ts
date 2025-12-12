/**
 * Variant Human Fighter Level 1 - Character with Bonus Feat
 *
 * This fixture represents a Variant Human Fighter at level 1, testing:
 * - Conditional feat step visibility (Variant Human gets bonus feat)
 * - Custom ability score assignment (+1 to two abilities instead of +1 to all)
 * - Bonus skill proficiency
 *
 * Key differences from standard Human Fighter:
 * - hasFeatChoices = true (Variant Human grants bonus feat)
 * - Different ability bonuses (+1 to two instead of +1 to all six)
 * - Gets one bonus skill proficiency
 *
 * Variant Human is a "subrace" of Human in game terms, triggered by
 * the race having modifiers with modifier_category === 'bonus_feat'
 */

import type { components } from '~/types/api/generated'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 4,
  public_id: 'iron-will-P3x7',
  name: 'Marcus Ashford',
  level: 1,
  experience_points: 0,
  status: 'draft',
  race: {
    id: 1,
    name: 'Human',
    slug: 'phb:human'
  },
  subrace: {
    id: 10,
    name: 'Variant Human',
    slug: 'phb:variant-human'
  },
  class: {
    id: 1,
    name: 'Fighter',
    slug: 'phb:fighter',
    hit_die: 10
  },
  subclass: null, // Fighter picks at level 3
  background: {
    id: 2,
    name: 'Soldier',
    slug: 'phb:soldier'
  },
  ability_scores: {
    STR: 17, // 16 base + 1 Variant Human
    DEX: 14,
    CON: 16, // 15 base + 1 Variant Human
    INT: 10,
    WIS: 12,
    CHA: 8
  },
  base_ability_scores: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 10,
    WIS: 12,
    CHA: 8
  },
  hit_points: {
    current: 13,
    max: 13, // 10 (hit die max) + 3 (CON mod)
    temporary: 0
  },
  armor_class: 18, // Chain mail (16) + shield (+2)
  speed: 30,
  proficiency_bonus: 2,
  created_at: '2024-02-15T10:00:00Z',
  updated_at: '2024-02-15T10:00:00Z'
}

const stats: CharacterStats = {
  ability_scores: {
    STR: { score: 17, modifier: 3, saving_throw: 5, proficient: true },
    DEX: { score: 14, modifier: 2, saving_throw: 2, proficient: false },
    CON: { score: 16, modifier: 3, saving_throw: 5, proficient: true },
    INT: { score: 10, modifier: 0, saving_throw: 0, proficient: false },
    WIS: { score: 12, modifier: 1, saving_throw: 1, proficient: false },
    CHA: { score: 8, modifier: -1, saving_throw: -1, proficient: false }
  },
  skills: [
    { slug: 'athletics', name: 'Athletics', ability: 'STR', modifier: 5, proficient: true },
    { slug: 'intimidation', name: 'Intimidation', ability: 'CHA', modifier: 1, proficient: true },
    { slug: 'perception', name: 'Perception', ability: 'WIS', modifier: 3, proficient: true } // Variant Human bonus skill
  ],
  combat: {
    armor_class: 18,
    initiative: 2,
    speed: 30,
    hit_points: { current: 13, max: 13, temporary: 0 },
    hit_dice: { total: 1, remaining: 1, die: 'd10' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 13,
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
  id: 4,
  public_id: 'iron-will-P3x7',
  name: 'Marcus Ashford',
  level: 1,
  race: 'Variant Human',
  class: 'Fighter',
  subclass: null,
  background: 'Soldier',
  status: 'draft',
  pending_choices: {
    total: 3,
    proficiency: 1, // Variant Human bonus skill
    equipment: 1, // Fighter equipment choice
    spell: 0,
    language: 0,
    ability_score: 0,
    feature: 1, // Variant Human bonus feat
    fighting_style: 0,
    expertise: 0
  }
}

// Pending choices that need resolution
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'feature|race|phb:variant-human|1|bonus_feat',
      type: 'feature',
      subtype: 'feat',
      source: 'race',
      source_name: 'Variant Human',
      level_granted: 1,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        { slug: 'phb:alert', name: 'Alert' },
        { slug: 'phb:athlete', name: 'Athlete' },
        { slug: 'phb:charger', name: 'Charger' },
        { slug: 'phb:defensive-duelist', name: 'Defensive Duelist' },
        { slug: 'phb:dual-wielder', name: 'Dual Wielder' },
        { slug: 'phb:durable', name: 'Durable' },
        { slug: 'phb:great-weapon-master', name: 'Great Weapon Master' },
        { slug: 'phb:heavily-armored', name: 'Heavily Armored' },
        { slug: 'phb:heavy-armor-master', name: 'Heavy Armor Master' },
        { slug: 'phb:inspiring-leader', name: 'Inspiring Leader' },
        { slug: 'phb:lucky', name: 'Lucky' },
        { slug: 'phb:martial-adept', name: 'Martial Adept' },
        { slug: 'phb:mobile', name: 'Mobile' },
        { slug: 'phb:polearm-master', name: 'Polearm Master' },
        { slug: 'phb:resilient', name: 'Resilient' },
        { slug: 'phb:savage-attacker', name: 'Savage Attacker' },
        { slug: 'phb:sentinel', name: 'Sentinel' },
        { slug: 'phb:shield-master', name: 'Shield Master' },
        { slug: 'phb:tough', name: 'Tough' },
        { slug: 'phb:war-caster', name: 'War Caster' }
      ]
    },
    {
      id: 'proficiency|race|phb:variant-human|1|skill_choice_1',
      type: 'proficiency',
      subtype: 'skill',
      source: 'race',
      source_name: 'Variant Human',
      level_granted: 1,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        { slug: 'acrobatics', name: 'Acrobatics' },
        { slug: 'animal-handling', name: 'Animal Handling' },
        { slug: 'arcana', name: 'Arcana' },
        { slug: 'athletics', name: 'Athletics' },
        { slug: 'deception', name: 'Deception' },
        { slug: 'history', name: 'History' },
        { slug: 'insight', name: 'Insight' },
        { slug: 'intimidation', name: 'Intimidation' },
        { slug: 'investigation', name: 'Investigation' },
        { slug: 'medicine', name: 'Medicine' },
        { slug: 'nature', name: 'Nature' },
        { slug: 'perception', name: 'Perception' },
        { slug: 'performance', name: 'Performance' },
        { slug: 'persuasion', name: 'Persuasion' },
        { slug: 'religion', name: 'Religion' },
        { slug: 'sleight-of-hand', name: 'Sleight of Hand' },
        { slug: 'stealth', name: 'Stealth' },
        { slug: 'survival', name: 'Survival' }
      ]
    },
    {
      id: 'equipment|class|phb:fighter|1|choice_1',
      type: 'equipment',
      subtype: null,
      source: 'class',
      source_name: 'Fighter',
      level_granted: 1,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        { option: 'a', label: 'chain mail', items: [{ slug: 'phb:chain-mail', quantity: 1 }] },
        { option: 'b', label: 'leather armor, longbow, and 20 arrows', items: [
          { slug: 'phb:leather-armor', quantity: 1 },
          { slug: 'phb:longbow', quantity: 1 },
          { slug: 'phb:arrow', quantity: 20 }
        ]}
      ]
    }
  ]
}

// Variant Human race data with bonus feat modifier
// This is what makes hasFeatChoices return true
const variantHumanRaceWithModifiers = {
  id: 10,
  name: 'Variant Human',
  slug: 'phb:variant-human',
  speed: 30,
  size: { id: 1, name: 'Medium', code: 'M' },
  is_subrace: true,
  parent_race: { id: 1, name: 'Human', slug: 'phb:human' },
  modifiers: [
    {
      modifier_category: 'ability_score',
      modifier_type: 'bonus',
      value: 1,
      ability_score: { id: 1, code: 'STR', name: 'Strength' },
      description: '+1 to one ability score of your choice'
    },
    {
      modifier_category: 'ability_score',
      modifier_type: 'bonus',
      value: 1,
      ability_score: { id: 3, code: 'CON', name: 'Constitution' },
      description: '+1 to one ability score of your choice'
    },
    {
      modifier_category: 'bonus_feat',
      modifier_type: 'grant',
      value: 1,
      description: 'You gain one feat of your choice'
    },
    {
      modifier_category: 'skill_proficiency',
      modifier_type: 'choice',
      value: 1,
      description: 'You gain proficiency in one skill of your choice'
    }
  ],
  sources: [{ code: 'PHB', name: "Player's Handbook" }]
}

export const variantHumanFighterL1 = {
  character,
  stats,
  summary,
  pendingChoices,
  // Extra: race data with modifiers for testing hasFeatChoices
  variantHumanRaceWithModifiers
}

export { character, stats, summary, pendingChoices, variantHumanRaceWithModifiers }

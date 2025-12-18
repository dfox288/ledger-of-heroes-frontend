/**
 * Hill Dwarf Druid Level 2 - Circle of the Land (Terrain Selection)
 *
 * This fixture represents a Hill Dwarf Druid at level 2, testing:
 * - Circle subclass selection with variant_choices for terrain
 * - Terrain choice determines which circle spells are granted
 * - variant_choices pattern for subclasses with secondary selections
 *
 * Druids pick subclass at level 2. Circle of the Land requires
 * an additional terrain choice (Arctic, Coast, Desert, etc.)
 *
 * Build path: L1 complete → L2 (Druid Circle + Terrain)
 */

import type { components } from '~/types/api/generated'
import type { LevelUpResult } from '~/types/character'

type Character = components['schemas']['CharacterResource']
type CharacterStats = components['schemas']['CharacterStatsResource']
type CharacterSummary = components['schemas']['CharacterSummaryResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const character: Character = {
  id: 5,
  public_id: 'forest-guardian-P4m8',
  name: 'Thordak Oakenshield',
  level: 2,
  experience_points: 300,
  status: 'draft', // Draft because subclass pending
  race: {
    id: 4,
    name: 'Dwarf',
    slug: 'phb:dwarf'
  },
  subrace: {
    id: 5,
    name: 'Hill Dwarf',
    slug: 'phb:hill-dwarf'
  },
  class: {
    id: 5,
    name: 'Druid',
    slug: 'phb:druid',
    hit_die: 8
  },
  subclass: null, // Pending selection
  background: {
    id: 6,
    name: 'Hermit',
    slug: 'phb:hermit'
  },
  ability_scores: {
    STR: 10,
    DEX: 12,
    CON: 16, // 14 base + 2 Dwarf
    INT: 10,
    WIS: 17, // 16 base + 1 Hill Dwarf
    CHA: 8
  },
  base_ability_scores: {
    STR: 10,
    DEX: 12,
    CON: 14,
    INT: 10,
    WIS: 16,
    CHA: 8
  },
  hit_points: {
    current: 20,
    max: 20, // 8 (L1 max) + 3 (CON) + 1 (Hill Dwarf) + 5 (L2 avg) + 3 (CON) = 20
    temporary: 0
  },
  armor_class: 14, // 11 (leather) + 1 DEX + 2 shield
  speed: 25, // Dwarf base speed
  proficiency_bonus: 2,
  created_at: '2024-03-01T10:00:00Z',
  updated_at: '2024-03-15T14:00:00Z'
}

const stats: CharacterStats = {
  ability_scores: {
    STR: { score: 10, modifier: 0, saving_throw: 0, proficient: false },
    DEX: { score: 12, modifier: 1, saving_throw: 1, proficient: false },
    CON: { score: 16, modifier: 3, saving_throw: 3, proficient: false },
    INT: { score: 10, modifier: 0, saving_throw: 2, proficient: true }, // Druid save
    WIS: { score: 17, modifier: 3, saving_throw: 5, proficient: true }, // Druid save
    CHA: { score: 8, modifier: -1, saving_throw: -1, proficient: false }
  },
  skills: [
    { slug: 'medicine', name: 'Medicine', ability: 'WIS', modifier: 5, proficient: true },
    { slug: 'nature', name: 'Nature', ability: 'INT', modifier: 2, proficient: true },
    { slug: 'religion', name: 'Religion', ability: 'INT', modifier: 2, proficient: true } // Hermit
  ],
  combat: {
    armor_class: 14,
    initiative: 1,
    speed: 25,
    hit_points: { current: 20, max: 20, temporary: 0 },
    hit_dice: { total: 2, remaining: 2, die: 'd8' },
    proficiency_bonus: 2
  },
  passive_scores: {
    perception: 13,
    investigation: 10,
    insight: 13
  },
  proficiencies: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears', 'Battleaxes', 'Handaxes', 'Light Hammers', 'Warhammers'],
    tools: ['Herbalism Kit'],
    languages: ['Common', 'Dwarvish', 'Druidic']
  },
  spellcasting: {
    ability: 'WIS',
    spell_save_dc: 13, // 8 + 2 (prof) + 3 (WIS mod)
    spell_attack_bonus: 5, // 2 (prof) + 3 (WIS mod)
    cantrips_known: 2,
    spells_prepared: 5, // Druid level (2) + WIS mod (3)
    spell_slots: {
      1: { total: 3, remaining: 3 }
    }
  }
}

const summary: CharacterSummary = {
  id: 5,
  public_id: 'forest-guardian-P4m8',
  name: 'Thordak Oakenshield',
  level: 2,
  race: 'Hill Dwarf',
  class: 'Druid',
  subclass: null,
  background: 'Hermit',
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

/**
 * Terrain variant options for Circle of the Land
 * Each terrain grants different circle spells at various druid levels
 */
const terrainOptions = [
  {
    value: 'arctic',
    name: 'Arctic',
    description: 'You have adapted to the frozen reaches of the world.',
    spells: ['Hold Person', 'Spike Growth', 'Sleet Storm', 'Slow', 'Freedom of Movement', 'Ice Storm', 'Commune with Nature', 'Cone of Cold'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'coast',
    name: 'Coast',
    description: 'Your magic draws from the power of the sea.',
    spells: ['Mirror Image', 'Misty Step', 'Water Breathing', 'Water Walk', 'Control Water', 'Freedom of Movement', 'Conjure Elemental', 'Scrying'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'desert',
    name: 'Desert',
    description: 'You are attuned to the harsh beauty of sand and sun.',
    spells: ['Blur', 'Silence', 'Create Food and Water', 'Protection from Energy', 'Blight', 'Hallucinatory Terrain', 'Insect Plague', 'Wall of Stone'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'forest',
    name: 'Forest',
    description: 'Your magic is infused with the ancient power of woodlands.',
    spells: ['Barkskin', 'Spider Climb', 'Call Lightning', 'Plant Growth', 'Divination', 'Freedom of Movement', 'Commune with Nature', 'Tree Stride'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'grassland',
    name: 'Grassland',
    description: 'You draw power from the open plains and prairies.',
    spells: ['Invisibility', 'Pass without Trace', 'Daylight', 'Haste', 'Divination', 'Freedom of Movement', 'Dream', 'Insect Plague'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'mountain',
    name: 'Mountain',
    description: 'Your connection to stone and sky empowers your magic.',
    spells: ['Spider Climb', 'Spike Growth', 'Lightning Bolt', 'Meld into Stone', 'Stone Shape', 'Stoneskin', 'Passwall', 'Wall of Stone'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'swamp',
    name: 'Swamp',
    description: 'You have learned the dark secrets of marshes and bogs.',
    spells: ['Darkness', 'Melf\'s Acid Arrow', 'Water Walk', 'Stinking Cloud', 'Freedom of Movement', 'Locate Creature', 'Insect Plague', 'Scrying'],
    spells_label: 'Circle Spells:'
  },
  {
    value: 'underdark',
    name: 'Underdark',
    description: 'Your magic is shaped by the lightless depths below.',
    spells: ['Spider Climb', 'Web', 'Gaseous Form', 'Stinking Cloud', 'Greater Invisibility', 'Stone Shape', 'Cloudkill', 'Insect Plague'],
    spells_label: 'Circle Spells:'
  }
]

// Pending choices - Druid Circle selection with variant_choices
const pendingChoices: { choices: PendingChoice[] } = {
  choices: [
    {
      id: 'subclass|class|phb:druid|2|druid_circle',
      type: 'subclass',
      subtype: null,
      source: 'class',
      source_name: 'Druid',
      level_granted: 2,
      required: true,
      quantity: 1,
      remaining: 1,
      selected: [],
      options: [
        {
          slug: 'phb:druid-circle-of-the-land',
          name: 'Circle of the Land',
          description: 'The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition.',
          features_preview: ['Bonus Cantrip', 'Natural Recovery'],
          // This is the key new feature - variant_choices for terrain
          variant_choices: {
            terrain: {
              required: true,
              label: 'Choose your terrain',
              options: terrainOptions
            }
          }
        },
        {
          slug: 'phb:druid-circle-of-the-moon',
          name: 'Circle of the Moon',
          description: 'Druids of the Circle of the Moon are fierce guardians of the wilds, capable of assuming powerful beast forms.',
          features_preview: ['Combat Wild Shape', 'Circle Forms']
          // No variant_choices - Circle of the Moon has no additional choices
        }
      ],
      options_endpoint: null,
      metadata: { class_slug: 'phb:druid' }
    }
  ]
}

// Level-up result from POST /characters/:id/classes/phb:druid/level-up
const levelUpResult: LevelUpResult = {
  previous_level: 1,
  new_level: 2,
  hp_increase: 8, // d8 roll (5) + CON mod (3)
  new_max_hp: 20,
  features_gained: [
    {
      id: 301,
      name: 'Wild Shape',
      description: 'Starting at 2nd level, you can use your action to magically assume the shape of a beast that you have seen before.'
    },
    {
      id: 302,
      name: 'Druid Circle',
      description: 'At 2nd level, you choose to identify with a circle of druids.'
    }
  ],
  spell_slots: {
    '1st': 3
  },
  asi_pending: false,
  hp_choice_pending: false
}

export const hillDwarfDruidL2 = {
  character,
  stats,
  summary,
  pendingChoices,
  levelUpResult,
  terrainOptions
}

export { character, stats, summary, pendingChoices, levelUpResult, terrainOptions }

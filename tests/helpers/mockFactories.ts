import type {
  Spell,
  Item,
  Monster,
  CharacterClass,
  Race,
  Background,
  Feat
} from '~/types'
import type { EntitySource } from '~/types/api/common'

/**
 * Mock Entity Factories
 *
 * Factory functions that create complete mock entities with sensible defaults.
 * Use overrides to customize specific fields for your test cases.
 *
 * Usage:
 * ```typescript
 * import { createMockSpell, createMockItem } from '../../helpers/mockFactories'
 *
 * // Use defaults
 * const spell = createMockSpell()
 *
 * // Override specific fields
 * const cantrip = createMockSpell({ level: 0, name: 'Fire Bolt' })
 * const ritualSpell = createMockSpell({ is_ritual: true })
 * ```
 *
 * Benefits:
 * - Eliminates 15-50 lines of mock data per test file
 * - Ensures consistent test data across all tests
 * - Makes tests more readable by focusing on what's different
 * - Single source of truth for mock entity structure
 */

// ============================================================================
// Shared Fixtures
// ============================================================================

/**
 * Default source fixture - Player's Handbook
 * Used across all entity factories
 */
export const mockSource: EntitySource = {
  code: 'PHB',
  name: 'Player\'s Handbook',
  pages: '1'
}

/**
 * Create a source with custom values
 */
export function createMockSource(overrides: Partial<EntitySource> = {}): EntitySource {
  return {
    ...mockSource,
    ...overrides
  }
}

// ============================================================================
// Spell Factory
// ============================================================================

/**
 * Creates a mock Spell with sensible defaults.
 *
 * Default: Level 3 Fireball (Evocation)
 *
 * @example
 * const spell = createMockSpell()
 * const cantrip = createMockSpell({ level: 0, name: 'Fire Bolt', slug: 'fire-bolt' })
 * const ritual = createMockSpell({ is_ritual: true })
 */
export function createMockSpell(overrides: Partial<Spell> = {}): Spell {
  return {
    id: 1,
    name: 'Fireball',
    slug: 'fireball',
    full_slug: 'phb:fireball',
    level: 3,
    school: {
      id: 5,
      code: 'EV',
      name: 'Evocation'
    },
    casting_time: '1 action',
    range: '150 feet',
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
    is_ritual: false,
    needs_concentration: false,
    area_of_effect: null,
    material_cost_gp: null,
    material_consumed: null,
    sources: [{ ...mockSource, pages: '241' }],
    ...overrides
  }
}

// ============================================================================
// Item Factory
// ============================================================================

/**
 * Creates a mock Item with sensible defaults.
 *
 * Default: Longsword (Martial Weapon, Common)
 *
 * @example
 * const item = createMockItem()
 * const magicSword = createMockItem({ is_magic: true, rarity: 'rare' })
 * const potion = createMockItem({ item_type: { id: 3, name: 'Potion' }, is_magic: true })
 */
export function createMockItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 1,
    name: 'Longsword',
    slug: 'longsword',
    full_slug: 'phb:longsword',
    rarity: 'common',
    item_type: {
      id: 5,
      code: 'M',
      name: 'Martial Weapon'
    },
    item_type_id: 5,
    is_magic: false,
    requires_attunement: false,
    cost_cp: 1500,
    weight: '3',
    proficiency_category: 'martial_melee',
    magic_bonus: null,
    detail: null,
    // Weapon-specific fields
    damage_dice: '1d8',
    versatile_damage: '1d10',
    damage_type: {
      id: 1,
      name: 'Slashing'
    },
    damage_type_id: 1,
    range_normal: null,
    range_long: null,
    properties: [
      { id: 9, code: 'V', name: 'Versatile', description: 'This weapon can be used with one or two hands.' }
    ],
    // Armor-specific fields
    armor_class: null,
    strength_requirement: null,
    stealth_disadvantage: false,
    // Magic item fields
    charges_max: null,
    recharge_formula: null,
    recharge_timing: null,
    // Arrays
    modifiers: [],
    abilities: [],
    spells: [],
    prerequisites: [],
    proficiencies: [],
    data_tables: [],
    saving_throws: [],
    tags: [],
    description: 'A versatile martial weapon used by warriors across the realms.',
    sources: [{ ...mockSource, pages: '149' }],
    ...overrides
  }
}

// ============================================================================
// Monster Factory
// ============================================================================

/**
 * Creates a mock Monster with sensible defaults.
 *
 * Default: Ancient Red Dragon (CR 24, Gargantuan Dragon)
 *
 * @example
 * const monster = createMockMonster()
 * const goblin = createMockMonster({ name: 'Goblin', slug: 'goblin', challenge_rating: '1/4', size: { id: 2, code: 'S', name: 'Small' } })
 * const legendary = createMockMonster({ legendary_actions: [{ id: 1, name: 'Detect', description: 'Makes a check.' }] })
 */
export function createMockMonster(overrides: Partial<Monster> = {}): Monster {
  return {
    id: 1,
    slug: 'ancient-red-dragon',
    full_slug: 'mm:ancient-red-dragon',
    name: 'Ancient Red Dragon',
    size: { id: 6, code: 'G', name: 'Gargantuan' },
    type: 'dragon',
    alignment: 'Chaotic Evil',
    armor_class: 22,
    armor_type: 'natural armor',
    hit_points_average: 546,
    hit_dice: '28d20+252',
    speed_walk: 40,
    speed_fly: 80,
    speed_swim: null,
    speed_burrow: null,
    speed_climb: 40,
    can_hover: false,
    strength: 30,
    dexterity: 10,
    constitution: 29,
    intelligence: 18,
    wisdom: 15,
    charisma: 23,
    challenge_rating: '24',
    experience_points: 62000,
    description: 'The most covetous of the true dragons, red dragons tirelessly seek to increase their treasure hoards.',
    traits: [],
    actions: [],
    legendary_actions: [
      { id: 1, name: 'Detect', description: 'The dragon makes a check.' }
    ],
    modifiers: [],
    conditions: [],
    sources: [{ code: 'MM', name: 'Monster Manual', pages: 'p. 97' }],
    ...overrides
  }
}

// ============================================================================
// Character Class Factory
// ============================================================================

/**
 * Creates a mock CharacterClass with sensible defaults.
 *
 * Default: Wizard (d6, INT spellcaster)
 *
 * @example
 * const characterClass = createMockClass()
 * const fighter = createMockClass({ name: 'Fighter', slug: 'fighter', hit_die: 10, spellcasting_ability: null })
 * const subclass = createMockClass({ is_base_class: false, parent_class_id: 1 })
 */
export function createMockClass(overrides: Partial<CharacterClass> = {}): CharacterClass {
  return {
    id: 1,
    name: 'Wizard',
    slug: 'wizard',
    full_slug: 'phb:wizard',
    hit_die: 6,
    is_base_class: true,
    parent_class_id: null,
    primary_ability: {
      id: 4,
      code: 'INT',
      name: 'Intelligence'
    },
    spellcasting_ability: {
      id: 4,
      code: 'INT',
      name: 'Intelligence'
    },
    subclasses: [
      { id: 2, name: 'School of Evocation' },
      { id: 3, name: 'School of Abjuration' }
    ],
    proficiencies: [
      { id: 1, name: 'Daggers' },
      { id: 2, name: 'Quarterstaffs' }
    ],
    description: 'Wizards are supreme magic-users, defined and united as a class by the spells they cast.',
    sources: [{ ...mockSource, pages: '112' }],
    ...overrides
  }
}

// ============================================================================
// Race Factory
// ============================================================================

/**
 * Creates a mock Race with sensible defaults.
 *
 * Default: Elf (Medium, 30ft speed, DEX +2)
 *
 * @example
 * const race = createMockRace()
 * const dwarf = createMockRace({ name: 'Dwarf', slug: 'dwarf', speed: 25 })
 * const subrace = createMockRace({ name: 'High Elf', slug: 'high-elf', parent_race_id: 1, parent_race: { id: 1, slug: 'elf', name: 'Elf', speed: 30 } })
 */
export function createMockRace(overrides: Partial<Race> = {}): Race {
  return {
    id: 1,
    name: 'Elf',
    slug: 'elf',
    full_slug: 'phb:elf',
    size: {
      id: 3,
      name: 'Medium',
      code: 'M'
    },
    speed: 30,
    parent_race_id: null,
    parent_race: null,
    subraces: [
      { id: 2, slug: 'high-elf', name: 'High Elf' },
      { id: 3, slug: 'wood-elf', name: 'Wood Elf' }
    ],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
        value: 2
      }
    ],
    traits: [
      { id: 1, name: 'Darkvision' },
      { id: 2, name: 'Keen Senses' },
      { id: 3, name: 'Fey Ancestry' }
    ],
    description: 'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    sources: [{ ...mockSource, pages: '21' }],
    ...overrides
  }
}

// ============================================================================
// Background Factory
// ============================================================================

/**
 * Creates a mock Background with sensible defaults.
 *
 * Default: Acolyte (Insight, Religion skills; 2 languages)
 *
 * @example
 * const background = createMockBackground()
 * const soldier = createMockBackground({ name: 'Soldier', slug: 'soldier', feature_name: 'Military Rank' })
 */
export function createMockBackground(overrides: Partial<Background> = {}): Background {
  return {
    id: 1,
    name: 'Acolyte',
    slug: 'acolyte',
    full_slug: 'phb:acolyte',
    proficiencies: [
      {
        id: 1,
        proficiency_type: 'skill',
        proficiency_subcategory: null,
        proficiency_type_id: null,
        skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null },
        proficiency_name: 'Insight',
        grants: true,
        is_choice: false,
        quantity: 1
      },
      {
        id: 2,
        proficiency_type: 'skill',
        proficiency_subcategory: null,
        proficiency_type_id: null,
        skill: { id: 2, name: 'Religion', code: 'RELIGION', description: null, ability_score: null },
        proficiency_name: 'Religion',
        grants: true,
        is_choice: false,
        quantity: 1
      }
    ],
    languages: [
      { language: { id: 1, name: 'Common' }, is_choice: false },
      { language: { id: 2, name: 'Elvish' }, is_choice: false }
    ],
    // New extracted feature fields (Issue #67)
    feature_name: 'Shelter of the Faithful',
    feature_description: 'As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity.',
    description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods.',
    sources: [{ ...mockSource, pages: '127' }],
    ...overrides
  }
}

// ============================================================================
// Feat Factory
// ============================================================================

/**
 * Creates a mock Feat with sensible defaults.
 *
 * Default: War Caster (INT 13+ prereq, 2 ability bonuses)
 *
 * @example
 * const feat = createMockFeat()
 * const noPrereq = createMockFeat({ name: 'Lucky', slug: 'lucky', prerequisites: [] })
 * const highReq = createMockFeat({ prerequisites: [{ ability_score: { id: 1, code: 'STR', name: 'Strength' }, minimum_value: 20 }] })
 */
export function createMockFeat(overrides: Partial<Feat> = {}): Feat {
  return {
    id: 1,
    name: 'War Caster',
    slug: 'war-caster',
    full_slug: 'phb:war-caster',
    prerequisites: [
      {
        ability_score: { id: 4, code: 'INT', name: 'Intelligence' },
        minimum_value: 13
      }
    ],
    modifiers: [
      { modifier_type: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 },
      { modifier_type: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 }
    ],
    description: 'You have practiced casting spells in the midst of combat, learning techniques that grant you the following benefits.',
    sources: [{ ...mockSource, pages: '170' }],
    ...overrides
  }
}

// ============================================================================
// Wizard-Specific Fixtures (Issue #313)
// ============================================================================

/**
 * Pre-configured races for wizard step tests
 *
 * These fixtures represent common test scenarios:
 * - elf: Subrace REQUIRED (tests mandatory subrace selection)
 * - human: Subrace OPTIONAL (tests optional subrace flow)
 * - dwarf: Different speed + required subrace (tests edge cases)
 * - halfOrc: No subraces available (tests simplest flow)
 */
export const wizardMockRaces = {
  elf: createMockRace({
    id: 1,
    name: 'Elf',
    slug: 'elf',
    full_slug: 'phb:elf',
    speed: 30,
    subrace_required: true,
    subraces: [
      { id: 2, slug: 'high-elf', name: 'High Elf', full_slug: 'phb:high-elf' },
      { id: 3, slug: 'wood-elf', name: 'Wood Elf', full_slug: 'phb:wood-elf' }
    ],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
        value: 2
      }
    ]
  }),
  human: createMockRace({
    id: 4,
    name: 'Human',
    slug: 'human',
    full_slug: 'phb:human',
    speed: 30,
    subrace_required: false,
    subraces: [
      { id: 5, slug: 'variant-human', name: 'Variant Human', full_slug: 'phb:variant-human' }
    ],
    modifiers: [
      { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 },
      { modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, value: 1 },
      { modifier_category: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 },
      { modifier_category: 'ability_score', ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, value: 1 },
      { modifier_category: 'ability_score', ability_score: { id: 5, code: 'WIS', name: 'Wisdom' }, value: 1 },
      { modifier_category: 'ability_score', ability_score: { id: 6, code: 'CHA', name: 'Charisma' }, value: 1 }
    ]
  }),
  dwarf: createMockRace({
    id: 6,
    name: 'Dwarf',
    slug: 'dwarf',
    full_slug: 'phb:dwarf',
    speed: 25,
    subrace_required: true,
    subraces: [
      { id: 7, slug: 'hill-dwarf', name: 'Hill Dwarf', full_slug: 'phb:hill-dwarf' },
      { id: 8, slug: 'mountain-dwarf', name: 'Mountain Dwarf', full_slug: 'phb:mountain-dwarf' }
    ],
    modifiers: [
      {
        modifier_category: 'ability_score',
        ability_score: { id: 3, code: 'CON', name: 'Constitution' },
        value: 2
      }
    ]
  }),
  halfOrc: createMockRace({
    id: 9,
    name: 'Half-Orc',
    slug: 'half-orc',
    full_slug: 'phb:half-orc',
    speed: 30,
    subrace_required: false,
    subraces: [],
    modifiers: [
      { modifier_category: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 2 },
      { modifier_category: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 }
    ]
  })
} as const

/**
 * Pre-configured classes for wizard step tests
 *
 * These fixtures represent common test scenarios:
 * - fighter: No spellcasting, subclass at level 3 (standard martial)
 * - wizard: INT spellcaster, subclass at level 2 (early specialization)
 * - cleric: WIS spellcaster, subclass at level 1 (immediate specialization)
 */
export const wizardMockClasses = {
  fighter: createMockClass({
    id: 10,
    name: 'Fighter',
    slug: 'fighter',
    full_slug: 'phb:fighter',
    hit_die: 10,
    spellcasting_ability: null,
    primary_ability: { id: 1, code: 'STR', name: 'Strength' },
    subclass_level: 3,
    subclasses: [
      { id: 11, name: 'Champion', full_slug: 'phb:champion' },
      { id: 12, name: 'Battle Master', full_slug: 'phb:battle-master' }
    ]
  }),
  wizard: createMockClass({
    id: 1,
    name: 'Wizard',
    slug: 'wizard',
    full_slug: 'phb:wizard',
    hit_die: 6,
    spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
    primary_ability: { id: 4, code: 'INT', name: 'Intelligence' },
    subclass_level: 2,
    subclasses: [
      { id: 2, name: 'School of Evocation', full_slug: 'phb:school-of-evocation' },
      { id: 3, name: 'School of Abjuration', full_slug: 'phb:school-of-abjuration' }
    ]
  }),
  cleric: createMockClass({
    id: 13,
    name: 'Cleric',
    slug: 'cleric',
    full_slug: 'phb:cleric',
    hit_die: 8,
    spellcasting_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
    primary_ability: { id: 5, code: 'WIS', name: 'Wisdom' },
    subclass_level: 1,
    subclasses: [
      { id: 14, name: 'Life Domain', full_slug: 'phb:life-domain' },
      { id: 15, name: 'War Domain', full_slug: 'phb:war-domain' }
    ]
  })
} as const

/**
 * Pre-configured backgrounds for wizard step tests
 *
 * These fixtures represent common test scenarios:
 * - acolyte: Default background with religion/insight skills
 * - soldier: Different feature + different skills (Athletics, Intimidation)
 */
export const wizardMockBackgrounds = {
  acolyte: createMockBackground({
    id: 1,
    name: 'Acolyte',
    slug: 'acolyte',
    full_slug: 'phb:acolyte',
    feature_name: 'Shelter of the Faithful',
    feature_description: 'As an acolyte, you command the respect of those who share your faith.',
    proficiencies: [
      {
        id: 1,
        proficiency_type: 'skill',
        proficiency_subcategory: null,
        proficiency_type_id: null,
        skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null },
        proficiency_name: 'Insight',
        grants: true,
        is_choice: false,
        quantity: 1
      },
      {
        id: 2,
        proficiency_type: 'skill',
        proficiency_subcategory: null,
        proficiency_type_id: null,
        skill: { id: 2, name: 'Religion', code: 'RELIGION', description: null, ability_score: null },
        proficiency_name: 'Religion',
        grants: true,
        is_choice: false,
        quantity: 1
      }
    ]
  }),
  soldier: createMockBackground({
    id: 16,
    name: 'Soldier',
    slug: 'soldier',
    full_slug: 'phb:soldier',
    feature_name: 'Military Rank',
    feature_description: 'You have a military rank from your career as a soldier.',
    proficiencies: [
      {
        id: 3,
        proficiency_type: 'skill',
        proficiency_subcategory: null,
        proficiency_type_id: null,
        skill: { id: 3, name: 'Athletics', code: 'ATHLETICS', description: null, ability_score: null },
        proficiency_name: 'Athletics',
        grants: true,
        is_choice: false,
        quantity: 1
      },
      {
        id: 4,
        proficiency_type: 'skill',
        proficiency_subcategory: null,
        proficiency_type_id: null,
        skill: { id: 4, name: 'Intimidation', code: 'INTIMIDATION', description: null, ability_score: null },
        proficiency_name: 'Intimidation',
        grants: true,
        is_choice: false,
        quantity: 1
      }
    ]
  })
} as const

/**
 * Helper functions to convert wizard mock objects to arrays
 *
 * Useful when tests need to iterate over all fixtures or pass to components
 * that expect array props (like USelectMenu :items)
 */

export function getWizardMockRacesArray(): Race[] {
  return Object.values(wizardMockRaces)
}

export function getWizardMockClassesArray(): CharacterClass[] {
  return Object.values(wizardMockClasses)
}

export function getWizardMockBackgroundsArray(): Background[] {
  return Object.values(wizardMockBackgrounds)
}

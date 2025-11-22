import type { Source, Modifier } from './common'

/**
 * Spell entity from D&D 5e API
 *
 * Used in: SpellCard, spell detail pages, tests
 * API endpoint: /api/v1/spells
 */
export interface Spell {
  id: number
  name: string
  slug: string
  level: number
  school?: {
    id: number
    code: string
    name: string
  }
  casting_time: string
  range: string
  description: string
  is_ritual: boolean
  needs_concentration: boolean
  sources?: Source[]
  components?: string
  material_components?: string
  duration?: string
  higher_levels?: string
  effects?: unknown[] // Complex effect structure with damage, healing, etc.
  classes?: unknown[] // Classes that can cast this spell
  random_tables?: unknown[] // Random tables for spell effects
  saving_throws?: unknown[] // Saving throw requirements
  conditions?: unknown[] // Conditions applied by spell
  tags?: unknown[] // Spell tags
}

/**
 * Item entity from D&D 5e API
 *
 * Used in: ItemCard, item detail pages, tests
 * API endpoint: /api/v1/items
 */
export interface Item {
  id: number
  name: string
  slug: string
  rarity: string
  item_type?: {
    id: number
    name: string
  }
  is_magic: boolean
  requires_attunement: boolean
  cost_cp?: number
  weight?: number
  description?: string
  sources?: Source[]
  properties?: unknown[] // Item properties (e.g., versatile, finesse)
  damage_dice?: string
  damage_type?: { id: number; name: string }
  versatile_damage?: string
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number }
  range_normal?: number
  range_long?: number
  strength_requirement?: number
  charges_max?: number
  recharge_formula?: string
  recharge_timing?: string
  modifiers?: Modifier[]
  spells?: unknown[] // Spells granted by item
  abilities?: unknown[] // Special abilities
  saving_throws?: unknown[] // Saving throw requirements
  random_tables?: unknown[] // Random tables for item effects
  tags?: unknown[] // Item tags
}

/**
 * Race entity from D&D 5e API
 *
 * Used in: RaceCard, race detail pages, tests
 * API endpoint: /api/v1/races
 */
export interface Race {
  id: number
  name: string
  slug: string
  size?: {
    id: number
    name: string
    code: string
  }
  speed: number
  parent_race_id?: number | null
  parent_race?: {
    id: number
    slug: string
    name: string
    speed: number
  } | null
  subraces?: Array<{
    id: number
    slug: string
    name: string
  }>
  modifiers?: Modifier[]
  traits?: unknown[] // Complex nested structure, varies by race
  proficiencies?: unknown[] // Proficiency structure
  languages?: unknown[] // Language structure
  abilities?: unknown[] // Special abilities
  description?: string
  sources?: Source[]
  tags?: unknown[] // Race tags
}

/**
 * Character Class entity from D&D 5e API
 *
 * Used in: ClassCard, class detail pages, tests
 * API endpoint: /api/v1/classes
 *
 * Note: Named CharacterClass to avoid conflict with JS 'class' keyword
 */
export interface CharacterClass {
  id: number
  name: string
  slug: string
  hit_die: number
  is_base_class: boolean
  parent_class_id?: number | null
  primary_ability?: {
    id: number
    code: string
    name: string
  } | null
  spellcasting_ability?: {
    id: number
    code: string
    name: string
  } | null
  subclasses?: unknown[] // Complex nested structure with features
  proficiencies?: unknown[] // Complex proficiency structure
  features?: unknown[] // Class features
  spells?: unknown[] // Spells for spellcasting classes
  abilities?: unknown[] // Special abilities
  starting_equipment?: unknown[] // Starting equipment
  description?: string
  sources?: Source[]
  tags?: unknown[] // Class tags
}

/**
 * Background entity from D&D 5e API
 *
 * Used in: BackgroundCard, background detail pages, tests
 * API endpoint: /api/v1/backgrounds
 */
export interface Background {
  id: number
  name: string
  slug: string
  skill_proficiencies?: unknown[] // Complex proficiency structure
  tool_proficiencies?: unknown[] // Complex proficiency structure
  proficiencies?: unknown[] // Combined proficiency structure
  languages?: unknown[] // Complex language structure
  traits?: unknown[] // Background traits and features
  starting_equipment?: unknown[] // Starting equipment
  feature_name?: string
  description?: string
  sources?: Source[]
  tags?: unknown[] // Background tags
}

/**
 * Feat entity from D&D 5e API
 *
 * Used in: FeatCard, feat detail pages, tests
 * API endpoint: /api/v1/feats
 */
export interface Feat {
  id: number
  name: string
  slug: string
  prerequisites?: unknown[] // Complex prerequisite structure
  modifiers?: Modifier[]
  abilities?: unknown[] // Special abilities granted
  proficiencies?: unknown[] // Proficiencies granted
  spells?: unknown[] // Spells granted
  description?: string
  sources?: Source[]
  tags?: unknown[] // Feat tags
}

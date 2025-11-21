import type { Source } from './common'

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
  modifiers?: any[]  // TODO: Type with Modifier interface
  traits?: any[]     // TODO: Type trait structure
  description?: string
  sources?: Source[]
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
  subclasses?: any[]      // TODO: Type subclass structure
  proficiencies?: any[]   // TODO: Type proficiency structure
  description?: string
  sources?: Source[]
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
  skill_proficiencies?: any[]   // TODO: Type skill proficiency structure
  tool_proficiencies?: any[]    // TODO: Type tool proficiency structure
  languages?: any[]             // TODO: Type language structure
  feature_name?: string
  description?: string
  sources?: Source[]
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
  prerequisites?: any[]   // TODO: Type prerequisite structure
  modifiers?: any[]       // TODO: Use Modifier interface
  description?: string
  sources?: Source[]
}

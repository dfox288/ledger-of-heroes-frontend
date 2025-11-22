import type { Source, Modifier } from './common'
import type { components } from './generated'

/**
 * Spell entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: SpellCard, spell detail pages, tests
 * API endpoint: /api/v1/spells
 */
type SpellFromAPI = components['schemas']['SpellResource']

export interface Spell extends Omit<SpellFromAPI, 'sources' | 'school'> {
  // Override with our custom types that have better structure
  school?: {
    id: number
    code: string
    name: string
  }
  sources?: Source[]
  // All other fields inherited from SpellFromAPI
}

/**
 * Item entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: ItemCard, item detail pages, tests
 * API endpoint: /api/v1/items
 */
type ItemFromAPI = components['schemas']['ItemResource']

export interface Item extends Omit<ItemFromAPI, 'sources' | 'item_type' | 'damage_type' | 'modifiers'> {
  // Override with our custom types that have better structure
  item_type?: {
    id: number
    name: string
  }
  damage_type?: { id: number; name: string }
  modifiers?: Modifier[]
  sources?: Source[]
  // All other fields inherited from ItemFromAPI
}

/**
 * Race entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: RaceCard, race detail pages, tests
 * API endpoint: /api/v1/races
 */
type RaceFromAPI = components['schemas']['RaceResource']

export interface Race extends Omit<RaceFromAPI, 'sources' | 'modifiers' | 'size'> {
  // Override with our custom types that have better structure
  size?: {
    id: number
    name: string
    code: string
  }
  modifiers?: Modifier[]
  sources?: Source[]
  // All other fields inherited from RaceFromAPI
}

/**
 * Character Class entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: ClassCard, class detail pages, tests
 * API endpoint: /api/v1/classes
 *
 * Note: Named CharacterClass to avoid conflict with JS 'class' keyword
 */
type CharacterClassFromAPI = components['schemas']['ClassResource']

export interface CharacterClass extends Omit<CharacterClassFromAPI, 'sources'> {
  // Override with our custom types that have better structure
  sources?: Source[]
  // All other fields inherited from CharacterClassFromAPI
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

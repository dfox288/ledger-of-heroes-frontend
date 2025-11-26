import type { EntitySource, Modifier } from './common'
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
  sources?: EntitySource[]
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
  damage_type?: { id: number, name: string }
  modifiers?: Modifier[]
  sources?: EntitySource[]
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
  description?: string
  size?: {
    id: number
    name: string
    code: string
  }
  modifiers?: Modifier[]
  sources?: EntitySource[]
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
  sources?: EntitySource[]
  // All other fields inherited from CharacterClassFromAPI
}

/**
 * Background entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: BackgroundCard, background detail pages, tests
 * API endpoint: /api/v1/backgrounds
 */
type BackgroundFromAPI = components['schemas']['BackgroundResource']

export interface Background extends Omit<BackgroundFromAPI, 'sources'> {
  // Override with our custom types that have better structure
  description?: string
  feature_name?: string
  sources?: EntitySource[]
  // All other fields inherited from BackgroundFromAPI
}

/**
 * Feat entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: FeatCard, feat detail pages, tests
 * API endpoint: /api/v1/feats
 */
type FeatFromAPI = components['schemas']['FeatResource']

export interface Feat extends Omit<FeatFromAPI, 'sources' | 'modifiers'> {
  // Override with our custom types that have better structure
  modifiers?: Modifier[]
  sources?: EntitySource[]
  // All other fields inherited from FeatFromAPI
}

/**
 * Monster entity from D&D 5e API
 *
 * Base type generated from OpenAPI spec, extended with application-specific utilities.
 *
 * Used in: MonsterCard, monster detail pages, tests
 * API endpoint: /api/v1/monsters
 */
type MonsterFromAPI = components['schemas']['MonsterResource']

export interface Monster extends Omit<MonsterFromAPI, 'sources'> {
  // Override with our custom types that have better structure
  sources?: EntitySource[]
  // All other fields inherited from MonsterFromAPI
}

/**
 * Re-export nested resource types used across multiple entities
 */
export type ClassCounterResource = components['schemas']['ClassCounterResource']
export type EntityConditionResource = components['schemas']['EntityConditionResource']
export type EntityPrerequisiteResource = components['schemas']['EntityPrerequisiteResource']

/**
 * Class computed data types for detail views
 * These are pre-calculated by the backend to eliminate frontend calculations
 */
export type ClassComputedResource = components['schemas']['ClassComputedResource']

/** Pre-computed hit points with D&D 5e formulas */
export type ClassHitPoints = NonNullable<ClassComputedResource['hit_points']>

/** Pre-computed spell slot summary for caster classes */
export type ClassSpellSlotSummary = NonNullable<ClassComputedResource['spell_slot_summary']>

/** Section counts for lazy-loading accordion badges */
export type ClassSectionCounts = NonNullable<ClassComputedResource['section_counts']>

/** Pre-computed progression table with dynamic columns */
export type ClassProgressionTable = NonNullable<ClassComputedResource['progression_table']>

/**
 * Lookup/Reference types for filter dropdowns
 *
 * These are simple slug/name pairs returned by /api/v1/lookups/* endpoints.
 * Used in filter components to provide dynamic, API-driven options.
 */

/** Alignment lookup from /api/v1/lookups/alignments */
export interface Alignment {
  slug: string
  name: string
}

/** Armor type lookup from /api/v1/lookups/armor-types */
export interface ArmorType {
  slug: string
  name: string
}

/** Monster type lookup from /api/v1/lookups/monster-types */
export interface MonsterType {
  slug: string
  name: string
}

/** Rarity lookup from /api/v1/lookups/rarities */
export interface Rarity {
  slug: string
  name: string
}

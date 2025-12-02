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
    code: string
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

export interface Race extends Omit<RaceFromAPI, 'sources' | 'modifiers' | 'size' | 'is_subrace'> {
  // Override with our custom types that have better structure
  description?: string
  size?: {
    id: number
    name: string
    code: string
  }
  modifiers?: Modifier[]
  sources?: EntitySource[]

  // Override is_subrace as boolean (OpenAPI says string but API returns boolean)
  is_subrace?: boolean

  // fly_speed, swim_speed, and inherited_data now properly typed in generated.ts
  // No manual overrides needed - inherited from RaceFromAPI

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

/**
 * Counter resource for class features (Ki, Rage, etc.)
 * Note: OpenAPI spec shows progression as string, but actual API returns array.
 * We use the actual API format here.
 */
export interface CounterFromAPI {
  name: string
  reset_timing: 'Short Rest' | 'Long Rest' | 'Does Not Reset'
  progression: Array<{
    level: number
    value: number | string // Can be "Unlimited" at level 20
  }>
}

export interface CharacterClass extends Omit<CharacterClassFromAPI, 'id' | 'sources' | 'hit_die' | 'counters' | 'is_base_class' | 'subclass_level' | 'parent_class_id'> {
  // Override id as number (OpenAPI says string but character API expects number)
  id: number

  // Override with our custom types that have better structure
  sources?: EntitySource[]

  // Override hit_die as number (OpenAPI says string but API returns number)
  hit_die?: number

  // Override is_base_class as boolean (OpenAPI says string but API returns boolean)
  is_base_class?: boolean

  // Override subclass_level as number (OpenAPI says string but API returns number)
  subclass_level?: number | null

  // Override parent_class_id as number (OpenAPI says string but API returns number)
  parent_class_id?: number | null

  // Override counters with proper type (OpenAPI has unknown[])
  counters?: CounterFromAPI[]

  // All other fields inherited from CharacterClassFromAPI
  // Note: archetype, optional_features now properly typed in generated.ts
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
  sources?: EntitySource[]
  // Note: feature_name and feature_description are defined in BackgroundFromAPI (Issue #67)
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

/**
 * Monster spellcasting properties (not in OpenAPI spec yet)
 */
export interface MonsterSpellcasting {
  description?: string
  spellcasting_ability?: string
  spell_save_dc?: number
  spell_attack_bonus?: number
  spell_slots?: string
}

export interface Monster extends Omit<MonsterFromAPI, 'sources'> {
  // Override with our custom types that have better structure
  sources?: EntitySource[]
  // Spellcasting data (optional, not all monsters are spellcasters)
  spellcasting?: MonsterSpellcasting
  // All other fields inherited from MonsterFromAPI
}

/**
 * Re-export nested resource types used across multiple entities
 */
export type GroupedCounterResource = components['schemas']['GroupedCounterResource']
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

/**
 * Optional Feature resource for class customization options
 * (Eldritch Invocations, Infusions, Elemental Disciplines, etc.)
 */
export type OptionalFeatureResource = components['schemas']['OptionalFeatureResource']

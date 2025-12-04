/**
 * Search-related type definitions
 *
 * Used by: SearchInput.vue, search.vue, useSearch composable
 */

import type {
  Spell as SpellEntity,
  Item as ItemEntity,
  Race as RaceEntity,
  CharacterClass as CharacterClassEntity,
  Background as BackgroundEntity,
  Feat as FeatEntity,
  Monster as MonsterEntity
} from './api/entities'

// Re-export entity types
export type Spell = SpellEntity
export type Item = ItemEntity
export type Race = RaceEntity
export type CharacterClass = CharacterClassEntity
export type Background = BackgroundEntity
export type Feat = FeatEntity
export type Monster = MonsterEntity

/**
 * Entity type identifiers for search filtering
 *
 * Note: The API also defines these in the search endpoint query params,
 * but we keep a local type for better DX and to match our entity names.
 */
export type EntityType = 'spells' | 'items' | 'races' | 'classes' | 'backgrounds' | 'feats' | 'monsters'

/**
 * Search options for filtering and limiting results
 */
export interface SearchOptions {
  /** Filter by specific entity types */
  types?: EntityType[]
  /** Maximum number of results per entity type */
  limit?: number
}

/**
 * Minimal entity interface for search results
 */
export interface SearchEntity {
  id: number
  name: string
  slug: string
}

// Alias for backward compatibility
export type Class = CharacterClass

/**
 * Search result data structure
 *
 * Uses our extended entity types (Spell, Item, etc.) which have
 * corrected field types compared to the raw API resource types.
 *
 * Note: Cannot directly use SearchResource['data'] from OpenAPI because:
 * - API returns RaceResource with is_subrace: string (should be boolean)
 * - API returns ClassResource with id: string (should be number)
 * - Frontend components expect our extended types
 *
 * @see Issue #159 for backend OpenAPI spec fixes
 */
export interface SearchResultData {
  spells?: Spell[]
  items?: Item[]
  races?: Race[]
  classes?: CharacterClass[]
  backgrounds?: Background[]
  feats?: Feat[]
  monsters?: Monster[]
}

/**
 * Complete search result from API
 *
 * Note: The API has a SearchResource type but we use our own
 * interface to ensure entity types match our extended types.
 */
export interface SearchResult {
  data: SearchResultData
  meta?: {
    query: string
    total_results: number
    types_searched: EntityType[]
  }
}

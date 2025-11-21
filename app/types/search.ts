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
  Feat as FeatEntity
} from './api/entities'

// Re-export entity types
export type Spell = SpellEntity
export type Item = ItemEntity
export type Race = RaceEntity
export type CharacterClass = CharacterClassEntity
export type Background = BackgroundEntity
export type Feat = FeatEntity

/**
 * Entity type identifiers for search filtering
 */
export type EntityType = 'spells' | 'items' | 'races' | 'classes' | 'backgrounds' | 'feats'

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
 */
export interface SearchResultData {
  spells?: Spell[]
  items?: Item[]
  races?: Race[]
  classes?: CharacterClass[]
  backgrounds?: Background[]
  feats?: Feat[]
}

/**
 * Complete search result from API
 */
export interface SearchResult {
  data: SearchResultData
  meta?: {
    query: string
    total_results: number
    types_searched: EntityType[]
  }
}

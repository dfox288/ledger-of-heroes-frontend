/**
 * Search-related type definitions
 *
 * Used by: SearchInput.vue, search.vue, useSearch composable
 */

// Re-export entity types for convenience
export type { Spell, Item } from './api/entities'

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

/**
 * Race entity (minimal for search)
 */
export interface Race extends SearchEntity {
  size?: string
  speed?: number
}

/**
 * Class entity (minimal for search)
 * Exported as CharacterClass to avoid conflicts with JS keyword 'class'
 */
export interface CharacterClass extends SearchEntity {
  hit_dice?: string
}

// Alias for backward compatibility
export type Class = CharacterClass

/**
 * Background entity (minimal for search)
 */
export interface Background extends SearchEntity {
  description?: string
}

/**
 * Feat entity (minimal for search)
 */
export interface Feat extends SearchEntity {
  prerequisite?: string
  description?: string
}

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

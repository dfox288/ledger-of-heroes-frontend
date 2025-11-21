/**
 * Centralized type exports
 *
 * Import types using: import type { Source, AbilityScore } from '~/types'
 *
 * This barrel file provides a single import point for all shared types,
 * making it easy to use types across the application.
 */

// API types
export type { Source, AbilityScore, Modifier, Tag } from './api/common'
export type { Spell, Item, Race, CharacterClass } from './api/entities'

// Search types
export type { SearchResult, SearchResultData, EntityType, SearchOptions, SearchEntity, Class, Background, Feat } from './search'

// API Response types
export interface ApiListResponse<T = any> {
  data: T[]
  meta?: {
    total: number
    from: number
    to: number
    current_page: number
    last_page: number
    per_page: number
  }
}

export interface ApiSingleResponse<T = any> {
  data: T
}

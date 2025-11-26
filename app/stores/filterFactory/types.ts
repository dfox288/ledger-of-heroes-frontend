// app/stores/filterFactory/types.ts

/**
 * Supported filter field types:
 * - 'stringArray': string[] - multiple string selections (e.g., selectedLevels, selectedSources)
 * - 'numberArray': number[] - multiple number selections (e.g., selectedHitDice)
 * - 'string': string | null - single string value (e.g., concentrationFilter: '1' | '0' | null)
 * - 'number': number | null - single number value (e.g., selectedSchool: 5 | null)
 * - 'emptyString': string - single string with '' as empty (e.g., selectedSize: 'M' | '')
 */
export type FilterFieldType = 'stringArray' | 'numberArray' | 'string' | 'number' | 'emptyString'

/**
 * Definition for a single filter field.
 * Used by the factory to generate state, getters, and actions.
 */
export interface FilterFieldDefinition {
  /** State property name (e.g., 'selectedLevels') */
  name: string
  /** URL query parameter key (e.g., 'level') */
  urlKey: string
  /** Field value type - determines parsing and empty-checking logic */
  type: FilterFieldType
  /** Default value when store is reset */
  defaultValue: string[] | number[] | string | number | null
  /** Whether to persist in IndexedDB (default: true) */
  persist?: boolean
}

/**
 * Configuration for creating an entity filter store.
 */
export interface EntityFilterStoreConfig {
  /** Pinia store name (e.g., 'spellFilters') */
  name: string
  /** Storage key for IndexedDB persistence */
  storageKey: string
  /** Entity-specific filter field definitions */
  fields: FilterFieldDefinition[]
}

/**
 * Base state shared by all entity filter stores.
 * These fields are NOT configured per-entity.
 */
export interface BaseFilterState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  filtersOpen: boolean
}

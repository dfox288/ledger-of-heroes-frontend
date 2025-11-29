// app/stores/filterFactory/createEntityFilterStore.ts
import { defineStore } from 'pinia'
import type { LocationQuery } from 'vue-router'
import { idbStorage } from '~/utils/idbStorage'
import type { EntityFilterStoreConfig, BaseFilterState, FilterFieldDefinition } from './types'
import { isFieldEmpty, countFieldValue, fieldToUrlValue, urlValueToField } from './utils'

/**
 * Creates a Pinia store for entity filtering with URL sync and persistence.
 *
 * @param config - Store configuration with name, storage key, and field definitions
 * @returns A Pinia store definition function (useXxxFiltersStore)
 *
 * @example
 * ```ts
 * export const useSpellFiltersStore = createEntityFilterStore<SpellFiltersState>({
 *   name: 'spellFilters',
 *   storageKey: 'dnd-filters-spells',
 *   fields: [
 *     { name: 'selectedLevels', urlKey: 'level', type: 'stringArray', defaultValue: [] },
 *     { name: 'selectedSchool', urlKey: 'school', type: 'number', defaultValue: null },
 *   ]
 * })
 * ```
 */
export function createEntityFilterStore<T extends BaseFilterState = BaseFilterState>(
  config: EntityFilterStoreConfig
) {
  // Build default state from base + config fields
  const defaultEntityState: Record<string, unknown> = {}
  for (const field of config.fields) {
    defaultEntityState[field.name] = field.defaultValue
  }

  const DEFAULT_STATE = {
    // Base state (same for all entities)
    searchQuery: '',
    sortBy: 'name',
    sortDirection: 'asc' as const,
    selectedSources: [] as string[],
    filtersOpen: false,
    // Entity-specific state from config
    ...defaultEntityState
  } as T

  // Type-safe field access helper - cast state to Record for dynamic field access
  const getFieldValue = (state: unknown, field: FilterFieldDefinition): unknown => {
    return (state as Record<string, unknown>)[field.name]
  }

  return defineStore(config.name, {
    state: (): T => ({
      ...DEFAULT_STATE,
      // Deep clone arrays to prevent reference sharing
      selectedSources: [],
      ...Object.fromEntries(
        config.fields.map(f =>
          [f.name, Array.isArray(f.defaultValue) ? [...f.defaultValue] : f.defaultValue]
        )
      )
    } as T),

    getters: {
      hasActiveFilters: (state): boolean => {
        // Check base fields
        if (state.searchQuery !== '') return true
        if (state.selectedSources.length > 0) return true

        // Check entity-specific fields
        for (const field of config.fields) {
          if (!isFieldEmpty(field, getFieldValue(state, field))) {
            return true
          }
        }

        return false
      },

      activeFilterCount: (state): number => {
        let count = 0

        // Count sources (but not searchQuery)
        count += state.selectedSources.length

        // Count entity-specific fields
        for (const field of config.fields) {
          count += countFieldValue(field, getFieldValue(state, field))
        }

        return count
      },

      toUrlQuery: (state): Record<string, string | string[]> => {
        const query: Record<string, string | string[]> = {}

        // Entity-specific fields
        for (const field of config.fields) {
          const value = getFieldValue(state, field)
          if (!isFieldEmpty(field, value)) {
            query[field.urlKey] = fieldToUrlValue(field, value)
          }
        }

        // Sources
        if (state.selectedSources.length > 0) {
          query.source = state.selectedSources
        }

        // Sort (only if non-default)
        if (state.sortBy !== 'name') {
          query.sort_by = state.sortBy
        }
        if (state.sortDirection !== 'asc') {
          query.sort_direction = state.sortDirection
        }

        return query
      }
    },

    actions: {
      clearAll() {
        // Preserve filtersOpen (UI preference)
        const filtersOpen = this.filtersOpen
        this.$reset()
        this.filtersOpen = filtersOpen
      },

      setFromUrlQuery(query: LocationQuery) {
        // Parse entity-specific fields
        for (const field of config.fields) {
          const urlValue = query[field.urlKey]
          if (urlValue !== undefined && urlValue !== null) {
            (this as unknown as Record<string, unknown>)[field.name] = urlValueToField(field, urlValue as string | string[])
          }
        }

        // Parse sources
        if (query.source) {
          this.selectedSources = Array.isArray(query.source)
            ? query.source.map(String)
            : [String(query.source)]
        }

        // Parse sort
        if (query.sort_by) {
          this.sortBy = String(query.sort_by)
        }
        if (query.sort_direction) {
          this.sortDirection = query.sort_direction as 'asc' | 'desc'
        }
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    persist: {
      key: config.storageKey,
      storage: idbStorage,
      // Persist all fields except searchQuery
      paths: [
        'sortBy',
        'sortDirection',
        'selectedSources',
        'filtersOpen',
        ...config.fields.filter(f => f.persist !== false).map(f => f.name)
      ]
    } as any
  })
}

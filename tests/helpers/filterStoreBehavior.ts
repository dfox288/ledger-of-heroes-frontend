import { describe, it, expect } from 'vitest'

/**
 * Filter Store Behavior Test Generators
 *
 * These helpers generate repetitive test suites for Pinia filter stores.
 * They encode common patterns that are repeated across all 7 entity filter stores.
 *
 * Usage:
 * ```typescript
 * import { usePiniaSetup } from '#tests/helpers/storeSetup'
 * import { testHasActiveFilters, testActiveFilterCount, testClearAllAction, testUrlQuerySync } from '#tests/helpers/filterStoreBehavior'
 * import { useSpellFiltersStore } from '~/stores/spellFilters'
 *
 * describe('useSpellFiltersStore', () => {
 *   usePiniaSetup()
 *
 *   testHasActiveFilters(useSpellFiltersStore, [
 *     { field: 'searchQuery', value: 'fireball' },
 *     { field: 'selectedLevels', value: ['3'] },
 *     // ...
 *   ])
 *
 *   testActiveFilterCount(useSpellFiltersStore, {
 *     setup: (store) => {
 *       store.selectedLevels = ['3', '5']
 *       store.selectedSchool = 5
 *     },
 *     expectedCount: 3
 *   })
 * })
 * ```
 *
 * Benefits:
 * - Reduces ~14 tests per store to ~15 lines of config
 * - Ensures consistent test coverage across all stores
 * - Makes adding new filters trivial (just add to config array)
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for a single filter field test
 */
export interface FilterFieldTest {
  /** The store property name to set */
  field: string
  /** The value to set (triggers hasActiveFilters = true) */
  value: unknown
  /** Optional human-readable label for test output */
  label?: string
}

/**
 * Configuration for activeFilterCount test
 */
export interface ActiveFilterCountTest {
  /** Function to set up multiple filters on the store */
  setup: (store: Record<string, unknown>) => void
  /** Expected count after setup */
  expectedCount: number
  /** Optional description for the test */
  description?: string
}

/**
 * Configuration for URL query sync tests
 */
export interface UrlQueryTestCase {
  /** Human-readable name for the test case */
  name: string
  /** URL query object to parse */
  query: Record<string, string | string[]>
  /** Expected store state after parsing */
  expectedState: Record<string, unknown>
}

/**
 * Configuration for clearAll action test
 */
export interface ClearAllTestConfig {
  /** Function to set all filters to non-default values */
  setFilters: (store: Record<string, unknown>) => void
  /** Expected state after clearAll (fields that should be reset) */
  expectedDefaults: Record<string, unknown>
  /** Fields that should NOT be reset (e.g., filtersOpen) */
  preservedFields?: Array<{ field: string, value: unknown }>
}

/**
 * Configuration for toUrlQuery getter test
 */
export interface ToUrlQueryTestCase {
  /** Human-readable name for the test case */
  name: string
  /** Function to set store state */
  setup: (store: Record<string, unknown>) => void
  /** Expected URL query output */
  expectedQuery: Record<string, unknown>
}

// ============================================================================
// Test Generators
// ============================================================================

/**
 * Generates hasActiveFilters getter tests for a filter store.
 *
 * Tests that:
 * - Returns false when no filters are active (initial state)
 * - Returns true when each specified field has a value
 *
 * @param createStore - Factory function that returns a fresh store instance
 * @param fields - Array of field configurations to test
 *
 * @example
 * testHasActiveFilters(useSpellFiltersStore, [
 *   { field: 'searchQuery', value: 'fireball' },
 *   { field: 'selectedLevels', value: ['3'] },
 *   { field: 'selectedSchool', value: 5 },
 *   { field: 'concentrationFilter', value: '1' },
 * ])
 */
export function testHasActiveFilters<T extends { hasActiveFilters: boolean }>(
  createStore: () => T,
  fields: FilterFieldTest[]
): void {
  describe('hasActiveFilters getter', () => {
    it('returns false when no filters active', () => {
      const store = createStore()
      expect(store.hasActiveFilters).toBe(false)
    })

    for (const { field, value, label } of fields) {
      it(`returns true when ${label || field} is set`, () => {
        const store = createStore()
        ;(store as Record<string, unknown>)[field] = value
        expect(store.hasActiveFilters).toBe(true)
      })
    }
  })
}

/**
 * Generates activeFilterCount getter tests for a filter store.
 *
 * @param createStore - Factory function that returns a fresh store instance
 * @param testCases - Array of test configurations
 *
 * @example
 * testActiveFilterCount(useSpellFiltersStore, [
 *   {
 *     description: 'counts each active filter',
 *     setup: (store) => {
 *       store.selectedLevels = ['3', '5']
 *       store.selectedSchool = 5
 *     },
 *     expectedCount: 3
 *   },
 *   {
 *     description: 'does not count searchQuery',
 *     setup: (store) => { store.searchQuery = 'fireball' },
 *     expectedCount: 0
 *   }
 * ])
 */
export function testActiveFilterCount<T extends { activeFilterCount: number }>(
  createStore: () => T,
  testCases: ActiveFilterCountTest[]
): void {
  describe('activeFilterCount getter', () => {
    it('returns 0 when no filters active', () => {
      const store = createStore()
      expect(store.activeFilterCount).toBe(0)
    })

    for (const { setup, expectedCount, description } of testCases) {
      it(description || `returns ${expectedCount} when filters are set`, () => {
        const store = createStore()
        setup(store as Record<string, unknown>)
        expect(store.activeFilterCount).toBe(expectedCount)
      })
    }
  })
}

/**
 * Generates clearAll action tests for a filter store.
 *
 * Tests that:
 * - All filter fields are reset to their default values
 * - Preserved fields (like filtersOpen) are NOT reset
 *
 * @param createStore - Factory function that returns a fresh store instance
 * @param config - Test configuration
 *
 * @example
 * testClearAllAction(useSpellFiltersStore, {
 *   setFilters: (store) => {
 *     store.searchQuery = 'fireball'
 *     store.selectedLevels = ['3']
 *     store.filtersOpen = true
 *   },
 *   expectedDefaults: {
 *     searchQuery: '',
 *     selectedLevels: [],
 *     selectedSchool: null
 *   },
 *   preservedFields: [{ field: 'filtersOpen', value: true }]
 * })
 */
export function testClearAllAction<T extends { clearAll: () => void }>(
  createStore: () => T,
  config: ClearAllTestConfig
): void {
  describe('clearAll action', () => {
    it('resets all filters to defaults', () => {
      const store = createStore()
      config.setFilters(store as Record<string, unknown>)
      store.clearAll()

      for (const [key, expected] of Object.entries(config.expectedDefaults)) {
        expect((store as Record<string, unknown>)[key]).toEqual(expected)
      }
    })

    if (config.preservedFields && config.preservedFields.length > 0) {
      for (const { field, value } of config.preservedFields) {
        it(`preserves ${field} state`, () => {
          const store = createStore()
          ;(store as Record<string, unknown>)[field] = value
          store.clearAll()
          expect((store as Record<string, unknown>)[field]).toBe(value)
        })
      }
    }
  })
}

/**
 * Generates setFromUrlQuery action tests for a filter store.
 *
 * @param createStore - Factory function that returns a fresh store instance
 * @param testCases - Array of test configurations
 *
 * @example
 * testSetFromUrlQuery(useSpellFiltersStore, [
 *   {
 *     name: 'parses level array',
 *     query: { level: ['3', '5'] },
 *     expectedState: { selectedLevels: ['3', '5'] }
 *   },
 *   {
 *     name: 'parses single value as array',
 *     query: { level: '3' },
 *     expectedState: { selectedLevels: ['3'] }
 *   }
 * ])
 */
export function testSetFromUrlQuery<T extends { setFromUrlQuery: (query: Record<string, unknown>) => void }>(
  createStore: () => T,
  testCases: UrlQueryTestCase[]
): void {
  describe('setFromUrlQuery action', () => {
    for (const { name, query, expectedState } of testCases) {
      it(`handles ${name}`, () => {
        const store = createStore()
        store.setFromUrlQuery(query)

        for (const [key, expected] of Object.entries(expectedState)) {
          expect((store as Record<string, unknown>)[key]).toEqual(expected)
        }
      })
    }
  })
}

/**
 * Generates toUrlQuery getter tests for a filter store.
 *
 * @param createStore - Factory function that returns a fresh store instance
 * @param testCases - Array of test configurations
 *
 * @example
 * testToUrlQuery(useSpellFiltersStore, [
 *   {
 *     name: 'returns empty object when no filters active',
 *     setup: () => {},
 *     expectedQuery: {}
 *   },
 *   {
 *     name: 'includes active filters',
 *     setup: (store) => {
 *       store.selectedLevels = ['3']
 *       store.selectedSchool = 5
 *     },
 *     expectedQuery: { level: ['3'], school: '5' }
 *   }
 * ])
 */
export function testToUrlQuery<T extends { toUrlQuery: Record<string, unknown> }>(
  createStore: () => T,
  testCases: ToUrlQueryTestCase[]
): void {
  describe('toUrlQuery getter', () => {
    for (const { name, setup, expectedQuery } of testCases) {
      it(name, () => {
        const store = createStore()
        setup(store as Record<string, unknown>)
        expect(store.toUrlQuery).toEqual(expectedQuery)
      })
    }
  })
}

/**
 * Generates initial state tests for a filter store.
 *
 * @param createStore - Factory function that returns a fresh store instance
 * @param expectedDefaults - Object mapping field names to their expected default values
 *
 * @example
 * testInitialState(useSpellFiltersStore, {
 *   searchQuery: '',
 *   sortBy: 'name',
 *   sortDirection: 'asc',
 *   selectedLevels: [],
 *   selectedSchool: null,
 *   filtersOpen: false
 * })
 */
export function testInitialState<T>(
  createStore: () => T,
  expectedDefaults: Record<string, unknown>
): void {
  describe('initial state', () => {
    it('initializes with default values', () => {
      const store = createStore()

      for (const [key, expected] of Object.entries(expectedDefaults)) {
        expect((store as Record<string, unknown>)[key]).toEqual(expected)
      }
    })
  })
}

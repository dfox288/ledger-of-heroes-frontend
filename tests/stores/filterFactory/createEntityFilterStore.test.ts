// tests/stores/filterFactory/createEntityFilterStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createEntityFilterStore } from '~/stores/filterFactory/createEntityFilterStore'
import type { EntityFilterStoreConfig } from '~/stores/filterFactory/types'

// Simple test store config
const testConfig: EntityFilterStoreConfig = {
  name: 'testFilters',
  storageKey: 'test-filters',
  fields: [
    { name: 'selectedLevels', urlKey: 'level', type: 'stringArray', defaultValue: [] },
    { name: 'selectedSchool', urlKey: 'school', type: 'number', defaultValue: null },
    { name: 'concentrationFilter', urlKey: 'concentration', type: 'string', defaultValue: null },
    { name: 'selectedSize', urlKey: 'size', type: 'emptyString', defaultValue: '' },
    { name: 'selectedHitDice', urlKey: 'hit_die', type: 'numberArray', defaultValue: [] }
  ]
}

describe('createEntityFilterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('state initialization', () => {
    it('creates store with base state', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.filtersOpen).toBe(false)
    })

    it('creates store with entity-specific fields from config', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      expect(store.selectedLevels).toEqual([])
      expect(store.selectedSchool).toBeNull()
      expect(store.concentrationFilter).toBeNull()
      expect(store.selectedSize).toBe('')
      expect(store.selectedHitDice).toEqual([])
    })
  })

  describe('hasActiveFilters getter', () => {
    it('returns false when no filters active', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      expect(store.hasActiveFilters).toBe(false)
    })

    it('returns true when searchQuery has value', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.searchQuery = 'test'

      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSources has values', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedSources = ['PHB']

      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when stringArray field has values', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedLevels = ['3']

      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when number field is set', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedSchool = 5

      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when string field is set', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.concentrationFilter = '1'

      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when emptyString field has value', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedSize = 'M'

      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when numberArray field has values', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedHitDice = [6, 8]

      expect(store.hasActiveFilters).toBe(true)
    })
  })

  describe('activeFilterCount getter', () => {
    it('returns 0 when no filters active', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      expect(store.activeFilterCount).toBe(0)
    })

    it('does not count searchQuery', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.searchQuery = 'test'

      expect(store.activeFilterCount).toBe(0)
    })

    it('counts array lengths and single values', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedSources = ['PHB', 'XGE']  // 2
      store.selectedLevels = ['1', '2', '3']   // 3
      store.selectedSchool = 5                  // 1
      store.concentrationFilter = '1'           // 1
      store.selectedSize = 'M'                  // 1
      store.selectedHitDice = [6, 8]           // 2

      expect(store.activeFilterCount).toBe(10)
    })
  })

  describe('toUrlQuery getter', () => {
    it('returns empty object when no filters active', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      expect(store.toUrlQuery).toEqual({})
    })

    it('includes active entity filters in URL query', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedLevels = ['3', '5']
      store.selectedSchool = 5
      store.concentrationFilter = '1'
      store.selectedSize = 'M'
      store.selectedHitDice = [6, 8]

      const query = store.toUrlQuery
      expect(query.level).toEqual(['3', '5'])
      expect(query.school).toBe('5')
      expect(query.concentration).toBe('1')
      expect(query.size).toBe('M')
      expect(query.hit_die).toEqual(['6', '8'])
    })

    it('includes sources in URL query', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.selectedSources = ['PHB']

      expect(store.toUrlQuery.source).toEqual(['PHB'])
    })

    it('includes non-default sort values', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.sortBy = 'level'
      store.sortDirection = 'desc'

      expect(store.toUrlQuery.sort_by).toBe('level')
      expect(store.toUrlQuery.sort_direction).toBe('desc')
    })

    it('excludes default sort values', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      expect(store.toUrlQuery.sort_by).toBeUndefined()
      expect(store.toUrlQuery.sort_direction).toBeUndefined()
    })
  })

  describe('clearAll action', () => {
    it('resets all filters to defaults', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      store.searchQuery = 'test'
      store.sortBy = 'level'
      store.selectedSources = ['PHB']
      store.selectedLevels = ['3']
      store.selectedSchool = 5
      store.filtersOpen = true

      store.clearAll()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.selectedSources).toEqual([])
      expect(store.selectedLevels).toEqual([])
      expect(store.selectedSchool).toBeNull()
    })

    it('preserves filtersOpen state', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()
      store.filtersOpen = true
      store.searchQuery = 'test'

      store.clearAll()

      expect(store.filtersOpen).toBe(true)
    })
  })

  describe('setFromUrlQuery action', () => {
    it('sets filters from URL query', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      store.setFromUrlQuery({
        level: ['3', '5'],
        school: '5',
        concentration: '1',
        size: 'M',
        hit_die: ['6', '8'],
        source: 'PHB',
        sort_by: 'level',
        sort_direction: 'desc'
      })

      expect(store.selectedLevels).toEqual(['3', '5'])
      expect(store.selectedSchool).toBe(5)
      expect(store.concentrationFilter).toBe('1')
      expect(store.selectedSize).toBe('M')
      expect(store.selectedHitDice).toEqual([6, 8])
      expect(store.selectedSources).toEqual(['PHB'])
      expect(store.sortBy).toBe('level')
      expect(store.sortDirection).toBe('desc')
    })

    it('handles single values as arrays for array types', () => {
      const useStore = createEntityFilterStore(testConfig)
      const store = useStore()

      store.setFromUrlQuery({ level: '3' })
      expect(store.selectedLevels).toEqual(['3'])

      store.setFromUrlQuery({ source: 'PHB' })
      expect(store.selectedSources).toEqual(['PHB'])
    })
  })
})

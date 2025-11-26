import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRaceFiltersStore } from '~/stores/raceFilters'

describe('useRaceFiltersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('initializes with default values', () => {
      const store = useRaceFiltersStore()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.selectedSize).toBe('')
      expect(store.selectedSpeedRange).toBeNull()
      expect(store.selectedParentRace).toBe('')
      expect(store.raceTypeFilter).toBeNull()
      expect(store.hasInnateSpellsFilter).toBeNull()
      expect(store.selectedAbilityBonuses).toEqual([])
      expect(store.filtersOpen).toBe(false)
    })
  })

  describe('hasActiveFilters getter', () => {
    it('returns false when no filters active', () => {
      const store = useRaceFiltersStore()
      expect(store.hasActiveFilters).toBe(false)
    })

    it('returns true when searchQuery has value', () => {
      const store = useRaceFiltersStore()
      store.searchQuery = 'elf'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSize is set', () => {
      const store = useRaceFiltersStore()
      store.selectedSize = 'M'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSpeedRange is set', () => {
      const store = useRaceFiltersStore()
      store.selectedSpeedRange = '30'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when raceTypeFilter is set', () => {
      const store = useRaceFiltersStore()
      store.raceTypeFilter = '0'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSources has values', () => {
      const store = useRaceFiltersStore()
      store.selectedSources = ['PHB']
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedAbilityBonuses has values', () => {
      const store = useRaceFiltersStore()
      store.selectedAbilityBonuses = ['STR']
      expect(store.hasActiveFilters).toBe(true)
    })
  })

  describe('activeFilterCount getter', () => {
    it('returns 0 when no filters active', () => {
      const store = useRaceFiltersStore()
      expect(store.activeFilterCount).toBe(0)
    })

    it('counts each active filter', () => {
      const store = useRaceFiltersStore()
      store.selectedSize = 'M'
      store.selectedSpeedRange = '30'
      store.raceTypeFilter = '0'
      store.hasInnateSpellsFilter = '1'
      store.selectedSources = ['PHB', 'VGTM']
      store.selectedAbilityBonuses = ['STR', 'DEX']
      store.selectedParentRace = 'Elf'

      // selectedSize (1) + selectedSpeedRange (1) + raceTypeFilter (1) +
      // hasInnateSpellsFilter (1) + sources (2) + abilities (2) + parentRace (1) = 9
      expect(store.activeFilterCount).toBe(9)
    })

    it('does not count searchQuery in filter count', () => {
      const store = useRaceFiltersStore()
      store.searchQuery = 'elf'
      expect(store.activeFilterCount).toBe(0)
    })

    it('does not count empty strings or null values', () => {
      const store = useRaceFiltersStore()
      store.selectedSize = ''
      store.selectedSpeedRange = null
      store.selectedParentRace = ''
      store.raceTypeFilter = null
      expect(store.activeFilterCount).toBe(0)
    })
  })

  describe('clearAll action', () => {
    it('resets all filters to defaults', () => {
      const store = useRaceFiltersStore()

      // Set various filters
      store.searchQuery = 'elf'
      store.sortBy = 'speed'
      store.sortDirection = 'desc'
      store.selectedSources = ['PHB']
      store.selectedSize = 'M'
      store.selectedSpeedRange = '30'
      store.selectedParentRace = 'Elf'
      store.raceTypeFilter = '0'
      store.hasInnateSpellsFilter = '1'
      store.selectedAbilityBonuses = ['STR']
      store.filtersOpen = true

      store.clearAll()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.selectedSize).toBe('')
      expect(store.selectedSpeedRange).toBeNull()
      expect(store.selectedParentRace).toBe('')
      expect(store.raceTypeFilter).toBeNull()
      expect(store.hasInnateSpellsFilter).toBeNull()
      expect(store.selectedAbilityBonuses).toEqual([])
      // filtersOpen should NOT be reset (UI preference)
      expect(store.filtersOpen).toBe(true)
    })
  })

  describe('setFromUrlQuery action', () => {
    it('sets filters from URL query object', () => {
      const store = useRaceFiltersStore()

      store.setFromUrlQuery({
        size: 'M',
        speed: '30',
        parent_race: 'Elf',
        race_type: '0',
        has_innate_spells: '1',
        ability: ['STR', 'DEX'],
        source: 'PHB',
        sort_by: 'speed',
        sort_direction: 'desc'
      })

      expect(store.selectedSize).toBe('M')
      expect(store.selectedSpeedRange).toBe('30')
      expect(store.selectedParentRace).toBe('Elf')
      expect(store.raceTypeFilter).toBe('0')
      expect(store.hasInnateSpellsFilter).toBe('1')
      expect(store.selectedAbilityBonuses).toEqual(['STR', 'DEX'])
      expect(store.selectedSources).toEqual(['PHB'])
      expect(store.sortBy).toBe('speed')
      expect(store.sortDirection).toBe('desc')
    })

    it('handles array vs string query params', () => {
      const store = useRaceFiltersStore()

      // Single value as string
      store.setFromUrlQuery({ ability: 'STR' })
      expect(store.selectedAbilityBonuses).toEqual(['STR'])

      // Multiple values as array
      store.setFromUrlQuery({ ability: ['STR', 'DEX'] })
      expect(store.selectedAbilityBonuses).toEqual(['STR', 'DEX'])
    })

    it('handles missing query params gracefully', () => {
      const store = useRaceFiltersStore()

      // Set some values first
      store.selectedSize = 'M'
      store.selectedSources = ['PHB']

      // Query with only some params - should not clear existing values
      store.setFromUrlQuery({ speed: '30' })

      expect(store.selectedSpeedRange).toBe('30')
      expect(store.selectedSize).toBe('M') // Still set from before
      expect(store.selectedSources).toEqual(['PHB']) // Still set from before
    })
  })

  describe('toUrlQuery getter', () => {
    it('returns empty object when no filters active', () => {
      const store = useRaceFiltersStore()
      expect(store.toUrlQuery).toEqual({})
    })

    it('returns query object with active filters', () => {
      const store = useRaceFiltersStore()
      store.selectedSize = 'M'
      store.raceTypeFilter = '0'
      store.selectedSources = ['PHB']
      store.sortDirection = 'desc'

      expect(store.toUrlQuery).toEqual({
        size: 'M',
        race_type: '0',
        source: ['PHB'],
        sort_direction: 'desc'
      })
    })

    it('excludes default sort values', () => {
      const store = useRaceFiltersStore()
      // Default sort - should not appear in URL
      expect(store.toUrlQuery).toEqual({})

      // Non-default sort - should appear
      store.sortBy = 'speed'
      expect(store.toUrlQuery).toEqual({ sort_by: 'speed' })
    })

    it('excludes empty strings and null values', () => {
      const store = useRaceFiltersStore()
      store.selectedSize = ''
      store.selectedSpeedRange = null
      store.selectedParentRace = ''
      store.raceTypeFilter = null

      expect(store.toUrlQuery).toEqual({})
    })

    it('includes all active filters in URL format', () => {
      const store = useRaceFiltersStore()
      store.selectedSize = 'M'
      store.selectedSpeedRange = '30'
      store.selectedParentRace = 'Elf'
      store.raceTypeFilter = '0'
      store.hasInnateSpellsFilter = '1'
      store.selectedAbilityBonuses = ['STR', 'DEX']
      store.selectedSources = ['PHB', 'VGTM']

      expect(store.toUrlQuery).toEqual({
        size: 'M',
        speed: '30',
        parent_race: 'Elf',
        race_type: '0',
        has_innate_spells: '1',
        ability: ['STR', 'DEX'],
        source: ['PHB', 'VGTM']
      })
    })
  })
})

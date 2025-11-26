import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClassFiltersStore } from '~/stores/classFilters'

describe('useClassFiltersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('initializes with default values', () => {
      const store = useClassFiltersStore()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.isBaseClass).toBeNull()
      expect(store.isSpellcaster).toBeNull()
      expect(store.selectedHitDice).toEqual([])
      expect(store.selectedSpellcastingAbility).toBeNull()
      expect(store.selectedParentClass).toBeNull()
      expect(store.filtersOpen).toBe(false)
    })
  })

  describe('hasActiveFilters getter', () => {
    it('returns false when no filters active', () => {
      const store = useClassFiltersStore()
      expect(store.hasActiveFilters).toBe(false)
    })

    it('returns true when searchQuery has value', () => {
      const store = useClassFiltersStore()
      store.searchQuery = 'wizard'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when isBaseClass is set', () => {
      const store = useClassFiltersStore()
      store.isBaseClass = '1'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when isSpellcaster is set', () => {
      const store = useClassFiltersStore()
      store.isSpellcaster = '1'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSources has values', () => {
      const store = useClassFiltersStore()
      store.selectedSources = ['PHB']
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedHitDice has values', () => {
      const store = useClassFiltersStore()
      store.selectedHitDice = [6]
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSpellcastingAbility is set', () => {
      const store = useClassFiltersStore()
      store.selectedSpellcastingAbility = 'INT'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedParentClass is set', () => {
      const store = useClassFiltersStore()
      store.selectedParentClass = 'Fighter'
      expect(store.hasActiveFilters).toBe(true)
    })
  })

  describe('activeFilterCount getter', () => {
    it('returns 0 when no filters active', () => {
      const store = useClassFiltersStore()
      expect(store.activeFilterCount).toBe(0)
    })

    it('counts each active filter', () => {
      const store = useClassFiltersStore()
      store.isBaseClass = '1'
      store.isSpellcaster = '0'
      store.selectedSources = ['PHB', 'XGTE']
      store.selectedHitDice = [6, 8]
      store.selectedSpellcastingAbility = 'INT'
      store.selectedParentClass = 'Fighter'

      // isBaseClass (1) + isSpellcaster (1) + sources (2) + hitDice (2) + spellcastingAbility (1) + parentClass (1) = 8
      expect(store.activeFilterCount).toBe(8)
    })

    it('does not count searchQuery in filter count', () => {
      const store = useClassFiltersStore()
      store.searchQuery = 'wizard'
      expect(store.activeFilterCount).toBe(0)
    })
  })

  describe('clearAll action', () => {
    it('resets all filters to defaults', () => {
      const store = useClassFiltersStore()

      // Set various filters
      store.searchQuery = 'wizard'
      store.sortBy = 'hit_die'
      store.sortDirection = 'desc'
      store.selectedSources = ['PHB']
      store.isBaseClass = '1'
      store.isSpellcaster = '0'
      store.selectedHitDice = [6]
      store.selectedSpellcastingAbility = 'INT'
      store.selectedParentClass = 'Fighter'
      store.filtersOpen = true

      store.clearAll()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.isBaseClass).toBeNull()
      expect(store.isSpellcaster).toBeNull()
      expect(store.selectedHitDice).toEqual([])
      expect(store.selectedSpellcastingAbility).toBeNull()
      expect(store.selectedParentClass).toBeNull()
      // filtersOpen should NOT be reset (UI preference)
      expect(store.filtersOpen).toBe(true)
    })
  })

  describe('setFromUrlQuery action', () => {
    it('sets filters from URL query object', () => {
      const store = useClassFiltersStore()

      store.setFromUrlQuery({
        is_base_class: '1',
        is_spellcaster: '0',
        hit_die: ['6', '8'],
        spellcasting_ability: 'INT',
        parent_class_name: 'Fighter',
        source: 'PHB',
        sort_by: 'hit_die',
        sort_direction: 'desc'
      })

      expect(store.isBaseClass).toBe('1')
      expect(store.isSpellcaster).toBe('0')
      expect(store.selectedHitDice).toEqual([6, 8])
      expect(store.selectedSpellcastingAbility).toBe('INT')
      expect(store.selectedParentClass).toBe('Fighter')
      expect(store.selectedSources).toEqual(['PHB'])
      expect(store.sortBy).toBe('hit_die')
      expect(store.sortDirection).toBe('desc')
    })

    it('handles array vs string query params', () => {
      const store = useClassFiltersStore()

      // Single value as string
      store.setFromUrlQuery({ hit_die: '6' })
      expect(store.selectedHitDice).toEqual([6])

      // Multiple values as array
      store.setFromUrlQuery({ hit_die: ['6', '8'] })
      expect(store.selectedHitDice).toEqual([6, 8])
    })

    it('converts hit_die strings to numbers', () => {
      const store = useClassFiltersStore()
      store.setFromUrlQuery({ hit_die: ['6', '8', '10'] })
      expect(store.selectedHitDice).toEqual([6, 8, 10])
    })
  })

  describe('toUrlQuery getter', () => {
    it('returns empty object when no filters active', () => {
      const store = useClassFiltersStore()
      expect(store.toUrlQuery).toEqual({})
    })

    it('returns query object with active filters', () => {
      const store = useClassFiltersStore()
      store.isBaseClass = '1'
      store.selectedSources = ['PHB']
      store.sortDirection = 'desc'

      expect(store.toUrlQuery).toEqual({
        is_base_class: '1',
        source: ['PHB'],
        sort_direction: 'desc'
      })
    })

    it('excludes default sort values', () => {
      const store = useClassFiltersStore()
      // Default sort - should not appear in URL
      expect(store.toUrlQuery).toEqual({})

      // Non-default sort - should appear
      store.sortBy = 'hit_die'
      expect(store.toUrlQuery).toEqual({ sort_by: 'hit_die' })
    })

    it('converts hit_die numbers to strings', () => {
      const store = useClassFiltersStore()
      store.selectedHitDice = [6, 8, 10]
      expect(store.toUrlQuery).toEqual({
        hit_die: ['6', '8', '10']
      })
    })
  })
})

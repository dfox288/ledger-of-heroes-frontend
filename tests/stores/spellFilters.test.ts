import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSpellFiltersStore } from '~/stores/spellFilters'

describe('useSpellFiltersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('initializes with default values', () => {
      const store = useSpellFiltersStore()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.selectedLevels).toEqual([])
      expect(store.selectedSchool).toBeNull()
      expect(store.selectedClass).toBeNull()
      expect(store.concentrationFilter).toBeNull()
      expect(store.ritualFilter).toBeNull()
      expect(store.selectedDamageTypes).toEqual([])
      expect(store.selectedSavingThrows).toEqual([])
      expect(store.selectedTags).toEqual([])
      expect(store.verbalFilter).toBeNull()
      expect(store.somaticFilter).toBeNull()
      expect(store.materialFilter).toBeNull()
      expect(store.filtersOpen).toBe(false)
    })
  })

  describe('hasActiveFilters getter', () => {
    it('returns false when no filters active', () => {
      const store = useSpellFiltersStore()
      expect(store.hasActiveFilters).toBe(false)
    })

    it('returns true when searchQuery has value', () => {
      const store = useSpellFiltersStore()
      store.searchQuery = 'fireball'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedLevels has values', () => {
      const store = useSpellFiltersStore()
      store.selectedLevels = ['3']
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSchool is set', () => {
      const store = useSpellFiltersStore()
      store.selectedSchool = 5
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedClass is set', () => {
      const store = useSpellFiltersStore()
      store.selectedClass = 'wizard'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when concentrationFilter is set', () => {
      const store = useSpellFiltersStore()
      store.concentrationFilter = '1'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when ritualFilter is set', () => {
      const store = useSpellFiltersStore()
      store.ritualFilter = '0'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedDamageTypes has values', () => {
      const store = useSpellFiltersStore()
      store.selectedDamageTypes = ['FIRE']
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSavingThrows has values', () => {
      const store = useSpellFiltersStore()
      store.selectedSavingThrows = ['DEX']
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedTags has values', () => {
      const store = useSpellFiltersStore()
      store.selectedTags = ['ritual-caster']
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when verbalFilter is set', () => {
      const store = useSpellFiltersStore()
      store.verbalFilter = '1'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when somaticFilter is set', () => {
      const store = useSpellFiltersStore()
      store.somaticFilter = '1'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when materialFilter is set', () => {
      const store = useSpellFiltersStore()
      store.materialFilter = '0'
      expect(store.hasActiveFilters).toBe(true)
    })

    it('returns true when selectedSources has values', () => {
      const store = useSpellFiltersStore()
      store.selectedSources = ['PHB']
      expect(store.hasActiveFilters).toBe(true)
    })
  })

  describe('activeFilterCount getter', () => {
    it('returns 0 when no filters active', () => {
      const store = useSpellFiltersStore()
      expect(store.activeFilterCount).toBe(0)
    })

    it('counts each active filter', () => {
      const store = useSpellFiltersStore()
      store.selectedLevels = ['3', '5']
      store.selectedSchool = 5
      store.selectedClass = 'wizard'
      store.concentrationFilter = '1'
      store.ritualFilter = '0'
      store.selectedDamageTypes = ['FIRE', 'COLD']
      store.selectedSavingThrows = ['DEX']
      store.selectedSources = ['PHB', 'XGTE']
      store.selectedTags = ['ritual-caster']
      store.verbalFilter = '1'
      store.somaticFilter = '1'
      store.materialFilter = '0'

      // levels (2) + school (1) + class (1) + concentration (1) + ritual (1)
      // + damageTypes (2) + savingThrows (1) + sources (2) + tags (1)
      // + verbal (1) + somatic (1) + material (1) = 15
      expect(store.activeFilterCount).toBe(15)
    })

    it('does not count searchQuery in filter count', () => {
      const store = useSpellFiltersStore()
      store.searchQuery = 'fireball'
      expect(store.activeFilterCount).toBe(0)
    })
  })

  describe('clearAll action', () => {
    it('resets all filters to defaults', () => {
      const store = useSpellFiltersStore()

      // Set various filters
      store.searchQuery = 'fireball'
      store.sortBy = 'level'
      store.sortDirection = 'desc'
      store.selectedSources = ['PHB']
      store.selectedLevels = ['3']
      store.selectedSchool = 5
      store.selectedClass = 'wizard'
      store.concentrationFilter = '1'
      store.ritualFilter = '0'
      store.selectedDamageTypes = ['FIRE']
      store.selectedSavingThrows = ['DEX']
      store.selectedTags = ['ritual-caster']
      store.verbalFilter = '1'
      store.somaticFilter = '1'
      store.materialFilter = '0'
      store.filtersOpen = true

      store.clearAll()

      expect(store.searchQuery).toBe('')
      expect(store.sortBy).toBe('name')
      expect(store.sortDirection).toBe('asc')
      expect(store.selectedSources).toEqual([])
      expect(store.selectedLevels).toEqual([])
      expect(store.selectedSchool).toBeNull()
      expect(store.selectedClass).toBeNull()
      expect(store.concentrationFilter).toBeNull()
      expect(store.ritualFilter).toBeNull()
      expect(store.selectedDamageTypes).toEqual([])
      expect(store.selectedSavingThrows).toEqual([])
      expect(store.selectedTags).toEqual([])
      expect(store.verbalFilter).toBeNull()
      expect(store.somaticFilter).toBeNull()
      expect(store.materialFilter).toBeNull()
      // filtersOpen should NOT be reset (UI preference)
      expect(store.filtersOpen).toBe(true)
    })
  })

  describe('setFromUrlQuery action', () => {
    it('sets filters from URL query object', () => {
      const store = useSpellFiltersStore()

      store.setFromUrlQuery({
        level: ['3', '5'],
        school: '5',
        class: 'wizard',
        concentration: '1',
        ritual: '0',
        damage_type: ['FIRE', 'COLD'],
        saving_throw: 'DEX',
        source: 'PHB',
        tag: 'ritual-caster',
        has_verbal: '1',
        has_somatic: '1',
        has_material: '0',
        sort_by: 'level',
        sort_direction: 'desc'
      })

      expect(store.selectedLevels).toEqual(['3', '5'])
      expect(store.selectedSchool).toBe(5)
      expect(store.selectedClass).toBe('wizard')
      expect(store.concentrationFilter).toBe('1')
      expect(store.ritualFilter).toBe('0')
      expect(store.selectedDamageTypes).toEqual(['FIRE', 'COLD'])
      expect(store.selectedSavingThrows).toEqual(['DEX'])
      expect(store.selectedSources).toEqual(['PHB'])
      expect(store.selectedTags).toEqual(['ritual-caster'])
      expect(store.verbalFilter).toBe('1')
      expect(store.somaticFilter).toBe('1')
      expect(store.materialFilter).toBe('0')
      expect(store.sortBy).toBe('level')
      expect(store.sortDirection).toBe('desc')
    })

    it('handles array vs string query params for levels', () => {
      const store = useSpellFiltersStore()

      // Single value as string
      store.setFromUrlQuery({ level: '3' })
      expect(store.selectedLevels).toEqual(['3'])

      // Multiple values as array
      store.setFromUrlQuery({ level: ['3', '5'] })
      expect(store.selectedLevels).toEqual(['3', '5'])
    })

    it('handles array vs string query params for damage types', () => {
      const store = useSpellFiltersStore()

      // Single value as string
      store.setFromUrlQuery({ damage_type: 'FIRE' })
      expect(store.selectedDamageTypes).toEqual(['FIRE'])

      // Multiple values as array
      store.setFromUrlQuery({ damage_type: ['FIRE', 'COLD'] })
      expect(store.selectedDamageTypes).toEqual(['FIRE', 'COLD'])
    })

    it('handles numeric values for school', () => {
      const store = useSpellFiltersStore()

      store.setFromUrlQuery({ school: '5' })
      expect(store.selectedSchool).toBe(5)
    })
  })

  describe('toUrlQuery getter', () => {
    it('returns empty object when no filters active', () => {
      const store = useSpellFiltersStore()
      expect(store.toUrlQuery).toEqual({})
    })

    it('returns query object with active filters', () => {
      const store = useSpellFiltersStore()
      store.selectedLevels = ['3']
      store.selectedSchool = 5
      store.selectedClass = 'wizard'
      store.concentrationFilter = '1'
      store.selectedSources = ['PHB']
      store.sortDirection = 'desc'

      expect(store.toUrlQuery).toEqual({
        level: ['3'],
        school: '5',
        class: 'wizard',
        concentration: '1',
        source: ['PHB'],
        sort_direction: 'desc'
      })
    })

    it('excludes default sort values', () => {
      const store = useSpellFiltersStore()
      // Default sort - should not appear in URL
      expect(store.toUrlQuery).toEqual({})

      // Non-default sort - should appear
      store.sortBy = 'level'
      expect(store.toUrlQuery).toEqual({ sort_by: 'level' })
    })

    it('includes all filter types in URL query', () => {
      const store = useSpellFiltersStore()
      store.selectedLevels = ['3', '5']
      store.selectedSchool = 5
      store.selectedClass = 'wizard'
      store.concentrationFilter = '1'
      store.ritualFilter = '0'
      store.selectedDamageTypes = ['FIRE']
      store.selectedSavingThrows = ['DEX', 'WIS']
      store.selectedTags = ['ritual-caster']
      store.selectedSources = ['PHB']
      store.verbalFilter = '1'
      store.somaticFilter = '0'
      store.materialFilter = '1'

      const query = store.toUrlQuery

      expect(query.level).toEqual(['3', '5'])
      expect(query.school).toBe('5')
      expect(query.class).toBe('wizard')
      expect(query.concentration).toBe('1')
      expect(query.ritual).toBe('0')
      expect(query.damage_type).toEqual(['FIRE'])
      expect(query.saving_throw).toEqual(['DEX', 'WIS'])
      expect(query.tag).toEqual(['ritual-caster'])
      expect(query.source).toEqual(['PHB'])
      expect(query.has_verbal).toBe('1')
      expect(query.has_somatic).toBe('0')
      expect(query.has_material).toBe('1')
    })
  })
})

import { defineStore } from 'pinia'
import type { LocationQuery } from 'vue-router'
import { idbStorage } from '~/utils/idbStorage'
import { STORE_KEYS } from './types'

export interface SpellFiltersState {
  // Search & Sort
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'

  // Common filters
  selectedSources: string[]

  // Entity-specific filters
  selectedLevels: string[]
  selectedSchool: number | null
  selectedClass: string | null
  concentrationFilter: string | null
  ritualFilter: string | null
  selectedDamageTypes: string[]
  selectedSavingThrows: string[]
  selectedTags: string[]
  verbalFilter: string | null
  somaticFilter: string | null
  materialFilter: string | null

  // UI state (persisted for convenience)
  filtersOpen: boolean
}

const DEFAULT_STATE: SpellFiltersState = {
  searchQuery: '',
  sortBy: 'name',
  sortDirection: 'asc',
  selectedSources: [],
  selectedLevels: [],
  selectedSchool: null,
  selectedClass: null,
  concentrationFilter: null,
  ritualFilter: null,
  selectedDamageTypes: [],
  selectedSavingThrows: [],
  selectedTags: [],
  verbalFilter: null,
  somaticFilter: null,
  materialFilter: null,
  filtersOpen: false
}

export const useSpellFiltersStore = defineStore('spellFilters', {
  state: (): SpellFiltersState => ({ ...DEFAULT_STATE }),

  getters: {
    hasActiveFilters: (state): boolean => {
      return (
        state.searchQuery !== '' ||
        state.selectedSources.length > 0 ||
        state.selectedLevels.length > 0 ||
        state.selectedSchool !== null ||
        state.selectedClass !== null ||
        state.concentrationFilter !== null ||
        state.ritualFilter !== null ||
        state.selectedDamageTypes.length > 0 ||
        state.selectedSavingThrows.length > 0 ||
        state.selectedTags.length > 0 ||
        state.verbalFilter !== null ||
        state.somaticFilter !== null ||
        state.materialFilter !== null
      )
    },

    activeFilterCount: (state): number => {
      let count = 0
      // Don't count searchQuery - it's shown separately
      count += state.selectedSources.length
      count += state.selectedLevels.length
      if (state.selectedSchool !== null) count++
      if (state.selectedClass !== null) count++
      if (state.concentrationFilter !== null) count++
      if (state.ritualFilter !== null) count++
      count += state.selectedDamageTypes.length
      count += state.selectedSavingThrows.length
      count += state.selectedTags.length
      if (state.verbalFilter !== null) count++
      if (state.somaticFilter !== null) count++
      if (state.materialFilter !== null) count++
      return count
    },

    toUrlQuery: (state): Record<string, string | string[]> => {
      const query: Record<string, string | string[]> = {}

      if (state.selectedLevels.length > 0) {
        query.level = state.selectedLevels
      }
      if (state.selectedSchool !== null) {
        query.school = String(state.selectedSchool)
      }
      if (state.selectedClass !== null) {
        query.class = state.selectedClass
      }
      if (state.concentrationFilter !== null) {
        query.concentration = state.concentrationFilter
      }
      if (state.ritualFilter !== null) {
        query.ritual = state.ritualFilter
      }
      if (state.selectedDamageTypes.length > 0) {
        query.damage_type = state.selectedDamageTypes
      }
      if (state.selectedSavingThrows.length > 0) {
        query.saving_throw = state.selectedSavingThrows
      }
      if (state.selectedTags.length > 0) {
        query.tag = state.selectedTags
      }
      if (state.selectedSources.length > 0) {
        query.source = state.selectedSources
      }
      if (state.verbalFilter !== null) {
        query.has_verbal = state.verbalFilter
      }
      if (state.somaticFilter !== null) {
        query.has_somatic = state.somaticFilter
      }
      if (state.materialFilter !== null) {
        query.has_material = state.materialFilter
      }
      // Only include sort if non-default
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
      // Reset all except filtersOpen (UI preference)
      const filtersOpen = this.filtersOpen
      this.$reset()
      this.filtersOpen = filtersOpen
    },

    setFromUrlQuery(query: LocationQuery) {
      // Parse URL query params into store state
      if (query.level) {
        this.selectedLevels = Array.isArray(query.level)
          ? query.level.map(String)
          : [String(query.level)]
      }
      if (query.school) {
        this.selectedSchool = Number(query.school)
      }
      if (query.class) {
        this.selectedClass = String(query.class)
      }
      if (query.concentration) {
        this.concentrationFilter = String(query.concentration)
      }
      if (query.ritual) {
        this.ritualFilter = String(query.ritual)
      }
      if (query.damage_type) {
        this.selectedDamageTypes = Array.isArray(query.damage_type)
          ? query.damage_type.map(String)
          : [String(query.damage_type)]
      }
      if (query.saving_throw) {
        this.selectedSavingThrows = Array.isArray(query.saving_throw)
          ? query.saving_throw.map(String)
          : [String(query.saving_throw)]
      }
      if (query.tag) {
        this.selectedTags = Array.isArray(query.tag)
          ? query.tag.map(String)
          : [String(query.tag)]
      }
      if (query.source) {
        this.selectedSources = Array.isArray(query.source)
          ? query.source.map(String)
          : [String(query.source)]
      }
      if (query.has_verbal) {
        this.verbalFilter = String(query.has_verbal)
      }
      if (query.has_somatic) {
        this.somaticFilter = String(query.has_somatic)
      }
      if (query.has_material) {
        this.materialFilter = String(query.has_material)
      }
      if (query.sort_by) {
        this.sortBy = String(query.sort_by)
      }
      if (query.sort_direction) {
        this.sortDirection = query.sort_direction as 'asc' | 'desc'
      }
    }
  },

  persist: {
    key: STORE_KEYS.spells,
    storage: idbStorage,
    // Don't persist searchQuery - usually not wanted on reload
    paths: [
      'sortBy',
      'sortDirection',
      'selectedSources',
      'selectedLevels',
      'selectedSchool',
      'selectedClass',
      'concentrationFilter',
      'ritualFilter',
      'selectedDamageTypes',
      'selectedSavingThrows',
      'selectedTags',
      'verbalFilter',
      'somaticFilter',
      'materialFilter',
      'filtersOpen'
    ]
  }
})

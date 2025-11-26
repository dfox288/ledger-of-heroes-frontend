import { defineStore } from 'pinia'
import type { LocationQuery } from 'vue-router'
import { idbStorage } from '~/utils/idbStorage'
import { STORE_KEYS } from './types'

export interface ClassFiltersState {
  // Search & Sort
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'

  // Common filters
  selectedSources: string[]

  // Entity-specific filters
  isBaseClass: string | null
  isSpellcaster: string | null
  selectedHitDice: number[]
  selectedSpellcastingAbility: string | null
  selectedParentClass: string | null

  // UI state (persisted for convenience)
  filtersOpen: boolean
}

const DEFAULT_STATE: ClassFiltersState = {
  searchQuery: '',
  sortBy: 'name',
  sortDirection: 'asc',
  selectedSources: [],
  isBaseClass: null,
  isSpellcaster: null,
  selectedHitDice: [],
  selectedSpellcastingAbility: null,
  selectedParentClass: null,
  filtersOpen: false
}

export const useClassFiltersStore = defineStore('classFilters', {
  state: (): ClassFiltersState => ({ ...DEFAULT_STATE }),

  getters: {
    hasActiveFilters: (state): boolean => {
      return (
        state.searchQuery !== '' ||
        state.selectedSources.length > 0 ||
        state.isBaseClass !== null ||
        state.isSpellcaster !== null ||
        state.selectedHitDice.length > 0 ||
        state.selectedSpellcastingAbility !== null ||
        state.selectedParentClass !== null
      )
    },

    activeFilterCount: (state): number => {
      let count = 0
      // Don't count searchQuery - it's shown separately
      count += state.selectedSources.length
      if (state.isBaseClass !== null) count++
      if (state.isSpellcaster !== null) count++
      count += state.selectedHitDice.length
      if (state.selectedSpellcastingAbility !== null) count++
      if (state.selectedParentClass !== null) count++
      return count
    },

    toUrlQuery: (state): Record<string, string | string[]> => {
      const query: Record<string, string | string[]> = {}

      if (state.isBaseClass !== null) {
        query.is_base_class = state.isBaseClass
      }
      if (state.isSpellcaster !== null) {
        query.is_spellcaster = state.isSpellcaster
      }
      if (state.selectedHitDice.length > 0) {
        query.hit_die = state.selectedHitDice.map(String)
      }
      if (state.selectedSpellcastingAbility !== null) {
        query.spellcasting_ability = state.selectedSpellcastingAbility
      }
      if (state.selectedParentClass !== null) {
        query.parent_class_name = state.selectedParentClass
      }
      if (state.selectedSources.length > 0) {
        query.source = state.selectedSources
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
      if (query.is_base_class) {
        this.isBaseClass = String(query.is_base_class)
      }
      if (query.is_spellcaster) {
        this.isSpellcaster = String(query.is_spellcaster)
      }
      if (query.hit_die) {
        const hitDice = Array.isArray(query.hit_die)
          ? query.hit_die.map(Number)
          : [Number(query.hit_die)]
        this.selectedHitDice = hitDice
      }
      if (query.spellcasting_ability) {
        this.selectedSpellcastingAbility = String(query.spellcasting_ability)
      }
      if (query.parent_class_name) {
        this.selectedParentClass = String(query.parent_class_name)
      }
      if (query.source) {
        this.selectedSources = Array.isArray(query.source)
          ? query.source.map(String)
          : [String(query.source)]
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
    key: STORE_KEYS.classes,
    storage: idbStorage,
    // Don't persist searchQuery - usually not wanted on reload
    paths: [
      'sortBy',
      'sortDirection',
      'selectedSources',
      'isBaseClass',
      'isSpellcaster',
      'selectedHitDice',
      'selectedSpellcastingAbility',
      'selectedParentClass',
      'filtersOpen'
    ]
  }
})

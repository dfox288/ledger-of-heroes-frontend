import { defineStore } from 'pinia'
import type { LocationQuery } from 'vue-router'
import { idbStorage } from '~/utils/idbStorage'
import { STORE_KEYS } from './types'

export interface RaceFiltersState {
  // Search & Sort
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'

  // Common filters
  selectedSources: string[]

  // Entity-specific filters
  selectedSize: string
  selectedSpeedRange: string | null
  selectedParentRace: string
  raceTypeFilter: string | null
  hasInnateSpellsFilter: string | null
  selectedAbilityBonuses: string[]

  // UI state (persisted for convenience)
  filtersOpen: boolean
}

const DEFAULT_STATE: RaceFiltersState = {
  searchQuery: '',
  sortBy: 'name',
  sortDirection: 'asc',
  selectedSources: [],
  selectedSize: '',
  selectedSpeedRange: null,
  selectedParentRace: '',
  raceTypeFilter: null,
  hasInnateSpellsFilter: null,
  selectedAbilityBonuses: [],
  filtersOpen: false
}

export const useRaceFiltersStore = defineStore('raceFilters', {
  state: (): RaceFiltersState => ({ ...DEFAULT_STATE }),

  getters: {
    hasActiveFilters: (state): boolean => {
      return (
        state.searchQuery !== '' ||
        state.selectedSources.length > 0 ||
        state.selectedSize !== '' ||
        state.selectedSpeedRange !== null ||
        state.selectedParentRace !== '' ||
        state.raceTypeFilter !== null ||
        state.hasInnateSpellsFilter !== null ||
        state.selectedAbilityBonuses.length > 0
      )
    },

    activeFilterCount: (state): number => {
      let count = 0
      // Don't count searchQuery - it's shown separately
      count += state.selectedSources.length
      if (state.selectedSize !== '') count++
      if (state.selectedSpeedRange !== null) count++
      if (state.selectedParentRace !== '') count++
      if (state.raceTypeFilter !== null) count++
      if (state.hasInnateSpellsFilter !== null) count++
      count += state.selectedAbilityBonuses.length
      return count
    },

    toUrlQuery: (state): Record<string, string | string[]> => {
      const query: Record<string, string | string[]> = {}

      if (state.selectedSize !== '') {
        query.size = state.selectedSize
      }
      if (state.selectedSpeedRange !== null) {
        query.speed = state.selectedSpeedRange
      }
      if (state.selectedParentRace !== '') {
        query.parent_race = state.selectedParentRace
      }
      if (state.raceTypeFilter !== null) {
        query.race_type = state.raceTypeFilter
      }
      if (state.hasInnateSpellsFilter !== null) {
        query.has_innate_spells = state.hasInnateSpellsFilter
      }
      if (state.selectedAbilityBonuses.length > 0) {
        query.ability = state.selectedAbilityBonuses
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
      if (query.size) {
        this.selectedSize = String(query.size)
      }
      if (query.speed) {
        this.selectedSpeedRange = String(query.speed)
      }
      if (query.parent_race) {
        this.selectedParentRace = String(query.parent_race)
      }
      if (query.race_type) {
        this.raceTypeFilter = String(query.race_type)
      }
      if (query.has_innate_spells) {
        this.hasInnateSpellsFilter = String(query.has_innate_spells)
      }
      if (query.ability) {
        this.selectedAbilityBonuses = Array.isArray(query.ability)
          ? query.ability.map(String)
          : [String(query.ability)]
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
    key: STORE_KEYS.races,
    storage: idbStorage,
    // Don't persist searchQuery - usually not wanted on reload
    paths: [
      'sortBy',
      'sortDirection',
      'selectedSources',
      'selectedSize',
      'selectedSpeedRange',
      'selectedParentRace',
      'raceTypeFilter',
      'hasInnateSpellsFilter',
      'selectedAbilityBonuses',
      'filtersOpen'
    ]
  }
})

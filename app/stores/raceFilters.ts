// app/stores/raceFilters.ts
import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

export const useRaceFiltersStore = createEntityFilterStore({
  name: 'raceFilters',
  storageKey: STORE_KEYS.races,
  fields: [
    // Note: selectedSize uses emptyString type ('' = any, 'M' = medium, etc.)
    { name: 'selectedSize', urlKey: 'size', type: 'emptyString', defaultValue: '' },
    { name: 'selectedSpeedRange', urlKey: 'speed', type: 'string', defaultValue: null },
    // Note: selectedParentRace uses emptyString type
    { name: 'selectedParentRace', urlKey: 'parent_race', type: 'emptyString', defaultValue: '' },
    { name: 'raceTypeFilter', urlKey: 'race_type', type: 'string', defaultValue: null },
    { name: 'hasInnateSpellsFilter', urlKey: 'has_innate_spells', type: 'string', defaultValue: null },
    { name: 'selectedAbilityBonuses', urlKey: 'ability', type: 'stringArray', defaultValue: [] }
  ]
})

export interface RaceFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  selectedSize: string
  selectedSpeedRange: string | null
  selectedParentRace: string
  raceTypeFilter: string | null
  hasInnateSpellsFilter: string | null
  selectedAbilityBonuses: string[]
  filtersOpen: boolean
}

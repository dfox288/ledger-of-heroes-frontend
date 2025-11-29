import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

export interface FeatFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  hasPrerequisites: string | null
  grantsProficiencies: string | null
  selectedImprovedAbilities: string[]
  selectedPrerequisiteTypes: string[]
  filtersOpen: boolean
}

export const useFeatFiltersStore = createEntityFilterStore<FeatFiltersState>({
  name: 'featFilters',
  storageKey: STORE_KEYS.feats,
  fields: [
    { name: 'hasPrerequisites', urlKey: 'has_prerequisites', type: 'string', defaultValue: null },
    { name: 'grantsProficiencies', urlKey: 'grants_proficiencies', type: 'string', defaultValue: null },
    { name: 'selectedImprovedAbilities', urlKey: 'improved_ability', type: 'stringArray', defaultValue: [] },
    { name: 'selectedPrerequisiteTypes', urlKey: 'prerequisite_type', type: 'stringArray', defaultValue: [] }
  ]
})

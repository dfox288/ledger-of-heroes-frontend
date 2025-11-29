// app/stores/backgroundFilters.ts
import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

export interface BackgroundFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  selectedSkills: string[]
  selectedToolTypes: string[]
  languageChoiceFilter: string | null
  filtersOpen: boolean
}

export const useBackgroundFiltersStore = createEntityFilterStore<BackgroundFiltersState>({
  name: 'backgroundFilters',
  storageKey: STORE_KEYS.backgrounds,
  fields: [
    { name: 'selectedSkills', urlKey: 'skill', type: 'stringArray', defaultValue: [] },
    { name: 'selectedToolTypes', urlKey: 'tool_type', type: 'stringArray', defaultValue: [] },
    { name: 'languageChoiceFilter', urlKey: 'grants_language_choice', type: 'string', defaultValue: null }
  ]
})

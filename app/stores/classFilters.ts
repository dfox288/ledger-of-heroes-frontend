import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

export interface ClassFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  isBaseClass: string | null
  isSpellcaster: string | null
  selectedHitDice: number[]
  selectedSpellcastingAbility: string | null
  selectedParentClass: string | null
  filtersOpen: boolean
}

export const useClassFiltersStore = createEntityFilterStore<ClassFiltersState>({
  name: 'classFilters',
  storageKey: STORE_KEYS.classes,
  fields: [
    { name: 'isBaseClass', urlKey: 'is_base_class', type: 'string', defaultValue: null },
    { name: 'isSpellcaster', urlKey: 'is_spellcaster', type: 'string', defaultValue: null },
    { name: 'selectedHitDice', urlKey: 'hit_die', type: 'numberArray', defaultValue: [] },
    { name: 'selectedSpellcastingAbility', urlKey: 'spellcasting_ability', type: 'string', defaultValue: null },
    { name: 'selectedParentClass', urlKey: 'parent_class_name', type: 'string', defaultValue: null }
  ]
})

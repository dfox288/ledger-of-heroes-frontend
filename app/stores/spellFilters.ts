import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

/**
 * Spell filter store - manages all filter state for the spells list page.
 *
 * Uses the filter factory for consistent behavior with other entity stores.
 */
export const useSpellFiltersStore = createEntityFilterStore({
  name: 'spellFilters',
  storageKey: STORE_KEYS.spells,
  fields: [
    // Level filter (multi-select: "0", "1", "2", ..., "9")
    { name: 'selectedLevels', urlKey: 'level', type: 'stringArray', defaultValue: [] },
    // School filter (single select by ID)
    { name: 'selectedSchool', urlKey: 'school', type: 'number', defaultValue: null },
    // Class filter (single select by slug)
    { name: 'selectedClass', urlKey: 'class', type: 'string', defaultValue: null },
    // Concentration toggle ("1" = yes, "0" = no, null = any)
    { name: 'concentrationFilter', urlKey: 'concentration', type: 'string', defaultValue: null },
    // Ritual toggle
    { name: 'ritualFilter', urlKey: 'ritual', type: 'string', defaultValue: null },
    // Damage types (multi-select by code: "FIRE", "COLD", etc.)
    { name: 'selectedDamageTypes', urlKey: 'damage_type', type: 'stringArray', defaultValue: [] },
    // Saving throws (multi-select by code: "DEX", "WIS", etc.)
    { name: 'selectedSavingThrows', urlKey: 'saving_throw', type: 'stringArray', defaultValue: [] },
    // Tags (multi-select)
    { name: 'selectedTags', urlKey: 'tag', type: 'stringArray', defaultValue: [] },
    // Component toggles
    { name: 'verbalFilter', urlKey: 'has_verbal', type: 'string', defaultValue: null },
    { name: 'somaticFilter', urlKey: 'has_somatic', type: 'string', defaultValue: null },
    { name: 'materialFilter', urlKey: 'has_material', type: 'string', defaultValue: null }
  ]
})

// Re-export interface for backwards compatibility
// (can be removed once all consumers use store directly)
export interface SpellFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
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
  filtersOpen: boolean
}

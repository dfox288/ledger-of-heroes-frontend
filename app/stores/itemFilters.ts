import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

export interface ItemFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  selectedType: number | null
  selectedRarity: string | null
  selectedMagic: string | null
  hasCharges: string | null
  requiresAttunement: string | null
  stealthDisadvantage: string | null
  selectedProperties: string[]
  selectedDamageTypes: string[]
  selectedDamageDice: string[]
  selectedVersatileDamage: string[]
  selectedRechargeTiming: string[]
  selectedStrengthReq: string | null
  selectedRange: string | null
  selectedCostRange: string | null
  selectedACRange: string | null
  filtersOpen: boolean
}

export const useItemFiltersStore = createEntityFilterStore<ItemFiltersState>({
  name: 'itemFilters',
  storageKey: STORE_KEYS.items,
  fields: [
    // Primary filters
    { name: 'selectedType', urlKey: 'type', type: 'number', defaultValue: null },
    { name: 'selectedRarity', urlKey: 'rarity', type: 'string', defaultValue: null },
    { name: 'selectedMagic', urlKey: 'is_magic', type: 'string', defaultValue: null },
    // Quick toggles
    { name: 'hasCharges', urlKey: 'has_charges', type: 'string', defaultValue: null },
    { name: 'requiresAttunement', urlKey: 'requires_attunement', type: 'string', defaultValue: null },
    { name: 'stealthDisadvantage', urlKey: 'stealth_disadvantage', type: 'string', defaultValue: null },
    // Advanced arrays
    { name: 'selectedProperties', urlKey: 'property', type: 'stringArray', defaultValue: [] },
    { name: 'selectedDamageTypes', urlKey: 'damage_type', type: 'stringArray', defaultValue: [] },
    { name: 'selectedDamageDice', urlKey: 'damage_dice', type: 'stringArray', defaultValue: [] },
    { name: 'selectedVersatileDamage', urlKey: 'versatile_damage', type: 'stringArray', defaultValue: [] },
    { name: 'selectedRechargeTiming', urlKey: 'recharge_timing', type: 'stringArray', defaultValue: [] },
    // Advanced singles
    { name: 'selectedStrengthReq', urlKey: 'strength_req', type: 'string', defaultValue: null },
    { name: 'selectedRange', urlKey: 'range', type: 'string', defaultValue: null },
    { name: 'selectedCostRange', urlKey: 'cost', type: 'string', defaultValue: null },
    { name: 'selectedACRange', urlKey: 'ac', type: 'string', defaultValue: null }
  ]
})

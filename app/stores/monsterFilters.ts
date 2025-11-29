import { createEntityFilterStore } from './filterFactory'
import { STORE_KEYS } from './types'

export interface MonsterFiltersState {
  searchQuery: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  selectedSources: string[]
  selectedCRs: string[]
  selectedType: string | null
  isLegendary: string | null
  selectedSizes: string[]
  selectedAlignments: string[]
  selectedMovementTypes: string[]
  selectedArmorTypes: string[]
  canHover: string | null
  hasLairActions: string | null
  hasReactions: string | null
  isSpellcaster: string | null
  hasMagicResistance: string | null
  selectedACRange: string | null
  selectedHPRange: string | null
  filtersOpen: boolean
}

export const useMonsterFiltersStore = createEntityFilterStore<MonsterFiltersState>({
  name: 'monsterFilters',
  storageKey: STORE_KEYS.monsters,
  fields: [
    { name: 'selectedCRs', urlKey: 'cr', type: 'stringArray', defaultValue: [] },
    { name: 'selectedType', urlKey: 'type', type: 'string', defaultValue: null },
    { name: 'isLegendary', urlKey: 'is_legendary', type: 'string', defaultValue: null },
    { name: 'selectedSizes', urlKey: 'size_id', type: 'stringArray', defaultValue: [] },
    { name: 'selectedAlignments', urlKey: 'alignment', type: 'stringArray', defaultValue: [] },
    { name: 'selectedMovementTypes', urlKey: 'movement', type: 'stringArray', defaultValue: [] },
    { name: 'selectedArmorTypes', urlKey: 'armor_type', type: 'stringArray', defaultValue: [] },
    { name: 'canHover', urlKey: 'can_hover', type: 'string', defaultValue: null },
    { name: 'hasLairActions', urlKey: 'has_lair_actions', type: 'string', defaultValue: null },
    { name: 'hasReactions', urlKey: 'has_reactions', type: 'string', defaultValue: null },
    { name: 'isSpellcaster', urlKey: 'is_spellcaster', type: 'string', defaultValue: null },
    { name: 'hasMagicResistance', urlKey: 'has_magic_resistance', type: 'string', defaultValue: null },
    { name: 'selectedACRange', urlKey: 'ac_range', type: 'string', defaultValue: null },
    { name: 'selectedHPRange', urlKey: 'hp_range', type: 'string', defaultValue: null }
  ]
})

/**
 * Consolidated Filter Store Tests
 *
 * This file consolidates tests for all 7 entity filter stores into a single
 * parameterized test file. Each store has its configuration extracted into
 * the FILTER_STORE_CONFIGS array, and the tests loop through each config
 * calling the shared test helpers.
 *
 * @see tests/helpers/filterStoreBehavior.ts for the test helper implementations
 *
 * Consolidation: 7 files (~1,700 lines) → 1 file
 * GitHub Issue: #322
 */
import { describe } from 'vitest'
import { usePiniaSetup } from '#tests/helpers/storeSetup'
import {
  testInitialState,
  testHasActiveFilters,
  testActiveFilterCount,
  testClearAllAction,
  testSetFromUrlQuery,
  testToUrlQuery,
  type FilterFieldTest,
  type ActiveFilterCountTest,
  type ClearAllTestConfig,
  type UrlQueryTestCase,
  type ToUrlQueryTestCase
} from '#tests/helpers/filterStoreBehavior'

// Store imports
import { useSpellFiltersStore } from '~/stores/spellFilters'
import { useItemFiltersStore } from '~/stores/itemFilters'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'
import { useClassFiltersStore } from '~/stores/classFilters'
import { useRaceFiltersStore } from '~/stores/raceFilters'
import { useBackgroundFiltersStore } from '~/stores/backgroundFilters'
import { useFeatFiltersStore } from '~/stores/featFilters'

// ============================================================================
// Configuration Type
// ============================================================================

interface FilterStoreConfig {
  name: string
  store: () => unknown
  initialState: Record<string, unknown>
  hasActiveFiltersFields: FilterFieldTest[]
  activeFilterCountTests: ActiveFilterCountTest[]
  clearAllConfig: ClearAllTestConfig
  setFromUrlQueryTests: UrlQueryTestCase[]
  toUrlQueryTests: ToUrlQueryTestCase[]
}

// ============================================================================
// Store Configurations
// ============================================================================

const FILTER_STORE_CONFIGS: FilterStoreConfig[] = [
  // -------------------------------------------------------------------------
  // Spell Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Spell',
    store: useSpellFiltersStore,
    initialState: {
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
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'fireball' },
      { field: 'selectedLevels', value: ['3'] },
      { field: 'selectedSchool', value: 5 },
      { field: 'selectedClass', value: 'wizard' },
      { field: 'concentrationFilter', value: '1' },
      { field: 'ritualFilter', value: '0' },
      { field: 'selectedDamageTypes', value: ['FIRE'] },
      { field: 'selectedSavingThrows', value: ['DEX'] },
      { field: 'selectedTags', value: ['ritual-caster'] },
      { field: 'verbalFilter', value: '1' },
      { field: 'somaticFilter', value: '1' },
      { field: 'materialFilter', value: '0' },
      { field: 'selectedSources', value: ['PHB'] }
    ],
    activeFilterCountTests: [
      {
        description: 'counts each active filter',
        setup: (store) => {
          store.selectedLevels = ['3', '5']
          store.selectedSchool = 5
          store.selectedClass = 'wizard'
          store.concentrationFilter = '1'
          store.ritualFilter = '0'
          store.selectedDamageTypes = ['FIRE', 'COLD']
          store.selectedSavingThrows = ['DEX']
          store.selectedSources = ['PHB', 'XGTE']
          store.selectedTags = ['ritual-caster']
          store.verbalFilter = '1'
          store.somaticFilter = '1'
          store.materialFilter = '0'
        },
        expectedCount: 15
      },
      {
        description: 'does not count searchQuery in filter count',
        setup: (store) => {
          store.searchQuery = 'fireball'
        },
        expectedCount: 0
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'fireball'
        store.sortBy = 'level'
        store.sortDirection = 'desc'
        store.selectedSources = ['PHB']
        store.selectedLevels = ['3']
        store.selectedSchool = 5
        store.selectedClass = 'wizard'
        store.concentrationFilter = '1'
        store.ritualFilter = '0'
        store.selectedDamageTypes = ['FIRE']
        store.selectedSavingThrows = ['DEX']
        store.selectedTags = ['ritual-caster']
        store.verbalFilter = '1'
        store.somaticFilter = '1'
        store.materialFilter = '0'
        store.filtersOpen = true
      },
      expectedDefaults: {
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
        materialFilter: null
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'all filter types from URL query object',
        query: {
          level: ['3', '5'],
          school: '5',
          class: 'wizard',
          concentration: '1',
          ritual: '0',
          damage_type: ['FIRE', 'COLD'],
          saving_throw: 'DEX',
          source: 'PHB',
          tag: 'ritual-caster',
          has_verbal: '1',
          has_somatic: '1',
          has_material: '0',
          sort_by: 'level',
          sort_direction: 'desc'
        },
        expectedState: {
          selectedLevels: ['3', '5'],
          selectedSchool: 5,
          selectedClass: 'wizard',
          concentrationFilter: '1',
          ritualFilter: '0',
          selectedDamageTypes: ['FIRE', 'COLD'],
          selectedSavingThrows: ['DEX'],
          selectedSources: ['PHB'],
          selectedTags: ['ritual-caster'],
          verbalFilter: '1',
          somaticFilter: '1',
          materialFilter: '0',
          sortBy: 'level',
          sortDirection: 'desc'
        }
      },
      {
        name: 'array vs string query params for levels - single value',
        query: { level: '3' },
        expectedState: { selectedLevels: ['3'] }
      },
      {
        name: 'array vs string query params for levels - multiple values',
        query: { level: ['3', '5'] },
        expectedState: { selectedLevels: ['3', '5'] }
      },
      {
        name: 'array vs string query params for damage types - single value',
        query: { damage_type: 'FIRE' },
        expectedState: { selectedDamageTypes: ['FIRE'] }
      },
      {
        name: 'array vs string query params for damage types - multiple values',
        query: { damage_type: ['FIRE', 'COLD'] },
        expectedState: { selectedDamageTypes: ['FIRE', 'COLD'] }
      },
      {
        name: 'numeric values for school',
        query: { school: '5' },
        expectedState: { selectedSchool: 5 }
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters active',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'returns query object with active filters',
        setup: (store) => {
          store.selectedLevels = ['3']
          store.selectedSchool = 5
          store.selectedClass = 'wizard'
          store.concentrationFilter = '1'
          store.selectedSources = ['PHB']
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          level: ['3'],
          school: '5',
          class: 'wizard',
          concentration: '1',
          source: ['PHB'],
          sort_direction: 'desc'
        }
      },
      {
        name: 'excludes default sort values',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'includes non-default sort by in URL query',
        setup: (store) => {
          store.sortBy = 'level'
        },
        expectedQuery: { sort_by: 'level' }
      },
      {
        name: 'includes all filter types in URL query',
        setup: (store) => {
          store.selectedLevels = ['3', '5']
          store.selectedSchool = 5
          store.selectedClass = 'wizard'
          store.concentrationFilter = '1'
          store.ritualFilter = '0'
          store.selectedDamageTypes = ['FIRE']
          store.selectedSavingThrows = ['DEX', 'WIS']
          store.selectedTags = ['ritual-caster']
          store.selectedSources = ['PHB']
          store.verbalFilter = '1'
          store.somaticFilter = '0'
          store.materialFilter = '1'
        },
        expectedQuery: {
          level: ['3', '5'],
          school: '5',
          class: 'wizard',
          concentration: '1',
          ritual: '0',
          damage_type: ['FIRE'],
          saving_throw: ['DEX', 'WIS'],
          tag: ['ritual-caster'],
          source: ['PHB'],
          has_verbal: '1',
          has_somatic: '0',
          has_material: '1'
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // Item Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Item',
    store: useItemFiltersStore,
    initialState: {
      searchQuery: '',
      sortBy: 'name',
      sortDirection: 'asc',
      selectedSources: [],
      selectedType: null,
      selectedRarity: null,
      selectedMagic: null,
      hasCharges: null,
      requiresAttunement: null,
      stealthDisadvantage: null,
      selectedProperties: [],
      selectedDamageTypes: [],
      selectedDamageDice: [],
      selectedVersatileDamage: [],
      selectedRechargeTiming: [],
      selectedStrengthReq: null,
      selectedRange: null,
      selectedCostRange: null,
      selectedACRange: null,
      filtersOpen: false
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'sword' },
      { field: 'selectedSources', value: ['phb'] },
      { field: 'selectedType', value: 1 },
      { field: 'selectedRarity', value: 'rare' },
      { field: 'selectedMagic', value: 'true' },
      { field: 'hasCharges', value: '1' },
      { field: 'requiresAttunement', value: '1' },
      { field: 'stealthDisadvantage', value: '1' },
      { field: 'selectedProperties', value: ['finesse'] },
      { field: 'selectedDamageTypes', value: ['slashing'] },
      { field: 'selectedDamageDice', value: ['1d8'] },
      { field: 'selectedVersatileDamage', value: ['1d10'] },
      { field: 'selectedRechargeTiming', value: ['dawn'] },
      { field: 'selectedStrengthReq', value: '13' },
      { field: 'selectedRange', value: 'under-30' },
      { field: 'selectedCostRange', value: 'under-100' },
      { field: 'selectedACRange', value: '11-14' }
    ],
    activeFilterCountTests: [
      {
        description: 'does not count searchQuery',
        setup: (store) => { store.searchQuery = 'sword' },
        expectedCount: 0
      },
      {
        description: 'counts selectedSources items individually',
        setup: (store) => { store.selectedSources = ['phb', 'dmg'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedType as 1',
        setup: (store) => { store.selectedType = 1 },
        expectedCount: 1
      },
      {
        description: 'counts selectedRarity as 1',
        setup: (store) => { store.selectedRarity = 'rare' },
        expectedCount: 1
      },
      {
        description: 'counts selectedMagic as 1',
        setup: (store) => { store.selectedMagic = 'true' },
        expectedCount: 1
      },
      {
        description: 'counts hasCharges as 1',
        setup: (store) => { store.hasCharges = '1' },
        expectedCount: 1
      },
      {
        description: 'counts requiresAttunement as 1',
        setup: (store) => { store.requiresAttunement = '1' },
        expectedCount: 1
      },
      {
        description: 'counts stealthDisadvantage as 1',
        setup: (store) => { store.stealthDisadvantage = '1' },
        expectedCount: 1
      },
      {
        description: 'counts selectedProperties items individually',
        setup: (store) => { store.selectedProperties = ['finesse', 'versatile'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedDamageTypes items individually',
        setup: (store) => { store.selectedDamageTypes = ['slashing', 'piercing'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedDamageDice items individually',
        setup: (store) => { store.selectedDamageDice = ['1d6', '1d8'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedVersatileDamage items individually',
        setup: (store) => { store.selectedVersatileDamage = ['1d8', '1d10'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedRechargeTiming items individually',
        setup: (store) => { store.selectedRechargeTiming = ['dawn', 'dusk'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedStrengthReq as 1',
        setup: (store) => { store.selectedStrengthReq = '13' },
        expectedCount: 1
      },
      {
        description: 'counts selectedRange as 1',
        setup: (store) => { store.selectedRange = 'under-30' },
        expectedCount: 1
      },
      {
        description: 'counts selectedCostRange as 1',
        setup: (store) => { store.selectedCostRange = 'under-100' },
        expectedCount: 1
      },
      {
        description: 'counts selectedACRange as 1',
        setup: (store) => { store.selectedACRange = '11-14' },
        expectedCount: 1
      },
      {
        description: 'counts multiple filters correctly',
        setup: (store) => {
          store.selectedType = 1
          store.selectedRarity = 'rare'
          store.selectedSources = ['phb', 'dmg']
          store.hasCharges = '1'
          store.selectedProperties = ['finesse', 'versatile']
        },
        expectedCount: 7
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'sword'
        store.sortBy = 'rarity'
        store.sortDirection = 'desc'
        store.selectedSources = ['phb']
        store.selectedType = 1
        store.selectedRarity = 'rare'
        store.selectedMagic = 'true'
        store.hasCharges = '1'
        store.requiresAttunement = '1'
        store.stealthDisadvantage = '1'
        store.selectedProperties = ['finesse']
        store.selectedDamageTypes = ['slashing']
        store.selectedDamageDice = ['1d8']
        store.selectedVersatileDamage = ['1d10']
        store.selectedRechargeTiming = ['dawn']
        store.selectedStrengthReq = '13'
        store.selectedRange = 'under-30'
        store.selectedCostRange = 'under-100'
        store.selectedACRange = '11-14'
        store.filtersOpen = true
      },
      expectedDefaults: {
        searchQuery: '',
        sortBy: 'name',
        sortDirection: 'asc',
        selectedSources: [],
        selectedType: null,
        selectedRarity: null,
        selectedMagic: null,
        hasCharges: null,
        requiresAttunement: null,
        stealthDisadvantage: null,
        selectedProperties: [],
        selectedDamageTypes: [],
        selectedDamageDice: [],
        selectedVersatileDamage: [],
        selectedRechargeTiming: [],
        selectedStrengthReq: null,
        selectedRange: null,
        selectedCostRange: null,
        selectedACRange: null
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'single string values',
        query: {
          rarity: 'rare',
          is_magic: 'true',
          has_charges: '1',
          requires_attunement: '0',
          stealth_disadvantage: '1',
          strength_req: '13',
          range: 'under-30',
          cost: 'under-100',
          ac: '11-14'
        },
        expectedState: {
          selectedRarity: 'rare',
          selectedMagic: 'true',
          hasCharges: '1',
          requiresAttunement: '0',
          stealthDisadvantage: '1',
          selectedStrengthReq: '13',
          selectedRange: 'under-30',
          selectedCostRange: 'under-100',
          selectedACRange: '11-14'
        }
      },
      {
        name: 'type as number',
        query: { type: '5' },
        expectedState: { selectedType: 5 }
      },
      {
        name: 'array values',
        query: {
          source: ['phb', 'dmg'],
          property: ['finesse', 'versatile'],
          damage_type: ['slashing', 'piercing'],
          damage_dice: ['1d6', '1d8'],
          versatile_damage: ['1d8', '1d10'],
          recharge_timing: ['dawn', 'dusk']
        },
        expectedState: {
          selectedSources: ['phb', 'dmg'],
          selectedProperties: ['finesse', 'versatile'],
          selectedDamageTypes: ['slashing', 'piercing'],
          selectedDamageDice: ['1d6', '1d8'],
          selectedVersatileDamage: ['1d8', '1d10'],
          selectedRechargeTiming: ['dawn', 'dusk']
        }
      },
      {
        name: 'single-item arrays',
        query: {
          source: 'phb',
          property: 'finesse',
          damage_type: 'slashing'
        },
        expectedState: {
          selectedSources: ['phb'],
          selectedProperties: ['finesse'],
          selectedDamageTypes: ['slashing']
        }
      },
      {
        name: 'sort parameters',
        query: {
          sort_by: 'rarity',
          sort_direction: 'desc'
        },
        expectedState: {
          sortBy: 'rarity',
          sortDirection: 'desc'
        }
      },
      {
        name: 'empty query gracefully',
        query: {},
        expectedState: {}
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters active',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'includes string filter values',
        setup: (store) => {
          store.selectedRarity = 'rare'
          store.selectedMagic = 'true'
        },
        expectedQuery: {
          rarity: 'rare',
          is_magic: 'true'
        }
      },
      {
        name: 'includes number filter values',
        setup: (store) => {
          store.selectedType = 5
        },
        expectedQuery: {
          type: '5'
        }
      },
      {
        name: 'includes boolean toggle values',
        setup: (store) => {
          store.hasCharges = '1'
          store.requiresAttunement = '0'
          store.stealthDisadvantage = '1'
        },
        expectedQuery: {
          has_charges: '1',
          requires_attunement: '0',
          stealth_disadvantage: '1'
        }
      },
      {
        name: 'includes array filter values',
        setup: (store) => {
          store.selectedSources = ['phb', 'dmg']
          store.selectedProperties = ['finesse', 'versatile']
          store.selectedDamageTypes = ['slashing']
        },
        expectedQuery: {
          source: ['phb', 'dmg'],
          property: ['finesse', 'versatile'],
          damage_type: ['slashing']
        }
      },
      {
        name: 'includes range filter values',
        setup: (store) => {
          store.selectedStrengthReq = '13'
          store.selectedRange = 'under-30'
          store.selectedCostRange = 'under-100'
          store.selectedACRange = '11-14'
        },
        expectedQuery: {
          strength_req: '13',
          range: 'under-30',
          cost: 'under-100',
          ac: '11-14'
        }
      },
      {
        name: 'only includes sort_by if non-default',
        setup: (store) => {
          store.sortBy = 'rarity'
        },
        expectedQuery: {
          sort_by: 'rarity'
        }
      },
      {
        name: 'only includes sort_direction if non-default',
        setup: (store) => {
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          sort_direction: 'desc'
        }
      },
      {
        name: 'skips empty arrays',
        setup: (store) => {
          store.selectedSources = []
          store.selectedProperties = []
        },
        expectedQuery: {}
      }
    ]
  },

  // -------------------------------------------------------------------------
  // Monster Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Monster',
    store: useMonsterFiltersStore,
    initialState: {
      searchQuery: '',
      sortBy: 'name',
      sortDirection: 'asc',
      selectedSources: [],
      selectedCRs: [],
      selectedType: null,
      isLegendary: null,
      selectedSizes: [],
      selectedAlignments: [],
      selectedMovementTypes: [],
      selectedArmorTypes: [],
      canHover: null,
      hasLairActions: null,
      hasReactions: null,
      isSpellcaster: null,
      hasMagicResistance: null,
      selectedACRange: null,
      selectedHPRange: null,
      filtersOpen: false
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'dragon' },
      { field: 'selectedSources', value: ['phb'] },
      { field: 'selectedCRs', value: ['1', '2'] },
      { field: 'selectedType', value: 'dragon' },
      { field: 'isLegendary', value: '1' },
      { field: 'selectedSizes', value: ['1', '2'] },
      { field: 'selectedAlignments', value: ['Lawful Good', 'Neutral'] },
      { field: 'selectedMovementTypes', value: ['fly', 'swim'] },
      { field: 'selectedArmorTypes', value: ['Natural Armor'] },
      { field: 'canHover', value: '1' },
      { field: 'hasLairActions', value: '1' },
      { field: 'hasReactions', value: '1' },
      { field: 'isSpellcaster', value: '1' },
      { field: 'hasMagicResistance', value: '1' },
      { field: 'selectedACRange', value: '15-17' },
      { field: 'selectedHPRange', value: '51-150' }
    ],
    activeFilterCountTests: [
      {
        description: 'does not count searchQuery',
        setup: (store) => { store.searchQuery = 'dragon' },
        expectedCount: 0
      },
      {
        description: 'counts selectedSources',
        setup: (store) => { store.selectedSources = ['phb', 'mm'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedCRs',
        setup: (store) => { store.selectedCRs = ['1', '2', '3'] },
        expectedCount: 3
      },
      {
        description: 'counts selectedType as 1',
        setup: (store) => { store.selectedType = 'dragon' },
        expectedCount: 1
      },
      {
        description: 'counts isLegendary as 1',
        setup: (store) => { store.isLegendary = '1' },
        expectedCount: 1
      },
      {
        description: 'counts selectedSizes',
        setup: (store) => { store.selectedSizes = ['1', '2'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedAlignments',
        setup: (store) => { store.selectedAlignments = ['Lawful Good'] },
        expectedCount: 1
      },
      {
        description: 'counts selectedMovementTypes',
        setup: (store) => { store.selectedMovementTypes = ['fly', 'swim'] },
        expectedCount: 2
      },
      {
        description: 'counts selectedArmorTypes',
        setup: (store) => { store.selectedArmorTypes = ['Natural Armor', 'Plate'] },
        expectedCount: 2
      },
      {
        description: 'counts boolean filters as 1 each',
        setup: (store) => {
          store.canHover = '1'
          store.hasLairActions = '1'
          store.hasReactions = '1'
          store.isSpellcaster = '1'
          store.hasMagicResistance = '1'
        },
        expectedCount: 5
      },
      {
        description: 'counts selectedACRange as 1',
        setup: (store) => { store.selectedACRange = '15-17' },
        expectedCount: 1
      },
      {
        description: 'counts selectedHPRange as 1',
        setup: (store) => { store.selectedHPRange = '51-150' },
        expectedCount: 1
      },
      {
        description: 'counts all filters correctly',
        setup: (store) => {
          store.selectedSources = ['phb', 'mm']
          store.selectedCRs = ['1', '2']
          store.selectedType = 'dragon'
          store.isLegendary = '1'
          store.selectedSizes = ['1']
          store.selectedAlignments = ['Lawful Good']
          store.selectedMovementTypes = ['fly']
          store.selectedArmorTypes = ['Natural Armor']
          store.canHover = '1'
          store.hasLairActions = '1'
          store.hasReactions = '1'
          store.isSpellcaster = '1'
          store.hasMagicResistance = '1'
          store.selectedACRange = '15-17'
          store.selectedHPRange = '51-150'
        },
        expectedCount: 17
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'dragon'
        store.sortBy = 'challenge_rating'
        store.sortDirection = 'desc'
        store.selectedSources = ['phb']
        store.selectedCRs = ['1', '2']
        store.selectedType = 'dragon'
        store.isLegendary = '1'
        store.selectedSizes = ['1']
        store.selectedAlignments = ['Lawful Good']
        store.selectedMovementTypes = ['fly']
        store.selectedArmorTypes = ['Natural Armor']
        store.canHover = '1'
        store.hasLairActions = '1'
        store.hasReactions = '1'
        store.isSpellcaster = '1'
        store.hasMagicResistance = '1'
        store.selectedACRange = '15-17'
        store.selectedHPRange = '51-150'
      },
      expectedDefaults: {
        searchQuery: '',
        sortBy: 'name',
        sortDirection: 'asc',
        selectedSources: [],
        selectedCRs: [],
        selectedType: null,
        isLegendary: null,
        selectedSizes: [],
        selectedAlignments: [],
        selectedMovementTypes: [],
        selectedArmorTypes: [],
        canHover: null,
        hasLairActions: null,
        hasReactions: null,
        isSpellcaster: null,
        hasMagicResistance: null,
        selectedACRange: null,
        selectedHPRange: null
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'string values from URL query',
        query: {
          type: 'dragon',
          is_legendary: '1',
          can_hover: '1',
          has_lair_actions: '1',
          has_reactions: '1',
          is_spellcaster: '1',
          has_magic_resistance: '1',
          ac_range: '15-17',
          hp_range: '51-150',
          sort_by: 'challenge_rating',
          sort_direction: 'desc'
        },
        expectedState: {
          selectedType: 'dragon',
          isLegendary: '1',
          canHover: '1',
          hasLairActions: '1',
          hasReactions: '1',
          isSpellcaster: '1',
          hasMagicResistance: '1',
          selectedACRange: '15-17',
          selectedHPRange: '51-150',
          sortBy: 'challenge_rating',
          sortDirection: 'desc'
        }
      },
      {
        name: 'array values from URL query',
        query: {
          cr: ['1', '2', '3'],
          size_id: ['1', '2'],
          alignment: ['Lawful Good', 'Neutral'],
          movement: ['fly', 'swim'],
          armor_type: ['Natural Armor', 'Plate'],
          source: ['phb', 'mm']
        },
        expectedState: {
          selectedCRs: ['1', '2', '3'],
          selectedSizes: ['1', '2'],
          selectedAlignments: ['Lawful Good', 'Neutral'],
          selectedMovementTypes: ['fly', 'swim'],
          selectedArmorTypes: ['Natural Armor', 'Plate'],
          selectedSources: ['phb', 'mm']
        }
      },
      {
        name: 'single values converted to arrays',
        query: {
          cr: '1',
          size_id: '2',
          alignment: 'Lawful Good',
          movement: 'fly',
          armor_type: 'Natural Armor',
          source: 'phb'
        },
        expectedState: {
          selectedCRs: ['1'],
          selectedSizes: ['2'],
          selectedAlignments: ['Lawful Good'],
          selectedMovementTypes: ['fly'],
          selectedArmorTypes: ['Natural Armor'],
          selectedSources: ['phb']
        }
      },
      {
        name: 'undefined query params ignored',
        query: { type: undefined },
        expectedState: {}
      },
      {
        name: 'empty query object',
        query: {},
        expectedState: {}
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters are set',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'includes string filter values',
        setup: (store) => {
          store.selectedType = 'dragon'
          store.isLegendary = '1'
          store.canHover = '1'
          store.hasLairActions = '1'
          store.hasReactions = '1'
          store.isSpellcaster = '1'
          store.hasMagicResistance = '1'
          store.selectedACRange = '15-17'
          store.selectedHPRange = '51-150'
        },
        expectedQuery: {
          type: 'dragon',
          is_legendary: '1',
          can_hover: '1',
          has_lair_actions: '1',
          has_reactions: '1',
          is_spellcaster: '1',
          has_magic_resistance: '1',
          ac_range: '15-17',
          hp_range: '51-150'
        }
      },
      {
        name: 'includes array filter values',
        setup: (store) => {
          store.selectedCRs = ['1', '2', '3']
          store.selectedSizes = ['1', '2']
          store.selectedAlignments = ['Lawful Good', 'Neutral']
          store.selectedMovementTypes = ['fly', 'swim']
          store.selectedArmorTypes = ['Natural Armor', 'Plate']
          store.selectedSources = ['phb', 'mm']
        },
        expectedQuery: {
          cr: ['1', '2', '3'],
          size_id: ['1', '2'],
          alignment: ['Lawful Good', 'Neutral'],
          movement: ['fly', 'swim'],
          armor_type: ['Natural Armor', 'Plate'],
          source: ['phb', 'mm']
        }
      },
      {
        name: 'excludes default sort values',
        setup: (store) => {
          store.sortBy = 'name'
          store.sortDirection = 'asc'
        },
        expectedQuery: {}
      },
      {
        name: 'includes non-default sort values',
        setup: (store) => {
          store.sortBy = 'challenge_rating'
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          sort_by: 'challenge_rating',
          sort_direction: 'desc'
        }
      },
      {
        name: 'excludes null and empty array values',
        setup: (store) => {
          store.selectedType = null
          store.isLegendary = null
          store.selectedCRs = []
          store.selectedSources = []
        },
        expectedQuery: {}
      }
    ]
  },

  // -------------------------------------------------------------------------
  // Class Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Class',
    store: useClassFiltersStore,
    initialState: {
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
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'wizard' },
      { field: 'isBaseClass', value: '1' },
      { field: 'isSpellcaster', value: '1' },
      { field: 'selectedSources', value: ['PHB'] },
      { field: 'selectedHitDice', value: [6] },
      { field: 'selectedSpellcastingAbility', value: 'INT' },
      { field: 'selectedParentClass', value: 'Fighter' }
    ],
    activeFilterCountTests: [
      {
        description: 'counts each active filter',
        setup: (store) => {
          store.isBaseClass = '1'
          store.isSpellcaster = '0'
          store.selectedSources = ['PHB', 'XGTE']
          store.selectedHitDice = [6, 8]
          store.selectedSpellcastingAbility = 'INT'
          store.selectedParentClass = 'Fighter'
        },
        expectedCount: 8
      },
      {
        description: 'does not count searchQuery in filter count',
        setup: (store) => {
          store.searchQuery = 'wizard'
        },
        expectedCount: 0
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'wizard'
        store.sortBy = 'hit_die'
        store.sortDirection = 'desc'
        store.selectedSources = ['PHB']
        store.isBaseClass = '1'
        store.isSpellcaster = '0'
        store.selectedHitDice = [6]
        store.selectedSpellcastingAbility = 'INT'
        store.selectedParentClass = 'Fighter'
        store.filtersOpen = true
      },
      expectedDefaults: {
        searchQuery: '',
        sortBy: 'name',
        sortDirection: 'asc',
        selectedSources: [],
        isBaseClass: null,
        isSpellcaster: null,
        selectedHitDice: [],
        selectedSpellcastingAbility: null,
        selectedParentClass: null
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'sets filters from URL query object',
        query: {
          is_base_class: '1',
          is_spellcaster: '0',
          hit_die: ['6', '8'],
          spellcasting_ability: 'INT',
          parent_class_name: 'Fighter',
          source: 'PHB',
          sort_by: 'hit_die',
          sort_direction: 'desc'
        },
        expectedState: {
          isBaseClass: '1',
          isSpellcaster: '0',
          selectedHitDice: ['6', '8'],
          selectedSpellcastingAbility: 'INT',
          selectedParentClass: 'Fighter',
          selectedSources: ['PHB'],
          sortBy: 'hit_die',
          sortDirection: 'desc'
        }
      },
      {
        name: 'array vs string query params (single value)',
        query: { hit_die: '6' },
        expectedState: { selectedHitDice: ['6'] }
      },
      {
        name: 'array vs string query params (multiple values)',
        query: { hit_die: ['6', '8'] },
        expectedState: { selectedHitDice: ['6', '8'] }
      },
      {
        name: 'preserves hit_die as strings',
        query: { hit_die: ['6', '8', '10'] },
        expectedState: { selectedHitDice: ['6', '8', '10'] }
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters active',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'returns query object with active filters',
        setup: (store) => {
          store.isBaseClass = '1'
          store.selectedSources = ['PHB']
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          is_base_class: '1',
          source: ['PHB'],
          sort_direction: 'desc'
        }
      },
      {
        name: 'excludes default sort values',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'includes non-default sort values',
        setup: (store) => {
          store.sortBy = 'hit_die'
        },
        expectedQuery: { sort_by: 'hit_die' }
      },
      {
        name: 'outputs hit_die as strings in URL',
        setup: (store) => {
          store.selectedHitDice = ['6', '8', '10']
        },
        expectedQuery: {
          hit_die: ['6', '8', '10']
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // Race Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Race',
    store: useRaceFiltersStore,
    initialState: {
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
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'elf' },
      { field: 'selectedSize', value: 'M' },
      { field: 'selectedSpeedRange', value: '30' },
      { field: 'raceTypeFilter', value: '0' },
      { field: 'selectedSources', value: ['PHB'] },
      { field: 'selectedAbilityBonuses', value: ['STR'] }
    ],
    activeFilterCountTests: [
      {
        description: 'counts each active filter',
        setup: (store) => {
          store.selectedSize = 'M'
          store.selectedSpeedRange = '30'
          store.raceTypeFilter = '0'
          store.hasInnateSpellsFilter = '1'
          store.selectedSources = ['PHB', 'VGTM']
          store.selectedAbilityBonuses = ['STR', 'DEX']
          store.selectedParentRace = 'Elf'
        },
        expectedCount: 9
      },
      {
        description: 'does not count searchQuery in filter count',
        setup: (store) => {
          store.searchQuery = 'elf'
        },
        expectedCount: 0
      },
      {
        description: 'does not count empty strings or null values',
        setup: (store) => {
          store.selectedSize = ''
          store.selectedSpeedRange = null
          store.selectedParentRace = ''
          store.raceTypeFilter = null
        },
        expectedCount: 0
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'elf'
        store.sortBy = 'speed'
        store.sortDirection = 'desc'
        store.selectedSources = ['PHB']
        store.selectedSize = 'M'
        store.selectedSpeedRange = '30'
        store.selectedParentRace = 'Elf'
        store.raceTypeFilter = '0'
        store.hasInnateSpellsFilter = '1'
        store.selectedAbilityBonuses = ['STR']
        store.filtersOpen = true
      },
      expectedDefaults: {
        searchQuery: '',
        sortBy: 'name',
        sortDirection: 'asc',
        selectedSources: [],
        selectedSize: '',
        selectedSpeedRange: null,
        selectedParentRace: '',
        raceTypeFilter: null,
        hasInnateSpellsFilter: null,
        selectedAbilityBonuses: []
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'sets filters from URL query object',
        query: {
          size: 'M',
          speed: '30',
          parent_race: 'Elf',
          race_type: '0',
          has_innate_spells: '1',
          ability: ['STR', 'DEX'],
          source: 'PHB',
          sort_by: 'speed',
          sort_direction: 'desc'
        },
        expectedState: {
          selectedSize: 'M',
          selectedSpeedRange: '30',
          selectedParentRace: 'Elf',
          raceTypeFilter: '0',
          hasInnateSpellsFilter: '1',
          selectedAbilityBonuses: ['STR', 'DEX'],
          selectedSources: ['PHB'],
          sortBy: 'speed',
          sortDirection: 'desc'
        }
      },
      {
        name: 'array vs string query params (single value)',
        query: { ability: 'STR' },
        expectedState: { selectedAbilityBonuses: ['STR'] }
      },
      {
        name: 'array vs string query params (multiple values)',
        query: { ability: ['STR', 'DEX'] },
        expectedState: { selectedAbilityBonuses: ['STR', 'DEX'] }
      },
      {
        name: 'missing query params gracefully',
        query: { speed: '30' },
        expectedState: { selectedSpeedRange: '30' }
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters active',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'returns query object with active filters',
        setup: (store) => {
          store.selectedSize = 'M'
          store.raceTypeFilter = '0'
          store.selectedSources = ['PHB']
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          size: 'M',
          race_type: '0',
          source: ['PHB'],
          sort_direction: 'desc'
        }
      },
      {
        name: 'excludes default sort values',
        setup: (store) => {
          store.sortBy = 'speed'
        },
        expectedQuery: { sort_by: 'speed' }
      },
      {
        name: 'excludes empty strings and null values',
        setup: (store) => {
          store.selectedSize = ''
          store.selectedSpeedRange = null
          store.selectedParentRace = ''
          store.raceTypeFilter = null
        },
        expectedQuery: {}
      },
      {
        name: 'includes all active filters in URL format',
        setup: (store) => {
          store.selectedSize = 'M'
          store.selectedSpeedRange = '30'
          store.selectedParentRace = 'Elf'
          store.raceTypeFilter = '0'
          store.hasInnateSpellsFilter = '1'
          store.selectedAbilityBonuses = ['STR', 'DEX']
          store.selectedSources = ['PHB', 'VGTM']
        },
        expectedQuery: {
          size: 'M',
          speed: '30',
          parent_race: 'Elf',
          race_type: '0',
          has_innate_spells: '1',
          ability: ['STR', 'DEX'],
          source: ['PHB', 'VGTM']
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // Background Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Background',
    store: useBackgroundFiltersStore,
    initialState: {
      searchQuery: '',
      sortBy: 'name',
      sortDirection: 'asc',
      selectedSources: [],
      selectedSkills: [],
      selectedToolTypes: [],
      languageChoiceFilter: null,
      filtersOpen: false
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'acolyte' },
      { field: 'languageChoiceFilter', value: '1' },
      { field: 'selectedSources', value: ['PHB'] },
      { field: 'selectedSkills', value: ['athletics'] },
      { field: 'selectedToolTypes', value: ['artisan-tools'] }
    ],
    activeFilterCountTests: [
      {
        description: 'counts each active filter',
        setup: (store) => {
          store.languageChoiceFilter = '1'
          store.selectedSources = ['PHB', 'ERLW']
          store.selectedSkills = ['athletics', 'acrobatics']
          store.selectedToolTypes = ['artisan-tools']
        },
        expectedCount: 6
      },
      {
        description: 'does not count searchQuery in filter count',
        setup: (store) => {
          store.searchQuery = 'acolyte'
        },
        expectedCount: 0
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'acolyte'
        store.sortBy = 'level'
        store.sortDirection = 'desc'
        store.selectedSources = ['PHB']
        store.selectedSkills = ['athletics']
        store.selectedToolTypes = ['artisan-tools']
        store.languageChoiceFilter = '1'
        store.filtersOpen = true
      },
      expectedDefaults: {
        searchQuery: '',
        sortBy: 'name',
        sortDirection: 'asc',
        selectedSources: [],
        selectedSkills: [],
        selectedToolTypes: [],
        languageChoiceFilter: null
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'sets filters from URL query object',
        query: {
          skill: ['athletics', 'acrobatics'],
          tool_type: 'artisan-tools',
          grants_language_choice: '1',
          source: 'PHB',
          sort_by: 'name',
          sort_direction: 'desc'
        },
        expectedState: {
          selectedSkills: ['athletics', 'acrobatics'],
          selectedToolTypes: ['artisan-tools'],
          languageChoiceFilter: '1',
          selectedSources: ['PHB'],
          sortBy: 'name',
          sortDirection: 'desc'
        }
      },
      {
        name: 'array vs string query params (single value)',
        query: { skill: 'athletics' },
        expectedState: {
          selectedSkills: ['athletics']
        }
      },
      {
        name: 'array vs string query params (multiple values)',
        query: { skill: ['athletics', 'acrobatics'] },
        expectedState: {
          selectedSkills: ['athletics', 'acrobatics']
        }
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters active',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'returns query object with active filters',
        setup: (store) => {
          store.languageChoiceFilter = '1'
          store.selectedSources = ['PHB']
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          grants_language_choice: '1',
          source: ['PHB'],
          sort_direction: 'desc'
        }
      },
      {
        name: 'excludes default sort values',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'includes non-default sort values',
        setup: (store) => {
          store.sortBy = 'level'
        },
        expectedQuery: {
          sort_by: 'level'
        }
      },
      {
        name: 'includes array filters in query',
        setup: (store) => {
          store.selectedSkills = ['athletics', 'acrobatics']
          store.selectedToolTypes = ['artisan-tools', 'musical-instruments']
        },
        expectedQuery: {
          skill: ['athletics', 'acrobatics'],
          tool_type: ['artisan-tools', 'musical-instruments']
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // Feat Filters Store
  // -------------------------------------------------------------------------
  {
    name: 'Feat',
    store: useFeatFiltersStore,
    initialState: {
      searchQuery: '',
      sortBy: 'name',
      sortDirection: 'asc',
      selectedSources: [],
      hasPrerequisites: null,
      grantsProficiencies: null,
      selectedImprovedAbilities: [],
      selectedPrerequisiteTypes: [],
      filtersOpen: false
    },
    hasActiveFiltersFields: [
      { field: 'searchQuery', value: 'alert' },
      { field: 'hasPrerequisites', value: '1' },
      { field: 'selectedSources', value: ['PHB'] },
      { field: 'selectedImprovedAbilities', value: ['STR'] }
    ],
    activeFilterCountTests: [
      {
        description: 'counts each active filter',
        setup: (store) => {
          store.hasPrerequisites = '1'
          store.grantsProficiencies = '0'
          store.selectedSources = ['PHB', 'XGTE']
          store.selectedImprovedAbilities = ['STR', 'DEX']
        },
        expectedCount: 6
      },
      {
        description: 'does not count searchQuery in filter count',
        setup: (store) => {
          store.searchQuery = 'alert'
        },
        expectedCount: 0
      }
    ],
    clearAllConfig: {
      setFilters: (store) => {
        store.searchQuery = 'alert'
        store.sortBy = 'level'
        store.sortDirection = 'desc'
        store.selectedSources = ['PHB']
        store.hasPrerequisites = '1'
        store.grantsProficiencies = '0'
        store.selectedImprovedAbilities = ['STR']
        store.selectedPrerequisiteTypes = ['Race']
        store.filtersOpen = true
      },
      expectedDefaults: {
        searchQuery: '',
        sortBy: 'name',
        sortDirection: 'asc',
        selectedSources: [],
        hasPrerequisites: null,
        grantsProficiencies: null,
        selectedImprovedAbilities: [],
        selectedPrerequisiteTypes: []
      },
      preservedFields: [{ field: 'filtersOpen', value: true }]
    },
    setFromUrlQueryTests: [
      {
        name: 'sets filters from URL query object',
        query: {
          has_prerequisites: '1',
          grants_proficiencies: '0',
          improved_ability: ['STR', 'DEX'],
          prerequisite_type: 'Race',
          source: 'PHB',
          sort_by: 'name',
          sort_direction: 'desc'
        },
        expectedState: {
          hasPrerequisites: '1',
          grantsProficiencies: '0',
          selectedImprovedAbilities: ['STR', 'DEX'],
          selectedPrerequisiteTypes: ['Race'],
          selectedSources: ['PHB'],
          sortBy: 'name',
          sortDirection: 'desc'
        }
      },
      {
        name: 'array vs string query params (single value)',
        query: { improved_ability: 'STR' },
        expectedState: { selectedImprovedAbilities: ['STR'] }
      },
      {
        name: 'array vs string query params (multiple values)',
        query: { improved_ability: ['STR', 'DEX'] },
        expectedState: { selectedImprovedAbilities: ['STR', 'DEX'] }
      }
    ],
    toUrlQueryTests: [
      {
        name: 'returns empty object when no filters active',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'returns query object with active filters',
        setup: (store) => {
          store.hasPrerequisites = '1'
          store.selectedSources = ['PHB']
          store.sortDirection = 'desc'
        },
        expectedQuery: {
          has_prerequisites: '1',
          source: ['PHB'],
          sort_direction: 'desc'
        }
      },
      {
        name: 'excludes default sort values',
        setup: () => {},
        expectedQuery: {}
      },
      {
        name: 'includes non-default sort values',
        setup: (store) => {
          store.sortBy = 'level'
        },
        expectedQuery: { sort_by: 'level' }
      }
    ]
  }
]

// ============================================================================
// Parameterized Test Runner
// ============================================================================

FILTER_STORE_CONFIGS.forEach(({
  name,
  store,
  initialState,
  hasActiveFiltersFields,
  activeFilterCountTests,
  clearAllConfig,
  setFromUrlQueryTests,
  toUrlQueryTests
}) => {
  describe(`use${name}FiltersStore`, () => {
    usePiniaSetup()

    testInitialState(store as () => Record<string, unknown>, initialState)
    testHasActiveFilters(store as () => { hasActiveFilters: boolean }, hasActiveFiltersFields)
    testActiveFilterCount(store as () => { activeFilterCount: number }, activeFilterCountTests)
    testClearAllAction(store as () => { clearAll: () => void }, clearAllConfig)
    testSetFromUrlQuery(store as () => { setFromUrlQuery: (query: Record<string, unknown>) => void }, setFromUrlQueryTests)
    testToUrlQuery(store as () => { toUrlQuery: Record<string, unknown> }, toUrlQueryTests)
  })
})

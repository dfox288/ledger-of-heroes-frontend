<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Item, ItemType, DamageType, Rarity } from '~/types'
import { useItemFiltersStore } from '~/stores/itemFilters'
import {
  DAMAGE_DICE_OPTIONS,
  VERSATILE_DAMAGE_OPTIONS,
  RECHARGE_TIMING_OPTIONS,
  STRENGTH_REQ_OPTIONS,
  MAGIC_FILTER_OPTIONS,
  ITEM_RANGE_OPTIONS,
  COST_RANGE_OPTIONS,
  ITEM_AC_RANGE_OPTIONS,
  COST_RANGE_PRESETS,
  ITEM_AC_RANGE_PRESETS,
  WEAPON_RANGE_PRESETS
} from '~/config/filterOptions'

// Use filter store instead of local refs
const store = useItemFiltersStore()
const {
  searchQuery,
  sortBy,
  sortDirection,
  selectedSources,
  selectedType,
  selectedRarity,
  selectedMagic,
  hasCharges,
  requiresAttunement,
  stealthDisadvantage,
  selectedProperties,
  selectedDamageTypes,
  selectedDamageDice,
  selectedVersatileDamage,
  selectedRechargeTiming,
  selectedStrengthReq,
  selectedRange,
  selectedCostRange,
  selectedACRange,
  filtersOpen
} = storeToRefs(store)

// URL sync setup (handles mount + debounced store→URL sync)
const { clearFilters } = usePageFilterSetup(store)

// Sort value computed (combines sortBy + sortDirection)
const sortValue = useSortValue(sortBy, sortDirection)

// Source filter options (still need the composable for options)
const { sourceOptions, getSourceName } = useSourceFilter()

// Filter options from centralized config
const costRangeOptions = COST_RANGE_OPTIONS
const acRangeOptions = ITEM_AC_RANGE_OPTIONS
const strengthReqOptions = STRENGTH_REQ_OPTIONS
const damageDiceOptions = DAMAGE_DICE_OPTIONS
const versatileDamageOptions = VERSATILE_DAMAGE_OPTIONS
const rangeOptions = ITEM_RANGE_OPTIONS
const rechargeTimingOptions = RECHARGE_TIMING_OPTIONS

// Fetch item types for filter options (using composable)
const { data: itemTypes } = useReferenceData<ItemType>('/item-types')

// Fetch damage types for filter options
const { data: damageTypes } = useReferenceData<DamageType>('/damage-types')

// Fetch item properties (weapon/armor properties)
// Note: Using /item-properties endpoint instead of /weapon-properties
const { data: itemProperties } = useReferenceData<{
  id: number
  code: string
  name: string
  description: string
}>('/item-properties')

// Fetch rarities for filter options
const { data: rarities } = useReferenceData<Rarity>('/rarities')

// Magic filter options from centralized config
const magicOptions = MAGIC_FILTER_OPTIONS

// Item type filter options
const typeOptions = computed(() => {
  const options: Array<{ label: string, value: number | null }> = [{ label: 'All Types', value: null }]
  if (itemTypes.value) {
    options.push(...itemTypes.value.map((type: ItemType) => ({
      label: type.name,
      value: type.id
    })))
  }
  return options
})

// Rarity filter options
const rarityOptions = computed(() => {
  const options: Array<{ label: string, value: string | null }> = [{ label: 'All Rarities', value: null }]
  if (rarities.value) {
    options.push(...rarities.value.map(r => ({
      label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      value: r.name
    })))
  }
  return options
})

// Damage type filter options
const damageTypeOptions = computed(() => {
  if (!damageTypes.value) return []
  return damageTypes.value.map(dt => ({
    label: dt.name,
    value: dt.code
  }))
})

// Item property filter options (weapon/armor properties like Finesse, Versatile, etc.)
const propertyOptions = computed(() => {
  if (!itemProperties.value) return []
  return itemProperties.value.map(prop => ({
    label: prop.name,
    value: prop.code
  }))
})

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Rarity (Common→Legendary)', value: 'rarity:asc' },
  { label: 'Rarity (Legendary→Common)', value: 'rarity:desc' }
]

// Query builder for custom filters (hybrid: composable + manual for special cases)
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  const meilisearchFilters: string[] = []

  // Standard filters via composable
  const { queryParams: standardParams } = useMeilisearchFilters([
    {
      ref: selectedType,
      field: 'type_code',
      // Transform ID to code for Meilisearch
      transform: id => itemTypes.value?.find(t => t.id === id)?.code || null
    },
    { ref: selectedRarity, field: 'rarity' },
    { ref: selectedMagic, field: 'is_magic', type: 'boolean' },
    // Note: has_prerequisites removed - 'prerequisites' field not filterable in Meilisearch
    { ref: requiresAttunement, field: 'requires_attunement', type: 'boolean' },
    { ref: stealthDisadvantage, field: 'stealth_disadvantage', type: 'boolean' },
    {
      ref: selectedDamageTypes,
      field: 'damage_type',
      type: 'in',
      // Transform damage type codes to names for Meilisearch
      transform: code => damageTypes.value?.find(dt => dt.code === code)?.name || null
    },
    { ref: selectedSources, field: 'source_codes', type: 'in' },
    { ref: selectedProperties, field: 'property_codes', type: 'in' },
    // Weapon/Armor shopping filters (TIER 2 HIGH IMPACT)
    { ref: selectedStrengthReq, field: 'strength_requirement', type: 'greaterThan' },
    { ref: selectedDamageDice, field: 'damage_dice', type: 'in' },
    { ref: selectedVersatileDamage, field: 'versatile_damage', type: 'in' },
    { ref: selectedRechargeTiming, field: 'recharge_timing', type: 'in' },
    // Range preset filters
    { ref: selectedCostRange, field: 'cost_cp', type: 'rangePreset', presets: COST_RANGE_PRESETS },
    { ref: selectedACRange, field: 'armor_class', type: 'rangePreset', presets: ITEM_AC_RANGE_PRESETS },
    { ref: selectedRange, field: 'range_normal', type: 'rangePreset', presets: WEAPON_RANGE_PRESETS }
  ])

  // Extract standard filter string
  if (standardParams.value.filter) {
    meilisearchFilters.push(standardParams.value.filter as string)
  }

  // Special handling for has_charges (needs both > 0 and = 0 logic)
  if (hasCharges.value !== null) {
    const hasCharge = hasCharges.value === '1' || hasCharges.value === 'true'
    // Use has_charges field which is filterable in Meilisearch
    meilisearchFilters.push(`has_charges = ${hasCharge}`)
  }

  // Combine all filters
  if (meilisearchFilters.length > 0) {
    params.filter = meilisearchFilters.join(' AND ')
  }

  // Add sorting
  params.sort_by = sortBy.value
  params.sort_direction = sortDirection.value

  return params
})

// Use entity list composable for all shared logic
const {
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh
} = useEntityList({
  endpoint: '/items',
  cacheKey: 'items-list',
  queryBuilder,
  searchQuery, // Pass store's searchQuery
  seo: {
    title: 'Items & Equipment - D&D 5e Compendium',
    description: 'Browse all D&D 5e items and equipment. Filter by type, rarity, and magic properties.'
  }
})

// Type the data array
const items = computed(() => data.value as Item[])

// Get type name by ID for filter chips
const getTypeName = (typeId: number) => {
  return itemTypes.value?.find((t: ItemType) => t.id === typeId)?.name || 'Unknown'
}

// Get damage type name by code for filter chips
const getDamageTypeName = (code: string) => {
  return damageTypes.value?.find(dt => dt.code === code)?.name || code
}

// Get property name by code for filter chips
const getPropertyName = (code: string) => {
  return itemProperties.value?.find(p => p.code === code)?.name || code
}

// Active filter count (use store getter)
const activeFilterCount = computed(() => store.activeFilterCount)

// Has active filters (use store getter)
const hasActiveFilters = computed(() => store.hasActiveFilters)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/items"
      list-label="Items"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Items & Equipment"
      :total="totalResults"
      description="Browse D&D 5e items and equipment"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search and Filters -->
    <div class="mb-6">
      <UiFilterCollapse
        v-model="filtersOpen"
        label="Filters"
        :badge-count="activeFilterCount"
      >
        <template #search>
          <UiEntitySearchRow
            v-model:search="searchQuery"
            v-model:sources="selectedSources"
            v-model:sort="sortValue"
            placeholder="Search items..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="item"
          />
        </template>

        <!-- Filter Content -->
        <UiFilterLayout>
          <!-- Primary Filters: Dropdowns -->
          <template #primary>
            <UiFilterSelect
              v-model="selectedType"
              :options="typeOptions"
              label="Item Type"
              placeholder="All Types"
              data-testid="type-filter"
            />

            <UiFilterSelect
              v-model="selectedRarity"
              :options="rarityOptions"
              label="Rarity"
              placeholder="All Rarities"
              data-testid="rarity-filter"
            />

            <UiFilterSelect
              v-model="selectedMagic"
              :options="magicOptions"
              label="Magic"
              placeholder="All Items"
              data-testid="magic-filter"
            />

            <UiFilterSelect
              v-model="selectedStrengthReq"
              :options="strengthReqOptions"
              label="STR Required"
              placeholder="All STR"
              data-testid="strength-req-filter"
            />
          </template>

          <!-- Quick Toggles: Boolean yes/no filters only -->
          <template #quick>
            <UiFilterToggle
              v-model="hasCharges"
              label="Has Charges"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="requiresAttunement"
              label="Attunement"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="stealthDisadvantage"
              label="Stealth Disadv."
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>

          <!-- Advanced Filters: Organized by usage frequency -->
          <template #advanced>
            <!-- HIGH FREQUENCY: General item filters -->
            <UiFilterMultiSelect
              v-model="selectedProperties"
              :options="propertyOptions"
              label="Properties"
              placeholder="All Properties"
              color="item"
              class="w-full sm:w-48"
              data-testid="properties-filter"
            />

            <UiFilterSelect
              v-model="selectedCostRange"
              :options="costRangeOptions"
              label="Cost Range"
              placeholder="All Costs"
              data-testid="cost-filter"
            />

            <!-- WEAPON FILTERS: Grouped together -->
            <UiFilterMultiSelect
              v-model="selectedDamageTypes"
              :options="damageTypeOptions"
              label="Damage Types"
              placeholder="All Damage Types"
              color="error"
              class="w-full sm:w-48"
              data-testid="damage-types-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedDamageDice"
              :options="damageDiceOptions"
              label="Damage Dice"
              placeholder="All Damage Dice"
              color="error"
              class="w-full sm:w-48"
              data-testid="damage-dice-filter"
            />

            <UiFilterSelect
              v-model="selectedRange"
              :options="rangeOptions"
              label="Weapon Range"
              placeholder="All Ranges"
              data-testid="range-filter"
            />

            <!-- ARMOR FILTERS -->
            <UiFilterSelect
              v-model="selectedACRange"
              :options="acRangeOptions"
              label="Armor Class"
              placeholder="All AC"
              data-testid="ac-filter"
            />

            <!-- NICHE FILTERS: Less commonly used -->
            <UiFilterMultiSelect
              v-model="selectedVersatileDamage"
              :options="versatileDamageOptions"
              label="Versatile Dice"
              placeholder="All Versatile"
              color="info"
              class="w-full sm:w-48"
              data-testid="versatile-damage-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedRechargeTiming"
              :options="rechargeTimingOptions"
              label="Recharge"
              placeholder="All Recharge"
              color="spell"
              class="w-full sm:w-48"
              data-testid="recharge-timing-filter"
            />
          </template>

          <!-- Actions: Empty (Clear Filters moved to chips row) -->
          <template #actions />
        </UiFilterLayout>
      </UiFilterCollapse>

      <UiFilterChips
        :visible="hasActiveFilters"
        :search-query="searchQuery"
        :active-count="activeFilterCount"
        @clear-search="searchQuery = ''"
        @clear-all="clearFilters"
      >
        <template #sources>
          <UiFilterChip
            v-for="source in selectedSources"
            :key="source"
            color="neutral"
            test-id="source-filter-chip"
            @remove="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ getSourceName(source) }}
          </UiFilterChip>
        </template>

        <!-- Entity-specific chips: Type, Rarity, Magic -->
        <UiFilterChip
          v-if="selectedType !== null"
          color="item"
          test-id="type-filter-chip"
          @remove="selectedType = null"
        >
          Type: {{ getTypeName(selectedType) }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedRarity !== null"
          color="item"
          test-id="rarity-filter-chip"
          @remove="selectedRarity = null"
        >
          Rarity: {{ selectedRarity }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedMagic !== null"
          color="item"
          test-id="magic-filter-chip"
          @remove="selectedMagic = null"
        >
          {{ selectedMagic === 'true' ? 'Magic Items' : 'Non-Magic Items' }}
        </UiFilterChip>

        <!-- Cost, AC, Strength, Range -->
        <UiFilterChip
          v-if="selectedCostRange"
          color="item"
          test-id="cost-filter-chip"
          @remove="selectedCostRange = null"
        >
          Cost: {{ costRangeOptions.find(o => o.value === selectedCostRange)?.label }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedACRange"
          color="item"
          test-id="ac-filter-chip"
          @remove="selectedACRange = null"
        >
          AC: {{ acRangeOptions.find(o => o.value === selectedACRange)?.label }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedStrengthReq !== null"
          color="item"
          test-id="strength-req-filter-chip"
          @remove="selectedStrengthReq = null"
        >
          {{ strengthReqOptions.find(o => o.value === selectedStrengthReq)?.label }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedRange"
          color="item"
          test-id="range-filter-chip"
          @remove="selectedRange = null"
        >
          Range: {{ rangeOptions.find(o => o.value === selectedRange)?.label }}
        </UiFilterChip>

        <!-- Properties, Damage Types, Damage Dice, Versatile, Recharge -->
        <UiFilterChip
          v-for="property in selectedProperties"
          :key="property"
          color="warning"
          test-id="property-filter-chip"
          @remove="selectedProperties = selectedProperties.filter(p => p !== property)"
        >
          {{ getPropertyName(property) }}
        </UiFilterChip>
        <UiFilterChip
          v-for="damageType in selectedDamageTypes"
          :key="damageType"
          color="error"
          test-id="damage-type-filter-chip"
          @remove="selectedDamageTypes = selectedDamageTypes.filter(dt => dt !== damageType)"
        >
          {{ getDamageTypeName(damageType) }}
        </UiFilterChip>
        <UiFilterChip
          v-for="damageDie in selectedDamageDice"
          :key="damageDie"
          color="error"
          test-id="damage-dice-filter-chip"
          @remove="selectedDamageDice = selectedDamageDice.filter(d => d !== damageDie)"
        >
          Damage: {{ damageDie }}
        </UiFilterChip>
        <UiFilterChip
          v-for="versatileDie in selectedVersatileDamage"
          :key="versatileDie"
          color="info"
          test-id="versatile-damage-filter-chip"
          @remove="selectedVersatileDamage = selectedVersatileDamage.filter(v => v !== versatileDie)"
        >
          Versatile: {{ versatileDie }}
        </UiFilterChip>
        <UiFilterChip
          v-for="timing in selectedRechargeTiming"
          :key="timing"
          color="spell"
          test-id="recharge-timing-filter-chip"
          @remove="selectedRechargeTiming = selectedRechargeTiming.filter(t => t !== timing)"
        >
          Recharge: {{ timing.charAt(0).toUpperCase() + timing.slice(1) }}
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="hasCharges !== null"
            color="primary"
            test-id="has-charges-filter-chip"
            @remove="hasCharges = null"
          >
            Has Charges: {{ hasCharges === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="requiresAttunement !== null"
            color="primary"
            test-id="attunement-filter-chip"
            @remove="requiresAttunement = null"
          >
            Attunement: {{ requiresAttunement === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="stealthDisadvantage !== null"
            color="primary"
            test-id="stealth-filter-chip"
            @remove="stealthDisadvantage = null"
          >
            Stealth Disadv.: {{ stealthDisadvantage === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <UiListStates
      :loading="loading"
      :error="error"
      :empty="items.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="item"
      entity-name-plural="Items"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
        />
      </template>
    </UiListStates>

    <UiBackLink />
  </div>
</template>

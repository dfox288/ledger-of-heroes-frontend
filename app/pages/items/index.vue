<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Item, ItemType, DamageType } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')
const sortValue = useSortValue(sortBy, sortDirection)

// Source filter (using composable)
const { selectedSources, sourceOptions, getSourceName, clearSources } = useSourceFilter()

// Custom filter state (entity-specific) - PRIMARY section
const selectedType = ref(route.query.type ? Number(route.query.type) : null)
const selectedRarity = ref((route.query.rarity as string) || null)
const selectedMagic = ref((route.query.is_magic as string) || null)

// QUICK section (toggles)
const hasCharges = ref<string | null>((route.query.has_charges as string) || null)
const requiresAttunement = ref<string | null>((route.query.requires_attunement as string) || null)
const stealthDisadvantage = ref<string | null>((route.query.stealth_disadvantage as string) || null)

// ADVANCED section (multiselects)
const selectedProperties = ref<string[]>(
  route.query.property ? (Array.isArray(route.query.property) ? route.query.property : [route.query.property]) as string[] : []
)
const selectedDamageTypes = ref<string[]>(
  route.query.damage_type ? (Array.isArray(route.query.damage_type) ? route.query.damage_type : [route.query.damage_type]) as string[] : []
)

// Weapon/Armor shopping filters (TIER 2 HIGH IMPACT)
const selectedStrengthReq = ref<string | null>((route.query.strength_req as string) || null)
const selectedDamageDice = ref<string[]>(
  route.query.damage_dice ? (Array.isArray(route.query.damage_dice) ? route.query.damage_dice : [route.query.damage_dice]) as string[] : []
)
const selectedVersatileDamage = ref<string[]>(
  route.query.versatile_damage ? (Array.isArray(route.query.versatile_damage) ? route.query.versatile_damage : [route.query.versatile_damage]) as string[] : []
)
const selectedRange = ref<string | null>((route.query.range as string) || null)
const selectedRechargeTiming = ref<string[]>(
  route.query.recharge_timing ? (Array.isArray(route.query.recharge_timing) ? route.query.recharge_timing : [route.query.recharge_timing]) as string[] : []
)

// Cost filter
const selectedCostRange = ref<string | null>(null)
const costRangeOptions = [
  { label: 'All Prices', value: null },
  { label: 'Under 1 gp', value: 'under-100' },
  { label: '1-10 gp', value: '100-1000' },
  { label: '10-100 gp', value: '1000-10000' },
  { label: '100-1000 gp', value: '10000-100000' },
  { label: '1000+ gp', value: 'over-100000' }
]

// AC filter
const selectedACRange = ref<string | null>(null)
const acRangeOptions = [
  { label: 'All AC', value: null },
  { label: 'Light (11-14)', value: '11-14' },
  { label: 'Medium (15-16)', value: '15-16' },
  { label: 'Heavy (17+)', value: '17-21' }
]

// Weapon/Armor shopping filter options
const strengthReqOptions = [
  { label: 'Any', value: null },
  { label: 'STR 13+', value: '13' },
  { label: 'STR 15+', value: '15' }
]

const damageDiceOptions = [
  { label: '1d4', value: '1d4' },
  { label: '1d6', value: '1d6' },
  { label: '1d8', value: '1d8' },
  { label: '1d10', value: '1d10' },
  { label: '1d12', value: '1d12' },
  { label: '2d6', value: '2d6' }
]

const versatileDamageOptions = [
  { label: '1d8', value: '1d8' },
  { label: '1d10', value: '1d10' },
  { label: '1d12', value: '1d12' }
]

const rangeOptions = [
  { label: 'Any', value: null },
  { label: 'Short (<30ft)', value: 'under-30' },
  { label: 'Medium (30-80ft)', value: '30-80' },
  { label: 'Long (80-150ft)', value: '80-150' },
  { label: 'Very Long (>150ft)', value: 'over-150' }
]

const rechargeTimingOptions = [
  { label: 'Dawn', value: 'dawn' },
  { label: 'Dusk', value: 'dusk' }
]

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

// Rarity options from D&D rules
const rarityOptions = [
  { label: 'All Rarities', value: null },
  { label: 'Common', value: 'common' },
  { label: 'Uncommon', value: 'uncommon' },
  { label: 'Rare', value: 'rare' },
  { label: 'Very Rare', value: 'very rare' },
  { label: 'Legendary', value: 'legendary' },
  { label: 'Artifact', value: 'artifact' }
]

// Magic filter options
const magicOptions = [
  { label: 'All Items', value: null },
  { label: 'Magic Items', value: 'true' },
  { label: 'Non-Magic Items', value: 'false' }
]

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
      transform: (id) => itemTypes.value?.find(t => t.id === id)?.code || null
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
      transform: (code) => damageTypes.value?.find(dt => dt.code === code)?.name || null
    },
    { ref: selectedSources, field: 'source_codes', type: 'in' },
    { ref: selectedProperties, field: 'property_codes', type: 'in' },
    // Weapon/Armor shopping filters (TIER 2 HIGH IMPACT)
    { ref: selectedStrengthReq, field: 'strength_requirement', type: 'greaterThan' },
    { ref: selectedDamageDice, field: 'damage_dice', type: 'in' },
    { ref: selectedVersatileDamage, field: 'versatile_damage', type: 'in' },
    { ref: selectedRechargeTiming, field: 'recharge_timing', type: 'in' }
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

  // Cost range filter
  if (selectedCostRange.value) {
    const ranges: Record<string, string> = {
      'under-100': 'cost_cp < 100',
      '100-1000': 'cost_cp >= 100 AND cost_cp <= 1000',
      '1000-10000': 'cost_cp >= 1000 AND cost_cp <= 10000',
      '10000-100000': 'cost_cp >= 10000 AND cost_cp <= 100000',
      'over-100000': 'cost_cp >= 100000'
    }
    const rangeFilter = ranges[selectedCostRange.value]
    if (rangeFilter) {
      meilisearchFilters.push(rangeFilter)
    }
  }

  // AC range filter
  if (selectedACRange.value) {
    const ranges: Record<string, string> = {
      '11-14': 'armor_class >= 11 AND armor_class <= 14',
      '15-16': 'armor_class >= 15 AND armor_class <= 16',
      '17-21': 'armor_class >= 17 AND armor_class <= 21'
    }
    const rangeFilter = ranges[selectedACRange.value]
    if (rangeFilter) {
      meilisearchFilters.push(rangeFilter)
    }
  }

  // Weapon range filter (TIER 2 HIGH IMPACT)
  if (selectedRange.value) {
    const ranges: Record<string, string> = {
      'under-30': 'range_normal < 30',
      '30-80': 'range_normal >= 30 AND range_normal <= 80',
      '80-150': 'range_normal >= 80 AND range_normal <= 150',
      'over-150': 'range_normal > 150'
    }
    const rangeFilter = ranges[selectedRange.value]
    if (rangeFilter) {
      meilisearchFilters.push(rangeFilter)
    }
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
  searchQuery,
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters: clearBaseFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/items',
  cacheKey: 'items-list',
  queryBuilder,
  seo: {
    title: 'Items & Equipment - D&D 5e Compendium',
    description: 'Browse all D&D 5e items and equipment. Filter by type, rarity, and magic properties.'
  }
})

// Type the data array
const items = computed(() => data.value as Item[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  clearSources()
  selectedType.value = null
  selectedRarity.value = null
  selectedMagic.value = null
  hasCharges.value = null
  requiresAttunement.value = null
  stealthDisadvantage.value = null
  selectedProperties.value = []
  selectedDamageTypes.value = []
  selectedCostRange.value = null
  selectedACRange.value = null
  // Weapon/Armor shopping filters (TIER 2 HIGH IMPACT)
  selectedStrengthReq.value = null
  selectedDamageDice.value = []
  selectedVersatileDamage.value = []
  selectedRange.value = null
  selectedRechargeTiming.value = []
}

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

// Pagination settings
const perPage = 24

// Count active filters (excluding search) for collapse badge (using composable)
const activeFilterCount = useFilterCount(
  selectedType,
  selectedRarity,
  selectedMagic,
  hasCharges,
  requiresAttunement,
  stealthDisadvantage,
  selectedProperties,
  selectedDamageTypes,
  selectedSources,
  selectedCostRange,
  selectedACRange,
  // Weapon/Armor shopping filters (TIER 2 HIGH IMPACT)
  selectedStrengthReq,
  selectedDamageDice,
  selectedVersatileDamage,
  selectedRange,
  selectedRechargeTiming
)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
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

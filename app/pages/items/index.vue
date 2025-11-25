<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Item, ItemType, DamageType, Source } from '~/types'

const route = useRoute()
// Note: useApi no longer needed for reference fetches (handled by useReferenceData)

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

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
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
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

// Fetch sources for filter options
const { data: sources } = useReferenceData<Source>('/sources')

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

// Source filter options
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name,
    value: source.code
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

// Computed sort value for USelectMenu binding
const sortValue = computed({
  get: () => `${sortBy.value}:${sortDirection.value}`,
  set: (value: string) => {
    const [newSortBy, newSortDirection] = value.split(':')
    sortBy.value = newSortBy
    sortDirection.value = newSortDirection as 'asc' | 'desc'
  }
})

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
  selectedType.value = null
  selectedRarity.value = null
  selectedMagic.value = null
  hasCharges.value = null
  requiresAttunement.value = null
  stealthDisadvantage.value = null
  selectedProperties.value = []
  selectedDamageTypes.value = []
  selectedSources.value = []
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

// Get source name by code for filter chips
const getSourceName = (code: string) => {
  return sources.value?.find(s => s.code === code)?.name || code
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
          <div class="flex gap-2 w-full">
            <UInput
              v-model="searchQuery"
              placeholder="Search items..."
              class="flex-1"
            >
              <template
                v-if="searchQuery"
                #trailing
              >
                <UButton
                  color="neutral"
                  variant="link"
                  :padded="false"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>

            <!-- Source filter moved to prominent position -->
            <UiFilterMultiSelect
              v-model="selectedSources"
              :options="sourceOptions"
              placeholder="All Sources"
              color="item"
              class="w-full sm:w-48"
              data-testid="source-filter"
            />

            <USelectMenu
              v-model="sortValue"
              :items="sortOptions"
              value-key="value"
              placeholder="Sort by..."
              size="md"
              class="w-full sm:w-48"
            />
          </div>
        </template>

        <!-- Filter Content -->
        <UiFilterLayout>
          <!-- Primary Filters: Most frequently used (Type, Rarity, Magic) -->
          <template #primary>
            <USelectMenu
              v-model="selectedType"
              :items="typeOptions"
              value-key="value"
              placeholder="All Types"
              size="md"
              class="w-full sm:w-48"
            />

            <USelectMenu
              v-model="selectedRarity"
              :items="rarityOptions"
              value-key="value"
              placeholder="All Rarities"
              size="md"
              class="w-full sm:w-44"
            />

            <USelectMenu
              v-model="selectedMagic"
              :items="magicOptions"
              value-key="value"
              placeholder="All Items"
              size="md"
              class="w-full sm:w-44"
            />
          </template>

          <!-- Quick Toggles: Binary filters (Charges, Attunement, Stealth) -->
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

            <!-- Strength Requirement Filter (TIER 2 HIGH IMPACT) -->
            <USelectMenu
              v-model="selectedStrengthReq"
              :items="strengthReqOptions"
              value-key="value"
              placeholder="Strength Req"
              size="md"
              class="w-full sm:w-32"
              data-testid="strength-req-filter"
            />
          </template>

          <!-- Advanced Filters: Multiselects (Properties, Damage Types, Sources) -->
          <template #advanced>
            <!-- Cost Range Filter -->
            <USelectMenu
              v-model="selectedCostRange"
              :items="costRangeOptions"
              value-key="value"
              placeholder="Cost"
              size="md"
              class="w-full sm:w-44"
              data-testid="cost-filter"
            />

            <!-- AC Range Filter -->
            <USelectMenu
              v-model="selectedACRange"
              :items="acRangeOptions"
              value-key="value"
              placeholder="Armor Class"
              size="md"
              class="w-full sm:w-44"
              data-testid="ac-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedProperties"
              :options="propertyOptions"
              label="Properties"
              placeholder="All Properties"
              color="primary"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedDamageTypes"
              :options="damageTypeOptions"
              label="Damage Types"
              placeholder="All Damage Types"
              color="primary"
              class="w-full sm:w-48"
            />

            <!-- Weapon/Armor Shopping Filters (TIER 2 HIGH IMPACT) -->
            <UiFilterMultiSelect
              v-model="selectedDamageDice"
              :options="damageDiceOptions"
              label="Damage Dice"
              placeholder="All Damage Dice"
              color="primary"
              class="w-full sm:w-48"
              data-testid="damage-dice-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedVersatileDamage"
              :options="versatileDamageOptions"
              label="Versatile Damage"
              placeholder="All Versatile"
              color="primary"
              class="w-full sm:w-48"
              data-testid="versatile-damage-filter"
            />

            <USelectMenu
              v-model="selectedRange"
              :items="rangeOptions"
              value-key="value"
              placeholder="Range"
              size="md"
              class="w-full sm:w-48"
              data-testid="range-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedRechargeTiming"
              :options="rechargeTimingOptions"
              label="Recharge Timing"
              placeholder="All Timings"
              color="primary"
              class="w-full sm:w-48"
              data-testid="recharge-timing-filter"
            />
          </template>

          <!-- Actions: Empty (Clear Filters moved to chips row) -->
          <template #actions />
        </UiFilterLayout>
      </UiFilterCollapse>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center justify-between gap-2 pt-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="activeFilterCount > 0 || searchQuery"
            class="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            Active filters:
          </span>
          <UButton
            v-if="selectedType !== null"
            size="xs"
            color="warning"
            variant="soft"
            @click="selectedType = null"
          >
            {{ getTypeName(selectedType) }} ✕
          </UButton>
          <UButton
            v-if="selectedRarity !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedRarity = null"
          >
            {{ selectedRarity }} ✕
          </UButton>
          <UButton
            v-if="selectedMagic !== null"
            size="xs"
            color="info"
            variant="soft"
            @click="selectedMagic = null"
          >
            {{ selectedMagic === 'true' ? 'Magic' : 'Non-Magic' }} ✕
          </UButton>
          <UButton
            v-if="hasCharges !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasCharges = null"
          >
            Has Charges: {{ hasCharges === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="requiresAttunement !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="requiresAttunement = null"
          >
            Attunement: {{ requiresAttunement === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="stealthDisadvantage !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="stealthDisadvantage = null"
          >
            Stealth Disadv.: {{ stealthDisadvantage === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <!-- Cost Range Chip -->
          <UButton
            v-if="selectedCostRange"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedCostRange = null"
          >
            {{ costRangeOptions.find(o => o.value === selectedCostRange)?.label }} ✕
          </UButton>
          <!-- AC Range Chip -->
          <UButton
            v-if="selectedACRange"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedACRange = null"
          >
            AC: {{ acRangeOptions.find(o => o.value === selectedACRange)?.label }} ✕
          </UButton>
          <!-- Property chips -->
          <UButton
            v-for="property in selectedProperties"
            :key="property"
            size="xs"
            color="warning"
            variant="soft"
            @click="selectedProperties = selectedProperties.filter(p => p !== property)"
          >
            {{ getPropertyName(property) }} ✕
          </UButton>
          <!-- Damage type chips -->
          <UButton
            v-for="damageType in selectedDamageTypes"
            :key="damageType"
            size="xs"
            color="error"
            variant="soft"
            @click="selectedDamageTypes = selectedDamageTypes.filter(dt => dt !== damageType)"
          >
            {{ getDamageTypeName(damageType) }} ✕
          </UButton>
          <!-- Source chips -->
          <UButton
            v-for="source in selectedSources"
            :key="source"
            size="xs"
            color="neutral"
            variant="soft"
            @click="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ getSourceName(source) }} ✕
          </UButton>
          <!-- Weapon/Armor Shopping Filter Chips (TIER 2 HIGH IMPACT) -->
          <UButton
            v-if="selectedStrengthReq !== null"
            size="xs"
            color="warning"
            variant="soft"
            @click="selectedStrengthReq = null"
          >
            {{ strengthReqOptions.find(o => o.value === selectedStrengthReq)?.label }} ✕
          </UButton>
          <UButton
            v-for="damageDie in selectedDamageDice"
            :key="damageDie"
            size="xs"
            color="error"
            variant="soft"
            @click="selectedDamageDice = selectedDamageDice.filter(d => d !== damageDie)"
          >
            {{ damageDie }} ✕
          </UButton>
          <UButton
            v-for="versatileDie in selectedVersatileDamage"
            :key="versatileDie"
            size="xs"
            color="info"
            variant="soft"
            @click="selectedVersatileDamage = selectedVersatileDamage.filter(v => v !== versatileDie)"
          >
            Versatile: {{ versatileDie }} ✕
          </UButton>
          <UButton
            v-if="selectedRange"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedRange = null"
          >
            Range: {{ rangeOptions.find(o => o.value === selectedRange)?.label }} ✕
          </UButton>
          <UButton
            v-for="timing in selectedRechargeTiming"
            :key="timing"
            size="xs"
            color="spell"
            variant="soft"
            @click="selectedRechargeTiming = selectedRechargeTiming.filter(t => t !== timing)"
          >
            {{ timing.charAt(0).toUpperCase() + timing.slice(1) }} ✕
          </UButton>
          <UButton
            v-if="searchQuery"
            size="xs"
            color="neutral"
            variant="soft"
            @click="searchQuery = ''"
          >
            "{{ searchQuery }}" ✕
          </UButton>
        </div>

        <!-- Clear Filters Button (right-aligned) -->
        <UButton
          v-if="activeFilterCount > 0 || searchQuery"
          color="neutral"
          variant="soft"
          size="sm"
          @click="clearFilters"
        >
          Clear filters
        </UButton>
      </div>
    </div>

    <!-- Loading State (Skeleton Cards) -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Items"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="items.length === 0"
      entity-name="items"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="meta?.from || 0"
        :to="meta?.to || 0"
        :total="totalResults"
        entity-name="item"
      />

      <!-- Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
        />
      </div>

      <!-- Pagination -->
      <UiListPagination
        v-model="currentPage"
        :total="totalResults"
        :items-per-page="perPage"
      />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>

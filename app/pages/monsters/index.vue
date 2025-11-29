<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Monster, Size, MonsterType, ArmorType, Alignment } from '~/types'
import { useMonsterFiltersStore } from '~/stores/monsterFilters'
import { CR_OPTIONS, MOVEMENT_TYPE_OPTIONS, MONSTER_AC_RANGE_OPTIONS, MONSTER_HP_RANGE_OPTIONS, AC_RANGE_PRESETS, HP_RANGE_PRESETS } from '~/config/filterOptions'

// Initialize store and URL sync
const store = useMonsterFiltersStore()
const { clearFilters: clearStoreFilters } = usePageFilterSetup(store)

// Convert store state to refs
const {
  searchQuery,
  sortBy,
  sortDirection,
  selectedSources,
  selectedCRs,
  selectedType,
  isLegendary,
  selectedSizes,
  selectedAlignments,
  selectedMovementTypes,
  selectedArmorTypes,
  canHover,
  hasLairActions,
  hasReactions,
  isSpellcaster,
  hasMagicResistance,
  selectedACRange,
  selectedHPRange,
  filtersOpen
} = storeToRefs(store)

// Derived values
const sortValue = useSortValue(sortBy, sortDirection)
const { sourceOptions, getSourceName } = useSourceFilter()

// Filter options from centralized config
const acRangeOptions = MONSTER_AC_RANGE_OPTIONS
const hpRangeOptions = MONSTER_HP_RANGE_OPTIONS

// Fetch reference data for filters
const { data: sizes } = useReferenceData<Size>('/sizes')
const { data: armorTypes } = useReferenceData<ArmorType>('/armor-types')
const { data: monsterTypes } = useReferenceData<MonsterType>('/monster-types')
const { data: alignments } = useReferenceData<Alignment>('/alignments')

// Filter options from centralized config
const movementTypeOptions = MOVEMENT_TYPE_OPTIONS
const crOptions = CR_OPTIONS

// Size options from reference data
const sizeOptions = computed(() =>
  sizes.value?.map(s => ({ label: s.name, value: String(s.id) })) || []
)

// Alignment options from reference data
const alignmentOptions = computed(() =>
  alignments.value?.map(a => ({ label: a.name, value: a.name })) || []
)

// Type options from API
const typeOptions = computed(() => {
  const options: Array<{ label: string, value: string | null }> = [{ label: 'All Types', value: null }]
  if (monsterTypes.value) {
    options.push(...monsterTypes.value.map(mt => ({
      label: mt.name,
      value: mt.slug
    })))
  }
  return options
})

// Armor Type options from reference data
const armorTypeOptions = computed(() =>
  armorTypes.value?.map(at => ({ label: at.name, value: at.name })) || []
)

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'CR (Low→High)', value: 'challenge_rating:asc' },
  { label: 'CR (High→Low)', value: 'challenge_rating:desc' }
]

// Query builder (using composable for all filters)
const { queryParams: filterParams } = useMeilisearchFilters([
  // CR multiselect filter (convert strings to numbers for API)
  {
    ref: selectedCRs,
    field: 'challenge_rating',
    type: 'in',
    transform: crs => crs.map(Number)
  },
  { ref: selectedType, field: 'type' },
  // FIX: Changed from 'is_legendary' to 'has_legendary_actions' (correct Meilisearch field)
  { ref: isLegendary, field: 'has_legendary_actions', type: 'boolean' },
  // FIX: Changed from 'size_id' to 'size_code' and transform ID to code
  {
    ref: selectedSizes,
    field: 'size_code',
    type: 'in',
    transform: (sizeIds: string[]) => sizeIds.map((id: string) => {
      const size = sizes.value?.find(s => String(s.id) === id)
      return size?.code || null
    }).filter((code: string | null): code is string => code !== null)
  },
  // Alignment multiselect filter - values with spaces are auto-quoted by composable
  {
    ref: selectedAlignments,
    field: 'alignment',
    type: 'in'
  },
  // Note: Movement types handled manually in queryBuilder (requires IS NOT NULL syntax)
  // Other filters
  { ref: selectedArmorTypes, field: 'armor_type', type: 'in' },
  { ref: hasLairActions, field: 'has_lair_actions', type: 'boolean' },
  { ref: hasReactions, field: 'has_reactions', type: 'boolean' },
  { ref: isSpellcaster, field: 'is_spellcaster', type: 'boolean' },
  { ref: hasMagicResistance, field: 'has_magic_resistance', type: 'boolean' },
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  // Range preset filters
  { ref: selectedACRange, field: 'armor_class', type: 'rangePreset', presets: AC_RANGE_PRESETS },
  { ref: selectedHPRange, field: 'hit_points_average', type: 'rangePreset', presets: HP_RANGE_PRESETS }
])

const queryBuilder = computed(() => {
  const params = { ...filterParams.value }
  const meilisearchFilters: string[] = []

  // Start with filters from composable
  if (params.filter) {
    meilisearchFilters.push(params.filter as string)
  }

  // Add movement types filter (uses IS NOT NULL for each selected type)
  if (selectedMovementTypes.value.length > 0) {
    const movementFilters = selectedMovementTypes.value.map((type) => {
      const fieldMap: Record<string, string> = {
        fly: 'speed_fly',
        swim: 'speed_swim',
        burrow: 'speed_burrow',
        climb: 'speed_climb',
        hover: 'can_hover'
      }
      const field = fieldMap[type]
      // For hover, it's a boolean field; for others, check IS NOT NULL
      return type === 'hover' ? `${field} = true` : `${field} IS NOT NULL`
    })
    // All selected movement types must be present (AND logic)
    meilisearchFilters.push(`(${movementFilters.join(' AND ')})`)
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

// Use entity list composable
const {
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh
} = useEntityList({
  endpoint: '/monsters',
  cacheKey: 'monsters-list',
  queryBuilder,
  searchQuery, // Pass store's searchQuery
  seo: {
    title: 'Monsters - D&D 5e Compendium',
    description: 'Browse D&D 5e monsters with stats, abilities, and lore. Filter by Challenge Rating and creature type.'
  }
})

const monsters = computed(() => data.value as Monster[])

// Clear all filters (wraps composable + resets page)
const clearFilters = () => {
  clearStoreFilters()
  currentPage.value = 1
}

// Helper functions for filter chips
const getCRLabel = (cr: string) => {
  // Convert back to display format (e.g., "0.125" → "CR 1/8", "5" → "CR 5")
  return crOptions.find(o => o.value === cr)?.label || `CR ${cr}`
}

// Get CR filter display text for chips
const getCRFilterText = computed(() => {
  if (selectedCRs.value.length === 0) return null

  const labels = selectedCRs.value
    .sort((a, b) => Number(a) - Number(b))
    .map(cr => getCRLabel(cr).replace('CR ', '')) // Remove "CR " prefix for compactness

  const prefix = selectedCRs.value.length === 1 ? 'CR' : 'CRs'
  return `${prefix}: ${labels.join(', ')}`
})

const clearCRFilter = () => {
  selectedCRs.value = []
}

const getTypeLabel = (type: string) => {
  return typeOptions.value.find(o => o.value === type)?.label || type
}

// Helper functions for size filter chips
const getSizeLabel = (sizeId: string) => {
  return sizeOptions.value.find(o => o.value === sizeId)?.label || sizeId
}

// Get Size filter display text for chips
const getSizeFilterText = computed(() => {
  if (selectedSizes.value.length === 0) return null

  const labels = selectedSizes.value
    .map(sizeId => getSizeLabel(sizeId))
    .sort()

  const prefix = selectedSizes.value.length === 1 ? 'Size' : 'Sizes'
  return `${prefix}: ${labels.join(', ')}`
})

const clearSizeFilter = () => {
  selectedSizes.value = []
}

// Helper functions for alignment filter chips
const getAlignmentFilterText = computed(() => {
  if (selectedAlignments.value.length === 0) return null

  const labels = selectedAlignments.value.sort()
  const prefix = selectedAlignments.value.length === 1 ? 'Alignment' : 'Alignments'
  return `${prefix}: ${labels.join(', ')}`
})

const clearAlignmentFilter = () => {
  selectedAlignments.value = []
}

// Helper functions for armor type filter chips
const getArmorTypeFilterText = computed(() => {
  if (selectedArmorTypes.value.length === 0) return null

  const labels = selectedArmorTypes.value.sort()
  const prefix = selectedArmorTypes.value.length === 1 ? 'Armor Type' : 'Armor Types'
  return `${prefix}: ${labels.join(', ')}`
})

const clearArmorTypeFilter = () => {
  selectedArmorTypes.value = []
}

// Helper functions for movement types filter chip
const getMovementTypesFilterText = computed(() => {
  if (selectedMovementTypes.value.length === 0) return null

  const labels = selectedMovementTypes.value
    .map(type => movementTypeOptions.find(o => o.value === type)?.label || type)
    .sort()

  return `Movement: ${labels.join(', ')}`
})

const clearMovementTypesFilter = () => {
  selectedMovementTypes.value = []
}

// Use getters from store
const activeFilterCount = computed(() => store.activeFilterCount)
const hasActiveFilters = computed(() => store.hasActiveFilters)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/monsters"
      list-label="Monsters"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Monsters"
      :total="totalResults"
      description="Browse D&D 5e monsters with stats, abilities, and lore"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Filters -->
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
            placeholder="Search monsters..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="monster"
          />
        </template>

        <UiFilterLayout>
          <!-- Primary Filters: Dropdowns and multiselects -->
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedCRs"
              data-testid="cr-filter-multiselect"
              :options="crOptions"
              label="Challenge Rating"
              placeholder="All CRs"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterSelect
              v-model="selectedType"
              :options="typeOptions"
              label="Creature Type"
              placeholder="All Types"
              data-testid="type-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedSizes"
              data-testid="size-filter-multiselect"
              :options="sizeOptions"
              label="Size"
              placeholder="All Sizes"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedAlignments"
              data-testid="alignment-filter-multiselect"
              :options="alignmentOptions"
              label="Alignment"
              placeholder="All Alignments"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedMovementTypes"
              data-testid="movement-types-filter"
              :options="movementTypeOptions"
              label="Movement"
              placeholder="All Movement"
              color="monster"
              class="w-full sm:w-48"
            />
          </template>

          <!-- Quick Toggles: Boolean yes/no filters only -->
          <template #quick>
            <UiFilterToggle
              v-model="isLegendary"
              label="Legendary"
              color="error"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasLairActions"
              data-testid="has-lair-actions-toggle"
              label="Lair Actions"
              color="warning"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasReactions"
              data-testid="has-reactions-toggle"
              label="Reactions"
              color="secondary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="isSpellcaster"
              data-testid="is-spellcaster-toggle"
              label="Spellcaster"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasMagicResistance"
              data-testid="has-magic-resistance-toggle"
              label="Magic Resist"
              color="success"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>

          <!-- Advanced Filters: Stat ranges -->
          <template #advanced>
            <UiFilterMultiSelect
              v-model="selectedArmorTypes"
              data-testid="armor-type-filter-multiselect"
              :options="armorTypeOptions"
              label="Armor Type"
              placeholder="All Armor"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterSelect
              v-model="selectedACRange"
              :options="acRangeOptions"
              label="AC Range"
              placeholder="All AC"
              data-testid="ac-filter"
            />

            <UiFilterSelect
              v-model="selectedHPRange"
              :options="hpRangeOptions"
              label="HP Range"
              placeholder="All HP"
              data-testid="hp-filter"
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

        <!-- Entity-specific chips: CR, Type, Size, Alignment, Movement, AC, HP, Armor -->
        <UiFilterChip
          v-if="getCRFilterText"
          color="monster"
          test-id="cr-filter-chip"
          @remove="clearCRFilter"
        >
          {{ getCRFilterText }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedType !== null"
          color="monster"
          test-id="type-filter-chip"
          @remove="selectedType = null"
        >
          Type: {{ getTypeLabel(selectedType) }}
        </UiFilterChip>
        <UiFilterChip
          v-if="getSizeFilterText"
          color="monster"
          test-id="size-filter-chip"
          @remove="clearSizeFilter"
        >
          {{ getSizeFilterText }}
        </UiFilterChip>
        <UiFilterChip
          v-if="getAlignmentFilterText"
          color="monster"
          test-id="alignment-filter-chip"
          @remove="clearAlignmentFilter"
        >
          {{ getAlignmentFilterText }}
        </UiFilterChip>
        <UiFilterChip
          v-if="getMovementTypesFilterText"
          color="monster"
          test-id="movement-types-chip"
          @remove="clearMovementTypesFilter"
        >
          {{ getMovementTypesFilterText }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedACRange"
          color="monster"
          test-id="ac-filter-chip"
          @remove="selectedACRange = null"
        >
          AC: {{ acRangeOptions.find(o => o.value === selectedACRange)?.label }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedHPRange"
          color="monster"
          test-id="hp-filter-chip"
          @remove="selectedHPRange = null"
        >
          HP: {{ hpRangeOptions.find(o => o.value === selectedHPRange)?.label }}
        </UiFilterChip>
        <UiFilterChip
          v-if="getArmorTypeFilterText"
          color="monster"
          test-id="armor-type-filter-chip"
          @remove="clearArmorTypeFilter"
        >
          {{ getArmorTypeFilterText }}
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="isLegendary !== null"
            color="primary"
            test-id="is-legendary-filter-chip"
            @remove="isLegendary = null"
          >
            Legendary: {{ isLegendary === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="hasLairActions !== null"
            color="primary"
            test-id="has-lair-actions-filter-chip"
            @remove="hasLairActions = null"
          >
            Lair Actions: {{ hasLairActions === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="hasReactions !== null"
            color="primary"
            test-id="has-reactions-filter-chip"
            @remove="hasReactions = null"
          >
            Reactions: {{ hasReactions === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="isSpellcaster !== null"
            color="primary"
            test-id="is-spellcaster-filter-chip"
            @remove="isSpellcaster = null"
          >
            Spellcaster: {{ isSpellcaster === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="hasMagicResistance !== null"
            color="primary"
            test-id="has-magic-resistance-filter-chip"
            @remove="hasMagicResistance = null"
          >
            Magic Resistance: {{ hasMagicResistance === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <UiListStates
      :loading="loading"
      :error="error"
      :empty="monsters.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="monster"
      entity-name-plural="Monsters"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <MonsterCard
          v-for="monster in monsters"
          :key="monster.id"
          :monster="monster"
        />
      </template>
    </UiListStates>

    <UiBackLink />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { Race, Size, AbilityScore } from '~/types'
import { useRaceFiltersStore } from '~/stores/raceFilters'

const route = useRoute()

// Use filter store instead of local refs
const store = useRaceFiltersStore()
const {
  searchQuery,
  sortBy,
  sortDirection,
  selectedSources,
  selectedSize,
  selectedSpeedRange,
  selectedParentRace,
  raceTypeFilter,
  hasInnateSpellsFilter,
  selectedAbilityBonuses,
  filtersOpen
} = storeToRefs(store)

// URL sync composable
const { hasUrlParams, syncToUrl, clearUrl } = useFilterUrlSync()

// On mount: URL params override persisted state
onMounted(() => {
  if (hasUrlParams.value) {
    store.setFromUrlQuery(route.query)
  }
})

// Sync store changes to URL (debounced)
let urlSyncTimeout: ReturnType<typeof setTimeout> | null = null
watch(
  () => store.toUrlQuery,
  (query) => {
    if (urlSyncTimeout) clearTimeout(urlSyncTimeout)
    urlSyncTimeout = setTimeout(() => {
      syncToUrl(query)
    }, 300)
  },
  { deep: true }
)

// Sort value computed (combines sortBy + sortDirection)
const sortValue = useSortValue(sortBy, sortDirection)

// Source filter options (still need the composable for options)
const { sourceOptions, getSourceName } = useSourceFilter()

// Fetch reference data
const { data: sizes } = useReferenceData<Size>('/sizes', { cacheKey: 'sizes-for-races' })
const { data: baseRaces } = useReferenceData<Race>('/races', {
  transform: (data) => data.filter(r => !r.parent_race)
})
const { data: abilityScores } = useReferenceData<AbilityScore>('/ability-scores')

// Filter options
const speedRangeOptions = [
  { label: 'All Speeds', value: null },
  { label: 'Slow (≤25 ft)', value: 'slow' },
  { label: '30 ft', value: '30' },
  { label: 'Fast (≥35 ft)', value: 'fast' }
]

const sizeOptions = computed(() => {
  const options: Array<{ label: string, value: string }> = [{ label: 'All Sizes', value: '' }]
  if (sizes.value) {
    options.push(...sizes.value.map(size => ({ label: size.name, value: size.code })))
  }
  return options
})

const parentRaceOptions = computed(() => {
  const options: Array<{ label: string, value: string }> = [{ label: 'All Races', value: '' }]
  if (baseRaces.value) {
    options.push(...baseRaces.value.map(race => ({ label: race.name, value: race.name })))
  }
  return options
})

const abilityOptions = computed(() => {
  if (!abilityScores.value) return []
  return abilityScores.value.map(ab => ({ label: `${ab.name} (${ab.code})`, value: ab.code }))
})

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Speed (Low→High)', value: 'speed:asc' },
  { label: 'Speed (High→Low)', value: 'speed:desc' }
]

// Build ability bonus filter
const abilityBonusFilter = computed(() => {
  if (selectedAbilityBonuses.value.length === 0) return null
  const conditions = selectedAbilityBonuses.value.map(ability => {
    const field = `ability_${ability.toLowerCase()}_bonus`
    return `${field} > 0`
  })
  return conditions.join(' OR ')
})

// Query builder for base filters (uses store refs)
const { queryParams: baseFilterParams } = useMeilisearchFilters([
  { ref: selectedSize, field: 'size_code' },
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  { ref: selectedParentRace, field: 'parent_race_name' },
  { ref: raceTypeFilter, field: 'is_subrace', type: 'boolean' },
  { ref: hasInnateSpellsFilter, field: 'has_innate_spells', type: 'boolean' }
])

// Combine base filters with custom filters
const queryParams = computed(() => {
  const params = { ...baseFilterParams.value }
  const meilisearchFilters: string[] = []

  // Add speed range filter
  if (selectedSpeedRange.value) {
    if (selectedSpeedRange.value === 'slow') {
      meilisearchFilters.push('speed <= 25')
    } else if (selectedSpeedRange.value === '30') {
      meilisearchFilters.push('speed = 30')
    } else if (selectedSpeedRange.value === 'fast') {
      meilisearchFilters.push('speed >= 35')
    }
  }

  // Add ability bonus filter
  if (abilityBonusFilter.value) {
    meilisearchFilters.push(`(${abilityBonusFilter.value})`)
  }

  // Combine all filters
  if (meilisearchFilters.length > 0) {
    const existingFilter = params.filter as string | undefined
    const combinedFilter = meilisearchFilters.join(' AND ')
    params.filter = existingFilter ? `${existingFilter} AND ${combinedFilter}` : combinedFilter
  }

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
  endpoint: '/races',
  cacheKey: 'races-list',
  queryBuilder: queryParams,
  searchQuery, // Pass store's searchQuery
  seo: {
    title: 'Races - D&D 5e Compendium',
    description: 'Browse all D&D 5e player races and subraces.'
  }
})

const races = computed(() => data.value as Race[])

// Clear all filters - uses store action + URL clear
const clearFilters = () => {
  store.clearAll()
  clearUrl()
}

// Helper functions
const getSpeedRangeLabel = (value: string | null) => {
  return speedRangeOptions.find(o => o.value === value)?.label || value
}

const getSizeName = (code: string) => sizes.value?.find(s => s.code === code)?.name || code

// Active filter count (use store getter)
const activeFilterCount = computed(() => store.activeFilterCount)

// Has active filters (use store getter)
const hasActiveFilters = computed(() => store.hasActiveFilters)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Races"
      :total="totalResults"
      description="Browse D&D 5e races and subraces"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

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
            placeholder="Search races..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="race"
          />
        </template>

        <UiFilterLayout>
          <template #primary>
            <UiFilterSelect
              v-model="selectedSize"
              :options="sizeOptions"
              label="Size"
              placeholder="All Sizes"
              data-testid="size-filter"
            />

            <UiFilterSelect
              v-model="selectedSpeedRange"
              :options="speedRangeOptions"
              label="Speed"
              placeholder="All Speeds"
              data-testid="speed-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedAbilityBonuses"
              label="Ability Score Bonuses"
              :options="abilityOptions"
              data-testid="ability-filter"
            />
          </template>

          <template #quick>
            <UiFilterToggle
              v-model="raceTypeFilter"
              label="Race Type"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '0', label: 'Base Only' },
                { value: '1', label: 'Subraces' }
              ]"
              data-testid="race-type-filter"
            />

            <UiFilterToggle
              v-model="hasInnateSpellsFilter"
              label="Innate Spells"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
              data-testid="has-innate-spells-filter"
            />
          </template>

          <template #advanced>
            <UiFilterSelect
              v-model="selectedParentRace"
              :options="parentRaceOptions"
              label="Parent Race"
              placeholder="All Races"
              data-testid="parent-race-filter"
            />
          </template>

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

        <UiFilterChip
          v-if="selectedSize"
          color="race"
          test-id="size-filter-chip"
          @remove="selectedSize = ''"
        >
          Size: {{ getSizeName(selectedSize) }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedSpeedRange"
          color="race"
          test-id="speed-filter-chip"
          @remove="selectedSpeedRange = null"
        >
          Speed: {{ getSpeedRangeLabel(selectedSpeedRange) }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedParentRace"
          color="race"
          test-id="parent-race-filter-chip"
          @remove="selectedParentRace = ''"
        >
          Parent: {{ selectedParentRace }}
        </UiFilterChip>
        <UiFilterChip
          v-for="ability in selectedAbilityBonuses"
          :key="ability"
          color="race"
          test-id="ability-filter-chip"
          @remove="selectedAbilityBonuses = selectedAbilityBonuses.filter(a => a !== ability)"
        >
          {{ ability }} Bonus
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="raceTypeFilter !== null"
            color="primary"
            test-id="race-type-filter-chip"
            @remove="raceTypeFilter = null"
          >
            Race Type: {{ raceTypeFilter === '0' ? 'Base Only' : 'Subraces' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="hasInnateSpellsFilter !== null"
            color="primary"
            test-id="has-innate-spells-chip"
            @remove="hasInnateSpellsFilter = null"
          >
            Innate Spells: {{ hasInnateSpellsFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <UiListStates
      :loading="loading"
      :error="error"
      :empty="races.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="race"
      entity-name-plural="Races"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <RaceCard
          v-for="race in races"
          :key="race.id"
          :race="race"
        />
      </template>
    </UiListStates>

    <UiBackLink />
  </div>
</template>

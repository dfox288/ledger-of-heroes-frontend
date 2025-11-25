<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Race, Size, Source, AbilityScore } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

// Custom filter state (entity-specific)
const selectedSize = ref((route.query.size as string) || '')
const selectedSpeedRange = ref<string | null>((route.query.speed as string) || null)
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
)
const selectedParentRace = ref((route.query.parent_race as string) || '')
const raceTypeFilter = ref<string | null>((route.query.race_type as string) || null)
const hasInnateSpellsFilter = ref<string | null>((route.query.has_innate_spells as string) || null)
const selectedAbilityBonuses = ref<string[]>(
  route.query.ability ? (Array.isArray(route.query.ability) ? route.query.ability : [route.query.ability]) as string[] : []
)

// Speed range options
const speedRangeOptions = [
  { label: 'All Speeds', value: null },
  { label: 'Slow (≤25 ft)', value: 'slow' },
  { label: '30 ft', value: '30' },
  { label: 'Fast (≥35 ft)', value: 'fast' }
]

// Fetch reference data for filter options
const { data: sizes } = useReferenceData<Size>('/sizes', {
  cacheKey: 'sizes-for-races'
})

const { data: sources } = useReferenceData<Source>('/sources')

const { data: baseRaces } = useReferenceData<Race>('/races', {
  transform: (data) => data.filter(r => !r.parent_race)
})

const { data: abilityScores } = useReferenceData<AbilityScore>('/ability-scores')

// Size filter options
const sizeOptions = computed(() => {
  const options: Array<{ label: string, value: string }> = [{ label: 'All Sizes', value: '' }]
  if (sizes.value) {
    options.push(...sizes.value.map(size => ({
      label: size.name,
      value: size.code
    })))
  }
  return options
})

// Source filter options
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name,
    value: source.code
  }))
})

// Parent race filter options
const parentRaceOptions = computed(() => {
  const options: Array<{ label: string, value: string }> = [{ label: 'All Races', value: '' }]
  if (baseRaces.value) {
    options.push(...baseRaces.value.map(race => ({
      label: race.name,
      value: race.name
    })))
  }
  return options
})

// Ability score filter options (from API)
const abilityOptions = computed(() => {
  if (!abilityScores.value) return []
  return abilityScores.value.map(ab => ({
    label: `${ab.name} (${ab.code})`,
    value: ab.code
  }))
})

// Build ability bonus filter manually (each ability is separate field: ability_str_bonus, etc.)
const abilityBonusFilter = computed(() => {
  if (selectedAbilityBonuses.value.length === 0) return null

  const conditions = selectedAbilityBonuses.value.map(ability => {
    const field = `ability_${ability.toLowerCase()}_bonus`
    return `${field} > 0`
  })

  return conditions.join(' OR ')
})

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Speed (Low→High)', value: 'speed:asc' },
  { label: 'Speed (High→Low)', value: 'speed:desc' }
]

// Computed sort value for USelectMenu binding
const sortValue = computed({
  get: () => `${sortBy.value}:${sortDirection.value}`,
  set: (value: string) => {
    const [newSortBy, newSortDirection] = value.split(':')
    if (newSortBy) sortBy.value = newSortBy
    if (newSortDirection) sortDirection.value = newSortDirection as 'asc' | 'desc'
  }
})

// Query builder for custom filters (using composable)
const baseFilters = useMeilisearchFilters([
  { ref: selectedSize, field: 'size_code' },
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  { ref: selectedParentRace, field: 'parent_race_name' },
  { ref: raceTypeFilter, field: 'is_subrace', type: 'boolean' },
  { ref: hasInnateSpellsFilter, field: 'has_innate_spells', type: 'boolean' }
])

// Combine base filters with custom filters (ability bonuses, speed range)
const queryParams = computed(() => {
  const params = { ...baseFilters.queryParams.value }
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
    params.filter = existingFilter
      ? `${existingFilter} AND ${combinedFilter}`
      : combinedFilter
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
  data: racesData,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters: clearBaseFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/races',
  cacheKey: 'races-list',
  queryBuilder: queryParams,
  seo: {
    title: 'Races - D&D 5e Compendium',
    description: 'Browse all D&D 5e player races and subraces.'
  }
})

const races = computed(() => racesData.value as Race[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  selectedSize.value = ''
  selectedSpeedRange.value = null
  selectedSources.value = []
  selectedParentRace.value = ''
  raceTypeFilter.value = null
  hasInnateSpellsFilter.value = null
  selectedAbilityBonuses.value = []
}

// Helper for speed chip label
const getSpeedRangeLabel = (value: string | null) => {
  const option = speedRangeOptions.find(o => o.value === value)
  return option?.label || value
}

// Helper for filter chips
const getSizeName = (code: string) => {
  return sizes.value?.find(s => s.code === code)?.name || code
}

const getSourceName = (code: string) => {
  return sources.value?.find(s => s.code === code)?.name || code
}

// Active filter count for badge
const activeFilterCount = useFilterCount(
  selectedSize,
  selectedSources,
  selectedParentRace,
  raceTypeFilter,
  hasInnateSpellsFilter,
  selectedAbilityBonuses,
  selectedSpeedRange
)

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Races"
      :total="totalResults"
      description="Browse D&D 5e races and subraces"
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
              placeholder="Search races..."
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
              color="race"
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

        <UiFilterLayout>
          <template #primary>
            <!-- Size Filter (Dropdown) -->
            <UiFilterSelect
              v-model="selectedSize"
              :options="sizeOptions"
              label="Size"
              placeholder="All Sizes"
              data-testid="size-filter"
            />

            <!-- Speed Filter -->
            <UiFilterSelect
              v-model="selectedSpeedRange"
              :options="speedRangeOptions"
              label="Speed"
              placeholder="All Speeds"
              data-testid="speed-filter"
            />

            <!-- Ability Score Bonuses Filter -->
            <UiFilterMultiSelect
              v-model="selectedAbilityBonuses"
              label="Ability Score Bonuses"
              :options="abilityOptions"
              data-testid="ability-filter"
            />
          </template>

          <template #quick>
            <!-- Race Type Toggle -->
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

            <!-- Has Innate Spells Toggle -->
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
            <!-- Parent Race Filter -->
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

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        data-testid="active-filters-row"
        class="flex flex-wrap items-center justify-between gap-2 pt-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span
            data-testid="active-filters-label"
            class="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            Active filters:
          </span>
          <!-- CHIP ORDER: Source → Entity-specific → Boolean toggles → Search (last) -->

          <!-- 1. Source chips (neutral color) -->
          <UButton
            v-for="source in selectedSources"
            :key="source"
            data-testid="source-filter-chip"
            size="xs"
            color="neutral"
            variant="soft"
            @click="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ getSourceName(source) }} ✕
          </UButton>

          <!-- 2. Entity-specific: Size, Speed, Parent Race, Abilities -->
          <UButton
            v-if="selectedSize"
            data-testid="size-filter-chip"
            size="xs"
            color="race"
            variant="soft"
            @click="selectedSize = ''"
          >
            Size: {{ getSizeName(selectedSize) }} ✕
          </UButton>
          <UButton
            v-if="selectedSpeedRange"
            data-testid="speed-filter-chip"
            size="xs"
            color="race"
            variant="soft"
            @click="selectedSpeedRange = null"
          >
            Speed: {{ getSpeedRangeLabel(selectedSpeedRange) }} ✕
          </UButton>
          <UButton
            v-if="selectedParentRace"
            data-testid="parent-race-filter-chip"
            size="xs"
            color="race"
            variant="soft"
            @click="selectedParentRace = ''"
          >
            Parent: {{ selectedParentRace }} ✕
          </UButton>
          <UButton
            v-for="ability in selectedAbilityBonuses"
            :key="ability"
            data-testid="ability-filter-chip"
            size="xs"
            color="race"
            variant="soft"
            @click="selectedAbilityBonuses = selectedAbilityBonuses.filter(a => a !== ability)"
          >
            {{ ability }} Bonus ✕
          </UButton>

          <!-- 3. Boolean toggles (primary color, "Label: Yes/No" format) -->
          <UButton
            v-if="raceTypeFilter !== null"
            data-testid="race-type-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="raceTypeFilter = null"
          >
            Race Type: {{ raceTypeFilter === '0' ? 'Base Only' : 'Subraces' }} ✕
          </UButton>
          <UButton
            v-if="hasInnateSpellsFilter !== null"
            data-testid="has-innate-spells-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasInnateSpellsFilter = null"
          >
            Innate Spells: {{ hasInnateSpellsFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>

          <!-- 4. Search query (always last, neutral color) -->
          <UButton
            v-if="searchQuery"
            data-testid="search-filter-chip"
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
          data-testid="clear-filters-button"
          color="neutral"
          variant="soft"
          size="sm"
          @click="clearFilters"
        >
          Clear filters
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Races"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="races.length === 0"
      entity-name="races"
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
        entity-name="race"
      />

      <!-- Races Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <RaceCard
          v-for="race in races"
          :key="race.id"
          :race="race"
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

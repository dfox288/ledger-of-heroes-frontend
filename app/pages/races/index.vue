<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Race, Size, Source } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Custom filter state (entity-specific)
const selectedSize = ref((route.query.size as string) || '')
const speedMin = ref(Number(route.query.speed_min) || 10)
const speedMax = ref(Number(route.query.speed_max) || 35)
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
)
const raceTypeFilter = ref<string | null>((route.query.race_type as string) || null)
const hasInnateSpellsFilter = ref<string | null>((route.query.has_innate_spells as string) || null)
const selectedAbilityBonuses = ref<string[]>(
  route.query.ability ? (Array.isArray(route.query.ability) ? route.query.ability : [route.query.ability]) as string[] : []
)

// Fetch reference data for filter options
const { data: sizes } = useReferenceData<Size>('/sizes', {
  cacheKey: 'sizes-for-races'
})

const { data: sources } = useReferenceData<Source>('/sources')

// Source filter options
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name,
    value: source.code
  }))
})

// Ability score filter options (hardcoded - standard D&D abilities)
const abilityOptions = [
  { label: 'Strength (STR)', value: 'STR' },
  { label: 'Dexterity (DEX)', value: 'DEX' },
  { label: 'Constitution (CON)', value: 'CON' },
  { label: 'Intelligence (INT)', value: 'INT' },
  { label: 'Wisdom (WIS)', value: 'WIS' },
  { label: 'Charisma (CHA)', value: 'CHA' }
]

// Build ability bonus filter manually (each ability is separate field: ability_str_bonus, etc.)
const abilityBonusFilter = computed(() => {
  if (selectedAbilityBonuses.value.length === 0) return null

  const conditions = selectedAbilityBonuses.value.map(ability => {
    const field = `ability_${ability.toLowerCase()}_bonus`
    return `${field} > 0`
  })

  return conditions.join(' OR ')
})

// Query builder for custom filters (using composable)
const baseFilters = useMeilisearchFilters([
  { ref: selectedSize, field: 'size_code' },
  { ref: computed(() => null), field: 'speed', type: 'range', min: speedMin, max: speedMax },
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  { ref: raceTypeFilter, field: 'is_subrace', type: 'boolean' },
  { ref: hasInnateSpellsFilter, field: 'has_innate_spells', type: 'boolean' }
])

// Combine base filters with custom ability bonus filter
const queryParams = computed(() => {
  const params = { ...baseFilters.queryParams.value }

  if (abilityBonusFilter.value) {
    const existingFilter = params.filter as string | undefined
    params.filter = existingFilter
      ? `${existingFilter} AND (${abilityBonusFilter.value})`
      : abilityBonusFilter.value
  }

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
  speedMin.value = 10
  speedMax.value = 35
  selectedSources.value = []
  raceTypeFilter.value = null
  hasInnateSpellsFilter.value = null
  selectedAbilityBonuses.value = []
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
  raceTypeFilter,
  hasInnateSpellsFilter,
  selectedAbilityBonuses,
  computed(() => speedMin.value !== 10 || speedMax.value !== 35 ? 'speed' : null)
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
        </template>

        <div class="space-y-6">
          <!-- PRIMARY FILTERS -->
          <div class="space-y-4">
            <!-- Size Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <div
                data-testid="size-filter-buttons"
                class="flex gap-2 flex-wrap"
              >
                <UButton
                  :color="selectedSize === '' ? 'primary' : 'neutral'"
                  :variant="selectedSize === '' ? 'solid' : 'soft'"
                  size="sm"
                  @click="selectedSize = ''"
                >
                  All
                </UButton>
                <UButton
                  v-for="size in sizes"
                  :key="size.id"
                  :color="selectedSize === size.code ? 'primary' : 'neutral'"
                  :variant="selectedSize === size.code ? 'solid' : 'soft'"
                  size="sm"
                  @click="selectedSize = size.code"
                >
                  {{ size.name }}
                </UButton>
              </div>
            </div>

            <!-- Speed Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speed: {{ speedMin }} - {{ speedMax }} ft
              </label>
              <USlider
                v-model="speedMin"
                :min="10"
                :max="35"
                :step="5"
                data-testid="speed-min-slider"
                class="mb-2"
              />
              <USlider
                v-model="speedMax"
                :min="10"
                :max="35"
                :step="5"
                data-testid="speed-max-slider"
              />
            </div>

            <!-- Source Filter -->
            <UiFilterMultiSelect
              v-model="selectedSources"
              label="Source"
              :options="sourceOptions"
              data-testid="source-filter"
            />

            <!-- Ability Score Bonuses Filter -->
            <UiFilterMultiSelect
              v-model="selectedAbilityBonuses"
              label="Ability Score Bonuses"
              :options="abilityOptions"
              data-testid="ability-filter"
            />
          </div>

          <!-- QUICK FILTERS -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Filters
            </label>
            <div class="flex gap-2 flex-wrap">
              <UButton
                :color="raceTypeFilter === null ? 'neutral' : 'primary'"
                :variant="raceTypeFilter === null ? 'soft' : 'solid'"
                size="sm"
                data-testid="all-races-button"
                @click="raceTypeFilter = null"
              >
                All Races
              </UButton>
              <UButton
                :color="raceTypeFilter === 'false' ? 'primary' : 'neutral'"
                :variant="raceTypeFilter === 'false' ? 'solid' : 'soft'"
                size="sm"
                data-testid="base-races-only-button"
                @click="raceTypeFilter = 'false'"
              >
                Base Races Only
              </UButton>
              <UButton
                :color="raceTypeFilter === 'true' ? 'primary' : 'neutral'"
                :variant="raceTypeFilter === 'true' ? 'solid' : 'soft'"
                size="sm"
                data-testid="subraces-only-button"
                @click="raceTypeFilter = 'true'"
              >
                Subraces Only
              </UButton>
              <UButton
                :color="hasInnateSpellsFilter === 'true' ? 'primary' : 'neutral'"
                :variant="hasInnateSpellsFilter === 'true' ? 'solid' : 'soft'"
                size="sm"
                data-testid="has-innate-spells-button"
                @click="hasInnateSpellsFilter = hasInnateSpellsFilter === 'true' ? null : 'true'"
              >
                Has Innate Spells
              </UButton>
            </div>
          </div>
        </div>
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
          <UButton
            v-if="selectedSize"
            data-testid="size-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedSize = ''"
          >
            {{ getSizeName(selectedSize) }} ✕
          </UButton>
          <UButton
            v-if="speedMin !== 10 || speedMax !== 35"
            data-testid="speed-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="speedMin = 10; speedMax = 35"
          >
            Speed: {{ speedMin }}-{{ speedMax }} ft ✕
          </UButton>
          <UButton
            v-for="source in selectedSources"
            :key="source"
            data-testid="source-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ getSourceName(source) }} ✕
          </UButton>
          <UButton
            v-if="raceTypeFilter === 'false'"
            data-testid="race-type-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="raceTypeFilter = null"
          >
            Base Races Only ✕
          </UButton>
          <UButton
            v-if="raceTypeFilter === 'true'"
            data-testid="race-type-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="raceTypeFilter = null"
          >
            Subraces Only ✕
          </UButton>
          <UButton
            v-if="hasInnateSpellsFilter === 'true'"
            data-testid="has-innate-spells-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasInnateSpellsFilter = null"
          >
            Has Innate Spells ✕
          </UButton>
          <UButton
            v-for="ability in selectedAbilityBonuses"
            :key="ability"
            data-testid="ability-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedAbilityBonuses = selectedAbilityBonuses.filter(a => a !== ability)"
          >
            {{ ability }} Bonus ✕
          </UButton>
          <UButton
            v-if="searchQuery"
            data-testid="search-query-chip"
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

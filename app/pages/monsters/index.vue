<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Monster, Size } from '~/types'

const route = useRoute()

// Custom filter state
// Note: UiFilterMultiSelect works with strings, so we store as strings and convert to numbers for filtering
const selectedCRs = ref<string[]>(
  route.query.cr ? (Array.isArray(route.query.cr) ? route.query.cr.map(String) : [String(route.query.cr)]) : []
)
const selectedType = ref(route.query.type ? String(route.query.type) : null)
const isLegendary = ref<string | null>((route.query.is_legendary as string) || null)
const selectedSizes = ref<string[]>(
  route.query.size_id ? (Array.isArray(route.query.size_id) ? route.query.size_id.map(String) : [String(route.query.size_id)]) : []
)
const selectedAlignments = ref<string[]>(
  route.query.alignment ? (Array.isArray(route.query.alignment) ? route.query.alignment : [route.query.alignment]) : []
)
const hasFly = ref<string | null>((route.query.has_fly as string) || null)
const hasSwim = ref<string | null>((route.query.has_swim as string) || null)
const hasBurrow = ref<string | null>((route.query.has_burrow as string) || null)
const hasClimb = ref<string | null>((route.query.has_climb as string) || null)

// Fetch reference data for filters
const { data: sizes } = useReferenceData<Size>('/sizes')

// CR multiselect options (common D&D 5e CR values)
const crOptions = [
  { label: 'CR 0', value: '0' },
  { label: 'CR 1/8', value: '0.125' },
  { label: 'CR 1/4', value: '0.25' },
  { label: 'CR 1/2', value: '0.5' },
  { label: 'CR 1', value: '1' },
  { label: 'CR 2', value: '2' },
  { label: 'CR 3', value: '3' },
  { label: 'CR 4', value: '4' },
  { label: 'CR 5', value: '5' },
  { label: 'CR 6', value: '6' },
  { label: 'CR 7', value: '7' },
  { label: 'CR 8', value: '8' },
  { label: 'CR 9', value: '9' },
  { label: 'CR 10', value: '10' },
  { label: 'CR 11', value: '11' },
  { label: 'CR 12', value: '12' },
  { label: 'CR 13', value: '13' },
  { label: 'CR 14', value: '14' },
  { label: 'CR 15', value: '15' },
  { label: 'CR 16', value: '16' },
  { label: 'CR 17', value: '17' },
  { label: 'CR 18', value: '18' },
  { label: 'CR 19', value: '19' },
  { label: 'CR 20', value: '20' },
  { label: 'CR 21', value: '21' },
  { label: 'CR 22', value: '22' },
  { label: 'CR 23', value: '23' },
  { label: 'CR 24', value: '24' },
  { label: 'CR 25', value: '25' },
  { label: 'CR 26', value: '26' },
  { label: 'CR 27', value: '27' },
  { label: 'CR 28', value: '28' },
  { label: 'CR 29', value: '29' },
  { label: 'CR 30', value: '30' }
]

// Size options from reference data
const sizeOptions = computed(() =>
  sizes.value?.map(s => ({ label: s.name, value: String(s.id) })) || []
)

// Alignment options (from API analysis - common D&D alignments)
const alignmentOptions = [
  { label: 'Lawful Good', value: 'Lawful Good' },
  { label: 'Neutral Good', value: 'Neutral Good' },
  { label: 'Chaotic Good', value: 'Chaotic Good' },
  { label: 'Lawful Neutral', value: 'Lawful Neutral' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'Chaotic Neutral', value: 'Chaotic Neutral' },
  { label: 'Lawful Evil', value: 'Lawful Evil' },
  { label: 'Neutral Evil', value: 'Neutral Evil' },
  { label: 'Chaotic Evil', value: 'Chaotic Evil' },
  { label: 'Unaligned', value: 'Unaligned' },
  { label: 'Any Alignment', value: 'Any alignment' }
]

// Type options
const typeOptions = [
  { label: 'All Types', value: null },
  { label: 'Aberration', value: 'aberration' },
  { label: 'Beast', value: 'beast' },
  { label: 'Celestial', value: 'celestial' },
  { label: 'Construct', value: 'construct' },
  { label: 'Dragon', value: 'dragon' },
  { label: 'Elemental', value: 'elemental' },
  { label: 'Fey', value: 'fey' },
  { label: 'Fiend', value: 'fiend' },
  { label: 'Giant', value: 'giant' },
  { label: 'Humanoid', value: 'humanoid' },
  { label: 'Monstrosity', value: 'monstrosity' },
  { label: 'Ooze', value: 'ooze' },
  { label: 'Plant', value: 'plant' },
  { label: 'Undead', value: 'undead' }
]

// Query builder (using composable for all filters)
const { queryParams: filterParams } = useMeilisearchFilters([
  // CR multiselect filter (convert strings to numbers for API)
  {
    ref: selectedCRs,
    field: 'challenge_rating',
    type: 'in',
    transform: (crs) => crs.map(Number)
  },
  { ref: selectedType, field: 'type' },
  // FIX: Changed from 'is_legendary' to 'has_legendary_actions' (correct Meilisearch field)
  { ref: isLegendary, field: 'has_legendary_actions', type: 'boolean' },
  // FIX: Changed from 'size_id' to 'size_code' and transform ID to code
  {
    ref: selectedSizes,
    field: 'size_code',
    type: 'in',
    transform: (sizeIds) => sizeIds.map((id: string) => {
      const size = sizes.value?.find(s => String(s.id) === id)
      return size?.code || null
    }).filter((code): code is string => code !== null)
  },
  // Alignment multiselect filter - values with spaces are auto-quoted by composable
  {
    ref: selectedAlignments,
    field: 'alignment',
    type: 'in'
  },
  // Speed filters - use greaterThan to check if field has a value (> 0)
  { ref: hasFly, field: 'speed_fly', type: 'greaterThan', transform: () => 0 },
  { ref: hasSwim, field: 'speed_swim', type: 'greaterThan', transform: () => 0 },
  { ref: hasBurrow, field: 'speed_burrow', type: 'greaterThan', transform: () => 0 },
  { ref: hasClimb, field: 'speed_climb', type: 'greaterThan', transform: () => 0 }
])

const queryBuilder = computed(() => filterParams.value)

// Use entity list composable
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
  endpoint: '/monsters',
  cacheKey: 'monsters-list',
  queryBuilder,
  seo: {
    title: 'Monsters - D&D 5e Compendium',
    description: 'Browse D&D 5e monsters with stats, abilities, and lore. Filter by Challenge Rating and creature type.'
  }
})

const monsters = computed(() => data.value as Monster[])

// Clear all filters
const clearFilters = () => {
  clearBaseFilters()
  selectedCRs.value = []
  selectedType.value = null
  isLegendary.value = null
  selectedSizes.value = []
  selectedAlignments.value = []
  hasFly.value = null
  hasSwim.value = null
  hasBurrow.value = null
  hasClimb.value = null
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
  return typeOptions.find(o => o.value === type)?.label || type
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

// Filter collapse state
const filtersOpen = ref(false)

// Active filter count for badge
const activeFilterCount = useFilterCount(
  selectedCRs,
  selectedType,
  isLegendary,
  selectedSizes,
  selectedAlignments,
  hasFly,
  hasSwim,
  hasBurrow,
  hasClimb
)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
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
          <UInput
            v-model="searchQuery"
            placeholder="Search monsters..."
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

        <UiFilterLayout>
          <!-- Primary Filters: Most frequently used (CR, Type, Size) -->
          <template #primary>
            <!-- CR Filter Multiselect -->
            <UiFilterMultiSelect
              v-model="selectedCRs"
              data-testid="cr-filter-multiselect"
              :options="crOptions"
              placeholder="All CRs"
              color="primary"
              class="w-full sm:w-48"
            />

            <!-- Type Filter -->
            <USelectMenu
              v-model="selectedType"
              :items="typeOptions"
              value-key="value"
              text-key="label"
              placeholder="All Types"
              size="md"
              class="w-full sm:w-48"
            />

            <!-- Size Filter Multiselect -->
            <UiFilterMultiSelect
              v-model="selectedSizes"
              data-testid="size-filter-multiselect"
              :options="sizeOptions"
              placeholder="All Sizes"
              color="primary"
              class="w-full sm:w-48"
            />

            <!-- Alignment Filter Multiselect -->
            <UiFilterMultiSelect
              v-model="selectedAlignments"
              data-testid="alignment-filter-multiselect"
              :options="alignmentOptions"
              placeholder="All Alignments"
              color="secondary"
              class="w-full sm:w-48"
            />
          </template>

          <!-- Quick Toggles: Binary filters (Legendary, Speed Types) -->
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
              v-model="hasFly"
              data-testid="has-fly-toggle"
              label="Has Fly"
              color="info"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasSwim"
              data-testid="has-swim-toggle"
              label="Has Swim"
              color="info"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasBurrow"
              data-testid="has-burrow-toggle"
              label="Has Burrow"
              color="info"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasClimb"
              data-testid="has-climb-toggle"
              label="Has Climb"
              color="info"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>

          <!-- Advanced Filters: Empty (could add AC, HP ranges here) -->
          <template #advanced />

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
            v-if="getCRFilterText"
            data-testid="cr-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="clearCRFilter"
          >
            {{ getCRFilterText }} ✕
          </UButton>
          <UButton
            v-if="selectedType !== null"
            size="xs"
            color="info"
            variant="soft"
            @click="selectedType = null"
          >
            {{ getTypeLabel(selectedType) }} ✕
          </UButton>
          <UButton
            v-if="getSizeFilterText"
            data-testid="size-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="clearSizeFilter"
          >
            {{ getSizeFilterText }} ✕
          </UButton>
          <UButton
            v-if="isLegendary !== null"
            size="xs"
            color="error"
            variant="soft"
            @click="isLegendary = null"
          >
            Legendary: {{ isLegendary === '1' ? 'Yes' : 'No' }} ✕
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

    <!-- Loading State -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Monsters"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="monsters.length === 0"
      entity-name="monsters"
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
        entity-name="monster"
      />

      <!-- Monsters Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MonsterCard
          v-for="monster in monsters"
          :key="monster.id"
          :monster="monster"
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

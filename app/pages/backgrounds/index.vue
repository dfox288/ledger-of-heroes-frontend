<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Background, Source } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Custom filter state (entity-specific)
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
)

// Fetch reference data for filter options
const { data: sources } = useReferenceData<Source>('/sources', {
  transform: (data) => data.filter(s => ['PHB', 'ERLW', 'WGTE'].includes(s.code))
})

// Source filter options (backgrounds only use PHB, ERLW, WGTE)
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name,
    value: source.code
  }))
})

// Query builder for custom filters
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: selectedSources, field: 'source_codes', type: 'in' }
])

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
  endpoint: '/backgrounds',
  cacheKey: 'backgrounds-list',
  queryBuilder: filterParams,
  seo: {
    title: 'Backgrounds - D&D 5e Compendium',
    description: 'Browse all D&D 5e character backgrounds.'
  }
})

// Type the data array
const backgrounds = computed(() => data.value as Background[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  selectedSources.value = []
}

// Active filter count for badge
const activeFilterCount = useFilterCount(selectedSources)

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Backgrounds"
      :total="totalResults"
      description="Browse D&D 5e character backgrounds"
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
            placeholder="Search backgrounds..."
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

        <!-- Filters -->
        <div class="space-y-4">
          <!-- Source Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source
            </label>
            <UiFilterMultiSelect
              v-model="selectedSources"
              :options="sourceOptions"
              placeholder="All sources"
            />
          </div>
        </div>
      </UiFilterCollapse>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center justify-between gap-2 pt-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
          <UButton
            v-if="searchQuery"
            size="xs"
            color="neutral"
            variant="soft"
            @click="searchQuery = ''"
          >
            "{{ searchQuery }}" ✕
          </UButton>
          <UButton
            v-if="selectedSources.length > 0"
            size="xs"
            color="neutral"
            variant="soft"
            @click="selectedSources = []"
          >
            Source: {{ selectedSources.join(', ') }} ✕
          </UButton>
        </div>

        <!-- Clear Filters Button (right-aligned) -->
        <UButton
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
      entity-name="Backgrounds"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="backgrounds.length === 0"
      entity-name="backgrounds"
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
        entity-name="background"
      />

      <!-- Backgrounds Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <BackgroundCard
          v-for="background in backgrounds"
          :key="background.id"
          :background="background"
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

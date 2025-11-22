<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Size, Race } from '~/types'

const route = useRoute()
const { apiFetch } = useApi()

// Custom filter state (entity-specific)
const selectedSize = ref((route.query.size as string) || '')

// Fetch available sizes for filter options
const { data: sizesResponse } = await useAsyncData<{ data: Size[] }>(
  'sizes',
  async () => {
    const response = await apiFetch<{ data: Size[] }>('/sizes')
    return response
  }
)

const sizes = computed(() => sizesResponse.value?.data || [])

// Query builder for custom filters
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  if (selectedSize.value) params.size = selectedSize.value
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
  queryBuilder,
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
}

// Helper for filter chips
const getSizeName = (code: string) => {
  return sizes.value.find(s => s.code === code)?.name || code
}

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
    <div class="mb-6 space-y-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search races..."
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

      <!-- Size Filter -->
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
        <div class="flex gap-2 flex-wrap">
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

        <!-- Clear filters button -->
        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="soft"
          @click="clearFilters"
        >
          Clear Filters
        </UButton>
      </div>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center gap-2 pt-2"
      >
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active:</span>
        <UButton
          v-if="selectedSize"
          size="xs"
          color="primary"
          variant="soft"
          @click="selectedSize = ''"
        >
          {{ getSizeName(selectedSize) }} ✕
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

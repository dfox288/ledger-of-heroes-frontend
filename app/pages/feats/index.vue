<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Feat } from '~/types'

const route = useRoute()

// Custom filter state
const hasPrerequisites = ref<string | null>((route.query.has_prerequisites as string) || null)

// Query builder for custom filters (using composable)
const { queryParams } = useMeilisearchFilters([
  { ref: hasPrerequisites, field: 'has_prerequisites', type: 'boolean' }
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
  endpoint: '/feats',
  cacheKey: 'feats-list',
  queryBuilder: queryParams,
  seo: {
    title: 'Feats - D&D 5e Compendium',
    description: 'Browse all D&D 5e feats and character abilities.'
  }
})

// Type the data array
const feats = computed(() => data.value as Feat[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  hasPrerequisites.value = null
}

// Filter collapse state
const filtersOpen = ref(false)

// Active filter count for badge
const activeFilterCount = useFilterCount(hasPrerequisites)

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Feats"
      :total="totalResults"
      description="Browse D&D 5e feats"
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
            placeholder="Search feats..."
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

        <div class="space-y-4">
          <!-- Has Prerequisites filter -->
          <UiFilterToggle
            v-model="hasPrerequisites"
            label="Has Prerequisites"
            color="primary"
            :options="[
              { value: null, label: 'All' },
              { value: '1', label: 'Yes' },
              { value: '0', label: 'No' }
            ]"
          />
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
            v-if="hasPrerequisites !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasPrerequisites = null"
          >
            Has Prerequisites: {{ hasPrerequisites === '1' ? 'Yes' : 'No' }} ✕
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
      entity-name="Feats"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="feats.length === 0"
      entity-name="feats"
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
        entity-name="feat"
      />

      <!-- Feats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <FeatCard
          v-for="feat in feats"
          :key="feat.id"
          :feat="feat"
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

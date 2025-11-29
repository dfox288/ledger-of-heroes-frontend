<script setup lang="ts">
import { computed } from 'vue'
import type { Size } from '~/types'

// Use entity list composable with noPagination
const {
  searchQuery,
  data,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/sizes',
  cacheKey: 'sizes-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Creature Sizes - D&D 5e Compendium',
    description: 'Browse all D&D 5e creature size categories from Tiny to Gargantuan.'
  }
})

const sizes = computed(() => data.value as Size[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/sizes"
      list-label="Creature Sizes"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Creature Sizes"
      :total="totalResults"
      description="Browse D&D 5e creature size categories"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search sizes..."
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
    </div>

    <!-- Loading State -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Sizes"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="sizes.length === 0"
      entity-name="sizes"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="size"
      />

      <!-- Sizes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SizeCard
          v-for="size in sizes"
          :key="size.id"
          :size="size"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ sizes, total: totalResults }"
      title="Sizes Data"
    />
  </div>
</template>

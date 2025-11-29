<script setup lang="ts">
import { computed } from 'vue'
import type { Source } from '~/types'

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
  endpoint: '/sources',
  cacheKey: 'sources-list',
  queryBuilder: computed(() => ({})),
  noPagination: true,
  seo: {
    title: 'Source Books - D&D 5e Compendium',
    description: 'Browse all D&D 5e source books and official publications.'
  }
})

const sources = computed(() => data.value as Source[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/sources"
      list-label="Source Books"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Source Books"
      :total="totalResults"
      description="Browse D&D 5e official source books and publications"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search source books..."
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
      entity-name="Source Books"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="sources.length === 0"
      entity-name="source books"
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
        entity-name="source book"
      />

      <!-- Sources Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SourceCard
          v-for="source in sources"
          :key="source.id"
          :source="source"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ sources, total: totalResults }"
      title="Sources Data"
    />
  </div>
</template>

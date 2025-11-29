<script setup lang="ts">
import { computed } from 'vue'
import type { Language } from '~/types'

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
  endpoint: '/languages',
  cacheKey: 'languages-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Languages - D&D 5e Compendium',
    description: 'Browse all D&D 5e languages including Common, Elvish, Dwarvish, and more.'
  }
})

const languages = computed(() => data.value as Language[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/languages"
      list-label="Languages"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Languages"
      :total="totalResults"
      description="Browse D&D 5e languages and scripts"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search languages..."
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
      entity-name="Languages"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="languages.length === 0"
      entity-name="languages"
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
        entity-name="language"
      />

      <!-- Languages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <LanguageCard
          v-for="language in languages"
          :key="language.id"
          :language="language"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ languages, total: totalResults }"
      title="Languages Data"
    />
  </div>
</template>

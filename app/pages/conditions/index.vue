<script setup lang="ts">
import { computed } from 'vue'
import type { Condition } from '~/types'

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
  endpoint: '/conditions',
  cacheKey: 'conditions-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Conditions - D&D 5e Compendium',
    description: 'Browse all D&D 5e conditions and status effects.'
  }
})

const conditions = computed(() => data.value as Condition[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/conditions"
      list-label="Conditions"
      class="mb-6"
    />

    <UiListPageHeader
      title="Conditions"
      :total="totalResults"
      description="Browse D&D 5e conditions"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search conditions..."
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

    <UiListSkeletonCards v-if="loading" />

    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Conditions"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="conditions.length === 0"
      entity-name="conditions"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="condition"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ConditionCard
          v-for="condition in conditions"
          :key="condition.id"
          :condition="condition"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ conditions, total: totalResults }"
      title="Conditions Data"
    />
  </div>
</template>

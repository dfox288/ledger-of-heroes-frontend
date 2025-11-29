<script setup lang="ts">
import { computed } from 'vue'
import type { ItemType } from '~/types'

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
  endpoint: '/item-types',
  cacheKey: 'item-types-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Item Types - D&D 5e Compendium',
    description: 'Browse all D&D 5e item categories including weapons, armor, potions, tools, and more.'
  }
})

const itemTypes = computed(() => data.value as ItemType[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/item-types"
      list-label="Item Types"
      class="mb-6"
    />

    <UiListPageHeader
      title="Item Types"
      :total="totalResults"
      description="Browse D&D 5e item categories"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search item types..."
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
      entity-name="Item Types"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="itemTypes.length === 0"
      entity-name="item types"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="item type"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ItemTypeCard
          v-for="itemType in itemTypes"
          :key="itemType.id"
          :item-type="itemType"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ itemTypes, total: totalResults }"
      title="Item Types Data"
    />
  </div>
</template>

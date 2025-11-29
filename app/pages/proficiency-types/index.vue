<script setup lang="ts">
import { computed } from 'vue'
import type { ProficiencyType } from '~/types'

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
  endpoint: '/proficiency-types',
  cacheKey: 'proficiency-types-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Proficiency Types - D&D 5e Compendium',
    description: 'Browse all D&D 5e proficiency categories including armor, weapons, tools, and skills.'
  }
})

const proficiencyTypes = computed(() => data.value as ProficiencyType[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/proficiency-types"
      list-label="Proficiency Types"
      class="mb-6"
    />

    <UiListPageHeader
      title="Proficiency Types"
      :total="totalResults"
      description="Browse D&D 5e proficiency categories"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search proficiency types..."
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
      entity-name="Proficiency Types"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="proficiencyTypes.length === 0"
      entity-name="proficiency types"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="proficiency type"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ProficiencyTypeCard
          v-for="proficiencyType in proficiencyTypes"
          :key="proficiencyType.id"
          :proficiency-type="proficiencyType"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ proficiencyTypes, total: totalResults }"
      title="Proficiency Types Data"
    />
  </div>
</template>

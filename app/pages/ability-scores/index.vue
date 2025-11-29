<script setup lang="ts">
import { computed } from 'vue'
import type { AbilityScore } from '~/types'

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
  endpoint: '/ability-scores',
  cacheKey: 'ability-scores-list',
  queryBuilder: computed(() => ({})), // No custom filters
  noPagination: true, // Small dataset, no pagination needed
  seo: {
    title: 'Ability Scores - D&D 5e Compendium',
    description: 'Browse all D&D 5e ability scores (STR, DEX, CON, INT, WIS, CHA).'
  }
})

const abilityScores = computed(() => data.value as AbilityScore[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/ability-scores"
      list-label="Ability Scores"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Ability Scores"
      :total="totalResults"
      description="Browse D&D 5e ability scores"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search ability scores..."
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
      entity-name="Ability Scores"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="abilityScores.length === 0"
      entity-name="ability scores"
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
        entity-name="ability score"
      />

      <!-- Ability Scores Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AbilityScoreCard
          v-for="abilityScore in abilityScores"
          :key="abilityScore.id"
          :ability-score="abilityScore"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ abilityScores, total: totalResults }"
      title="Ability Scores Data"
    />
  </div>
</template>

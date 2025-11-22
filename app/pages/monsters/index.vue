<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Monsters"
      :total="totalResults"
      description="Browse D&D 5e monsters with stats, abilities, and lore"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Filters -->
    <div class="mb-6 space-y-4">
      <!-- Search input -->
      <UInput
        v-model="searchQuery"
        placeholder="Search monsters..."
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

      <!-- Filter dropdowns -->
      <div class="flex flex-wrap gap-2">
        <!-- CR Filter -->
        <USelectMenu
          v-model="selectedCR"
          :items="crOptions"
          value-key="value"
          text-key="label"
          placeholder="Challenge Rating"
          class="w-48"
        />

        <!-- Type Filter -->
        <USelectMenu
          v-model="selectedType"
          :items="typeOptions"
          value-key="value"
          text-key="label"
          placeholder="Type"
          class="w-48"
        />

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
          v-if="selectedCR !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="selectedCR = null"
        >
          {{ getCRLabel(selectedCR) }} ✕
        </UButton>
        <UButton
          v-if="selectedType !== null"
          size="xs"
          color="info"
          variant="soft"
          @click="selectedType = null"
        >
          {{ getTypeLabel(selectedType) }} ✕
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
      entity-name="Monsters"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="monsters.length === 0"
      entity-name="monsters"
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
        entity-name="monster"
      />

      <!-- Monsters Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MonsterCard
          v-for="monster in monsters"
          :key="monster.id"
          :monster="monster"
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Monster } from '~/types'

const route = useRoute()

// Custom filter state
const selectedCR = ref(route.query.cr ? String(route.query.cr) : null)
const selectedType = ref(route.query.type ? String(route.query.type) : null)

// CR range options
const crOptions = [
  { label: 'All CRs', value: null },
  { label: 'CR 0-4 (Easy)', value: '0-4' },
  { label: 'CR 5-10 (Medium)', value: '5-10' },
  { label: 'CR 11-16 (Hard)', value: '11-16' },
  { label: 'CR 17+ (Deadly)', value: '17+' }
]

// Type options
const typeOptions = [
  { label: 'All Types', value: null },
  { label: 'Aberration', value: 'aberration' },
  { label: 'Beast', value: 'beast' },
  { label: 'Celestial', value: 'celestial' },
  { label: 'Construct', value: 'construct' },
  { label: 'Dragon', value: 'dragon' },
  { label: 'Elemental', value: 'elemental' },
  { label: 'Fey', value: 'fey' },
  { label: 'Fiend', value: 'fiend' },
  { label: 'Giant', value: 'giant' },
  { label: 'Humanoid', value: 'humanoid' },
  { label: 'Monstrosity', value: 'monstrosity' },
  { label: 'Ooze', value: 'ooze' },
  { label: 'Plant', value: 'plant' },
  { label: 'Undead', value: 'undead' }
]

// Query builder
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  if (selectedCR.value) params.cr = selectedCR.value
  if (selectedType.value) params.type = selectedType.value
  return params
})

// Use entity list composable
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
  endpoint: '/monsters',
  cacheKey: 'monsters-list',
  queryBuilder,
  seo: {
    title: 'Monsters - D&D 5e Compendium',
    description: 'Browse D&D 5e monsters with stats, abilities, and lore. Filter by Challenge Rating and creature type.'
  }
})

const monsters = computed(() => data.value as Monster[])

// Clear all filters
const clearFilters = () => {
  clearBaseFilters()
  selectedCR.value = null
  selectedType.value = null
}

// Helper functions for filter chips
const getCRLabel = (cr: string) => {
  return crOptions.find(o => o.value === cr)?.label || cr
}

const getTypeLabel = (type: string) => {
  return typeOptions.find(o => o.value === type)?.label || type
}

const perPage = 24
</script>

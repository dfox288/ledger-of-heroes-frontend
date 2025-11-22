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

// Type options (common D&D monster types)
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

// Query builder for custom filters
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  if (selectedCR.value) params.cr = selectedCR.value
  if (selectedType.value) params.type = selectedType.value
  return params
})

// Use entity list composable for all shared logic
const {
  searchQuery,
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error
} = useEntityList({
  endpoint: '/monsters',
  cacheKey: 'monsters-list',
  queryBuilder,
  seo: {
    title: 'Monsters - D&D 5e Compendium',
    description: 'Browse D&D 5e monsters with stats, abilities, and lore. Filter by Challenge Rating and creature type.'
  }
})

// Type the data array
const monsters = computed(() => data.value as Monster[])
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <UiListPageHeader
      title="Monsters"
      :count="totalResults"
    />

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search monsters..."
          size="lg"
        />
      </div>

      <!-- CR Filter -->
      <div class="w-full sm:w-48">
        <USelectMenu
          v-model="selectedCR"
          :options="crOptions"
          placeholder="Challenge Rating"
          size="lg"
        />
      </div>

      <!-- Type Filter -->
      <div class="w-full sm:w-48">
        <USelectMenu
          v-model="selectedType"
          :options="typeOptions"
          placeholder="Type"
          size="lg"
        />
      </div>
    </div>

    <!-- Results Count -->
    <UiListResultsCount
      :from="meta?.from || 0"
      :to="meta?.to || 0"
      :total="totalResults"
      entity-name="monster"
    />

    <!-- Loading State -->
    <div v-if="loading">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <USkeleton
          v-for="i in 6"
          :key="i"
          class="h-64"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error">
      <UAlert
        color="error"
        variant="soft"
        title="Failed to load monsters"
        description="There was an error loading the monsters list. Please try again later."
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!monsters || monsters.length === 0"
      class="text-center py-12"
    >
      <p class="text-gray-600 dark:text-gray-400">
        No monsters found matching your filters.
      </p>
    </div>

    <!-- Monster Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
    >
      <MonsterCard
        v-for="monster in monsters"
        :key="monster.id"
        :monster="monster"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="meta && meta.total > meta.per_page"
      class="flex justify-center mb-8"
    >
      <UPagination
        v-model:page="currentPage"
        :total="meta.total"
        :items-per-page="meta.per_page"
        show-edges
      />
    </div>

    <!-- Back to Top Link -->
    <div class="text-center">
      <UButton
        to="#"
        variant="ghost"
        color="neutral"
      >
        ↑ Back to Top
      </UButton>
    </div>
  </div>
</template>

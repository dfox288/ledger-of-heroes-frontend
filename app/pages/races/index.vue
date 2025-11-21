<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// API configuration
const { apiFetch } = useApi()
const route = useRoute()

// Reactive filters - initialize from URL query params
const searchQuery = ref((route.query.q as string) || '')
const currentPage = ref(route.query.page ? Number(route.query.page) : 1)
const selectedSize = ref((route.query.size as string) || '')
const perPage = 24

// Fetch available sizes
const { data: sizesResponse } = await useAsyncData(
  'sizes',
  async () => {
    const response = await apiFetch('/sizes')
    return response
  }
)

const sizes = computed(() => sizesResponse.value?.data || [])

// Computed query params for API
const queryParams = computed(() => {
  const params: Record<string, any> = {
    per_page: perPage,
    page: currentPage.value,
  }

  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }

  // Size filter ready for when backend adds support
  if (selectedSize.value) {
    params.size = selectedSize.value
  }

  return params
})

// Fetch races with reactive filters (via Nitro proxy)
const { data: racesResponse, pending: loading, error, refresh } = await useAsyncData(
  'races-list',
  async () => {
    const response = await apiFetch('/races', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [currentPage, searchQuery, selectedSize]
  }
)

// Computed values
const races = computed(() => racesResponse.value?.data || [])
const meta = computed(() => racesResponse.value?.meta || null)
const totalResults = computed(() => meta.value?.total || 0)
const lastPage = computed(() => meta.value?.last_page || 1)

// Reset to page 1 when filters change
watch([searchQuery, selectedSize], () => {
  currentPage.value = 1
})

// Sync URL query params with filter state
watch([currentPage, searchQuery, selectedSize], () => {
  const query: Record<string, any> = {}

  if (currentPage.value > 1) query.page = currentPage.value.toString()
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedSize.value) query.size = selectedSize.value

  navigateTo({ query }, { replace: true })
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || selectedSize.value !== ''
})

// Clear all filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedSize.value = ''
}

// SEO meta tags
useSeoMeta({
  title: 'Races - D&D 5e Compendium',
  description: 'Browse all D&D 5e player races and subraces.',
})

useHead({
  title: 'Races - D&D 5e Compendium',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Races"
      :total="totalResults"
      description="Browse D&D 5e races and subraces"
      :loading="loading"
    />

    <!-- Search and Filters -->
    <div class="mb-6 space-y-4">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search races..."
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            color="gray"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            :padded="false"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>

      <!-- Size Filter -->
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
        <div class="flex gap-2 flex-wrap">
          <UButton
            :color="selectedSize === '' ? 'primary' : 'gray'"
            :variant="selectedSize === '' ? 'solid' : 'soft'"
            size="sm"
            @click="selectedSize = ''"
          >
            All
          </UButton>
          <UButton
            v-for="size in sizes"
            :key="size.id"
            :color="selectedSize === size.code ? 'primary' : 'gray'"
            :variant="selectedSize === size.code ? 'solid' : 'soft'"
            size="sm"
            @click="selectedSize = size.code"
          >
            {{ size.name }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Races"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="races.length === 0"
      entity-name="races"
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
        entity-name="race"
      />

      <!-- Races Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <RaceCard
          v-for="race in races"
          :key="race.id"
          :race="race"
          
        />
      </div>

      <!-- Pagination -->
      <UiListPagination
        v-if="totalResults > perPage"
        v-model="currentPage"
        :total="totalResults"
        :items-per-page="perPage"
      />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>

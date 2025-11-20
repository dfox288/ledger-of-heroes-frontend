<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// API configuration
const { apiFetch } = useApi()
const route = useRoute()

// Reactive filters - initialize from URL query params
const searchQuery = ref((route.query.q as string) || '')
const currentPage = ref(route.query.page ? Number(route.query.page) : 1)
const perPage = 24

// Computed query params for API
const queryParams = computed(() => {
  const params: Record<string, any> = {
    per_page: perPage,
    page: currentPage.value,
  }

  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
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
    watch: [currentPage, searchQuery]
  }
)

// Computed values
const races = computed(() => racesResponse.value?.data || [])
const meta = computed(() => racesResponse.value?.meta || null)
const totalResults = computed(() => meta.value?.total || 0)
const lastPage = computed(() => meta.value?.last_page || 1)

// Reset to page 1 when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Sync URL query params with filter state
watch([currentPage, searchQuery], () => {
  const query: Record<string, any> = {}

  if (currentPage.value > 1) query.page = currentPage.value.toString()
  if (searchQuery.value) query.q = searchQuery.value

  navigateTo({ query }, { replace: true })
})

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
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Races
        <span v-if="!loading" class="text-2xl text-gray-500 dark:text-gray-400 font-normal">
          ({{ totalResults }} total)
        </span>
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Browse D&D 5e races and subraces
      </p>
    </div>

    <!-- Search -->
    <div class="mb-6">
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
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-gray-600 dark:text-gray-400">Loading races...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Races
          </h2>
          <p class="text-gray-600 dark:text-gray-400">{{ error.message }}</p>
          <UButton color="primary" class="mt-4" @click="refresh">
            Try Again
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && races && races.length === 0" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-magnifying-glass" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Races Found
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search query
          </p>
          <UButton color="gray" @click="searchQuery = ''">
            Clear Search
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {{ meta?.from || 0 }}-{{ meta?.to || 0 }} of {{ totalResults }} races
      </div>

      <!-- Races Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <RaceCard
          v-for="race in races"
          :key="race.id"
          :race="race"
          
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalResults > perPage" class="flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :total="totalResults"
          :items-per-page="perPage"
          show-edges
        />
      </div>
    </div>

    <!-- Back to Home -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <NuxtLink to="/">
        <UButton color="gray" variant="soft" icon="i-heroicons-arrow-left">
          Back to Home
        </UButton>
      </NuxtLink>
    </div>
  </div>
</template>

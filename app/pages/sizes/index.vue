<script setup lang="ts">
import { ref, computed } from 'vue'

// API configuration
const { apiFetch } = useApi()

// Reactive filters
const searchQuery = ref('')

// Computed query params for API
const queryParams = computed(() => {
  const params: Record<string, any> = {}

  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }

  return params
})

// Fetch sizes with reactive filters (via Nitro proxy)
const { data: sizesResponse, pending: loading, error, refresh } = await useAsyncData<{ data: Array<any> }>(
  'sizes-list',
  async () => {
    const response = await apiFetch<{ data: Array<any> }>('/sizes', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [queryParams]
  }
)

// Computed values
const sizes = computed(() => sizesResponse.value?.data || [])
const totalResults = computed(() => sizes.value.length)

// SEO meta tags
useSeoMeta({
  title: 'Creature Sizes - D&D 5e Compendium',
  description: 'Browse all D&D 5e creature size categories from Tiny to Gargantuan.'
})

useHead({
  title: 'Creature Sizes - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Creature Sizes"
      :total="totalResults"
      description="Browse D&D 5e creature size categories"
      :loading="loading"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search sizes..."
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template
          v-if="searchQuery"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
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
      entity-name="Sizes"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="sizes.length === 0"
      entity-name="sizes"
      :has-filters="!!searchQuery"
      @clear-filters="searchQuery = ''"
    />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="size"
      />

      <!-- Sizes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SizeCard
          v-for="size in sizes"
          :key="size.id"
          :size="size"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ sizes, total: totalResults }"
      title="Sizes Data"
    />
  </div>
</template>

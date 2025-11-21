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

// Fetch sources with reactive filters (via Nitro proxy)
const { data: sourcesResponse, pending: loading, error, refresh } = await useAsyncData(
  'sources-list',
  async () => {
    const response = await apiFetch('/sources', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [queryParams]
  }
)

// Computed values
const sources = computed(() => sourcesResponse.value?.data || [])
const totalResults = computed(() => sources.value.length)

// SEO meta tags
useSeoMeta({
  title: 'Source Books - D&D 5e Compendium',
  description: 'Browse all D&D 5e source books and official publications.',
})

useHead({
  title: 'Source Books - D&D 5e Compendium',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Source Books"
      :total="totalResults"
      description="Browse D&D 5e official source books and publications"
      :loading="loading"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search source books..."
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
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Source Books"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="sources.length === 0"
      entity-name="source books"
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
        entity-name="source book"
      />

      <!-- Sources Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SourceCard
          v-for="source in sources"
          :key="source.id"
          :source="source"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel :data="{ sources, total: totalResults }" title="Sources Data" />
  </div>
</template>

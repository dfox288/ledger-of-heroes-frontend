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

// Fetch languages with reactive filters (via Nitro proxy)
const { data: languagesResponse, pending: loading, error, refresh } = await useAsyncData(
  'languages-list',
  async () => {
    const response = await apiFetch('/languages', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [queryParams]
  }
)

// Computed values
const languages = computed(() => languagesResponse.value?.data || [])
const totalResults = computed(() => languages.value.length)

// SEO meta tags
useSeoMeta({
  title: 'Languages - D&D 5e Compendium',
  description: 'Browse all D&D 5e languages including Common, Elvish, Dwarvish, and more.'
})

useHead({
  title: 'Languages - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Languages"
      :total="totalResults"
      description="Browse D&D 5e languages and scripts"
      :loading="loading"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search languages..."
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
      entity-name="Languages"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="languages.length === 0"
      entity-name="languages"
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
        entity-name="language"
      />

      <!-- Languages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <LanguageCard
          v-for="language in languages"
          :key="language.id"
          :language="language"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ languages, total: totalResults }"
      title="Languages Data"
    />
  </div>
</template>

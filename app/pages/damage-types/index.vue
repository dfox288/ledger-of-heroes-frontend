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

// Fetch damage types with reactive filters (via Nitro proxy)
const { data: damageTypesResponse, pending: loading, error, refresh } = await useAsyncData(
  'damage-types-list',
  async () => {
    const response = await apiFetch('/damage-types', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [queryParams]
  }
)

// Computed values
const damageTypes = computed(() => damageTypesResponse.value?.data || [])
const totalResults = computed(() => damageTypes.value.length)

// SEO meta tags
useSeoMeta({
  title: 'Damage Types - D&D 5e Compendium',
  description: 'Browse all D&D 5e damage types including Fire, Cold, Lightning, and more.'
})

useHead({
  title: 'Damage Types - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Damage Types"
      :total="totalResults"
      description="Browse D&D 5e damage types"
      :loading="loading"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search damage types..."
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
      entity-name="Damage Types"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="damageTypes.length === 0"
      entity-name="damage types"
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
        entity-name="damage type"
      />

      <!-- Damage Types Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <DamageTypeCard
          v-for="damageType in damageTypes"
          :key="damageType.id"
          :damage-type="damageType"
        />
      </div>
    </div>

    <!-- Back to Home -->
    <UiBackLink />

    <!-- JSON Debug Panel -->
    <JsonDebugPanel
      :data="{ damageTypes, total: totalResults }"
      title="Damage Types Data"
    />
  </div>
</template>

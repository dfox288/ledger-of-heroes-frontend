<script setup lang="ts">
import { ref, computed } from 'vue'

// API configuration
const { apiFetch } = useApi()

// Reactive filters
const searchQuery = ref('')

// Computed query params for API
const queryParams = computed(() => {
  const params: Record<string, string> = {}

  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }

  return params
})

// Fetch ability scores with reactive filters (via Nitro proxy)
const { data: abilityScoresResponse, pending: loading, error, refresh } = await useAsyncData<{ data: Array<any> }>(
  'ability-scores-list',
  async () => {
    const response = await apiFetch<{ data: Array<any> }>('/ability-scores', {
      query: queryParams.value
    })
    return response
  },
  {
    watch: [queryParams]
  }
)

// Computed values
const abilityScores = computed(() => abilityScoresResponse.value?.data || [])
const totalResults = computed(() => abilityScores.value.length)

// SEO meta tags
useSeoMeta({
  title: 'Ability Scores - D&D 5e Compendium',
  description: 'Browse all D&D 5e ability scores: Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma.'
})

useHead({
  title: 'Ability Scores - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Ability Scores"
      :total="totalResults"
      description="Browse D&D 5e ability scores"
      :loading="loading"
    />

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search ability scores..."
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
      entity-name="Ability Scores"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="abilityScores.length === 0"
      entity-name="ability scores"
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

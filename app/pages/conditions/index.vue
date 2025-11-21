<script setup lang="ts">
import { ref, computed } from 'vue'

const { apiFetch } = useApi()
const searchQuery = ref('')

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }
  return params
})

const { data: conditionsResponse, pending: loading, error, refresh } = await useAsyncData<{ data: Array<any> }>(
  'conditions-list',
  async () => {
    const response = await apiFetch<{ data: Array<any> }>('/conditions', {
      query: queryParams.value
    })
    return response
  },
  { watch: [queryParams] }
)

const conditions = computed(() => conditionsResponse.value?.data || [])
const totalResults = computed(() => conditions.value.length)

useSeoMeta({
  title: 'Conditions - D&D 5e Compendium',
  description: 'Browse all D&D 5e conditions including Blinded, Charmed, Frightened, Paralyzed, and more.'
})

useHead({
  title: 'Conditions - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Conditions"
      :total="totalResults"
      description="Browse D&D 5e conditions"
      :loading="loading"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search conditions..."
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

    <UiListSkeletonCards v-if="loading" />

    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Conditions"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="conditions.length === 0"
      entity-name="conditions"
      :has-filters="!!searchQuery"
      @clear-filters="searchQuery = ''"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="condition"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ConditionCard
          v-for="condition in conditions"
          :key="condition.id"
          :condition="condition"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ conditions, total: totalResults }"
      title="Conditions Data"
    />
  </div>
</template>

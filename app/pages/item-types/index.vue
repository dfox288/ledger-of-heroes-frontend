<script setup lang="ts">
import { ref, computed } from 'vue'

interface ItemType {
  id: number
  code: string
  name: string
  description: string
}

const { apiFetch } = useApi()
const searchQuery = ref('')

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }
  return params
})

const { data: itemTypesResponse, pending: loading, error, refresh } = await useAsyncData<{ data: ItemType[] }>(
  'item-types-list',
  async () => {
    const response = await apiFetch<{ data: ItemType[] }>('/item-types', {
      query: queryParams.value
    })
    return response
  },
  { watch: [queryParams] }
)

const itemTypes = computed(() => (itemTypesResponse.value?.data || []) as ItemType[])
const totalResults = computed(() => itemTypes.value.length)

useSeoMeta({
  title: 'Item Types - D&D 5e Compendium',
  description: 'Browse all D&D 5e item categories including weapons, armor, potions, tools, and more.'
})

useHead({
  title: 'Item Types - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Item Types"
      :total="totalResults"
      description="Browse D&D 5e item categories"
      :loading="loading"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search item types..."
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
    </div>

    <UiListSkeletonCards v-if="loading" />

    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Item Types"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="itemTypes.length === 0"
      entity-name="item types"
      :has-filters="!!searchQuery"
      @clear-filters="searchQuery = ''"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="item type"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ItemTypeCard
          v-for="itemType in itemTypes"
          :key="itemType.id"
          :item-type="itemType"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ itemTypes, total: totalResults }"
      title="Item Types Data"
    />
  </div>
</template>

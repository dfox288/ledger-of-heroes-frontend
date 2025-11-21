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

const { data: proficiencyTypesResponse, pending: loading, error, refresh } = await useAsyncData(
  'proficiency-types-list',
  async () => {
    const response = await apiFetch('/proficiency-types', {
      query: queryParams.value
    })
    return response
  },
  { watch: [queryParams] }
)

const proficiencyTypes = computed(() => proficiencyTypesResponse.value?.data || [])
const totalResults = computed(() => proficiencyTypes.value.length)

useSeoMeta({
  title: 'Proficiency Types - D&D 5e Compendium',
  description: 'Browse all D&D 5e proficiency categories including armor, weapons, tools, and skills.'
})

useHead({
  title: 'Proficiency Types - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Proficiency Types"
      :total="totalResults"
      description="Browse D&D 5e proficiency categories"
      :loading="loading"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search proficiency types..."
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

    <UiListSkeletonCards v-if="loading" />

    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Proficiency Types"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="proficiencyTypes.length === 0"
      entity-name="proficiency types"
      :has-filters="!!searchQuery"
      @clear-filters="searchQuery = ''"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="proficiency type"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ProficiencyTypeCard
          v-for="proficiencyType in proficiencyTypes"
          :key="proficiencyType.id"
          :proficiency-type="proficiencyType"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel :data="{ proficiencyTypes, total: totalResults }" title="Proficiency Types Data" />
  </div>
</template>

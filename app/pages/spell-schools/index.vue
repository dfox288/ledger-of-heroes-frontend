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

const { data: spellSchoolsResponse, pending: loading, error, refresh } = await useAsyncData(
  'spell-schools-list',
  async () => {
    const response = await apiFetch('/spell-schools', {
      query: queryParams.value
    })
    return response
  },
  { watch: [queryParams] }
)

const spellSchools = computed(() => spellSchoolsResponse.value?.data || [])
const totalResults = computed(() => spellSchools.value.length)

useSeoMeta({
  title: 'Spell Schools - D&D 5e Compendium',
  description: 'Browse all D&D 5e schools of magic: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, and Transmutation.'
})

useHead({
  title: 'Spell Schools - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Spell Schools"
      :total="totalResults"
      description="Browse D&D 5e schools of magic"
      :loading="loading"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search spell schools..."
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
      entity-name="Spell Schools"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="spellSchools.length === 0"
      entity-name="spell schools"
      :has-filters="!!searchQuery"
      @clear-filters="searchQuery = ''"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="spell school"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SpellSchoolCard
          v-for="spellSchool in spellSchools"
          :key="spellSchool.id"
          :spell-school="spellSchool"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ spellSchools, total: totalResults }"
      title="Spell Schools Data"
    />
  </div>
</template>

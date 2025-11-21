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

const { data: skillsResponse, pending: loading, error, refresh } = await useAsyncData(
  'skills-list',
  async () => {
    const response = await apiFetch('/skills', {
      query: queryParams.value
    })
    return response
  },
  { watch: [queryParams] }
)

const skills = computed(() => skillsResponse.value?.data || [])
const totalResults = computed(() => skills.value.length)

useSeoMeta({
  title: 'Skills - D&D 5e Compendium',
  description: 'Browse all D&D 5e skills including Acrobatics, Athletics, Stealth, Perception, and more.'
})

useHead({
  title: 'Skills - D&D 5e Compendium'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Skills"
      :total="totalResults"
      description="Browse D&D 5e skills"
      :loading="loading"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Search skills..."
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
      entity-name="Skills"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="skills.length === 0"
      entity-name="skills"
      :has-filters="!!searchQuery"
      @clear-filters="searchQuery = ''"
    />

    <div v-else>
      <UiListResultsCount
        :from="1"
        :to="totalResults"
        :total="totalResults"
        entity-name="skill"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SkillCard
          v-for="skill in skills"
          :key="skill.id"
          :skill="skill"
        />
      </div>
    </div>

    <UiBackLink />
    <JsonDebugPanel
      :data="{ skills, total: totalResults }"
      title="Skills Data"
    />
  </div>
</template>

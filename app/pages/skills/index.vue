<script setup lang="ts">
import { computed } from 'vue'
import type { Skill } from '~/types'

const {
  searchQuery,
  data,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/skills',
  cacheKey: 'skills-list',
  queryBuilder: computed(() => ({})),
  noPagination: true,
  seo: {
    title: 'Skills - D&D 5e Compendium',
    description: 'Browse all D&D 5e skills including Acrobatics, Athletics, Stealth, Perception, and more.'
  }
})

const skills = computed(() => data.value as Skill[])
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/skills"
      list-label="Skills"
      class="mb-6"
    />

    <UiListPageHeader
      title="Skills"
      :total="totalResults"
      description="Browse D&D 5e skills"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search skills..."
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
      entity-name="Skills"
      @retry="refresh"
    />

    <UiListEmptyState
      v-else-if="skills.length === 0"
      entity-name="skills"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
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

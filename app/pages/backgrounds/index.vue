<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Background, Skill } from '~/types'
import { useBackgroundFiltersStore } from '~/stores/backgroundFilters'

// Use filter store instead of local refs
const store = useBackgroundFiltersStore()
const {
  searchQuery,
  sortBy,
  sortDirection,
  selectedSources,
  selectedSkills,
  selectedToolTypes,
  languageChoiceFilter,
  filtersOpen
} = storeToRefs(store)

// URL sync setup (handles mount + debounced store→URL sync)
const { clearFilters } = usePageFilterSetup(store)

// Sort value computed (combines sortBy + sortDirection)
const sortValue = useSortValue(sortBy, sortDirection)

// Source filter options (still need the composable for options)
const { sourceOptions, getSourceName } = useSourceFilter({
  transform: data => data.filter(s => ['PHB', 'ERLW', 'WGTE'].includes(s.code))
})

// Fetch reference data
const { data: skills } = useReferenceData<Skill>('/skills')

// Skill filter options
const skillOptions = computed(() => {
  if (!skills.value) return []
  return skills.value.map(skill => ({
    label: skill.name,
    value: skill.slug
  }))
})

// Tool proficiency type options (hardcoded - stable categories)
const toolTypeOptions = [
  { label: 'Artisan Tools', value: 'artisan-tools' },
  { label: 'Musical Instruments', value: 'musical-instruments' },
  { label: 'Gaming Sets', value: 'gaming-sets' }
]

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' }
]

// Query builder for filters (uses store refs)
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  { ref: selectedSkills, field: 'skill_proficiencies', type: 'in' },
  { ref: selectedToolTypes, field: 'tool_proficiency_types', type: 'in' },
  { ref: languageChoiceFilter, field: 'grants_language_choice', type: 'boolean' }
])

// Combined query params (filters + sorting)
const queryParams = computed(() => ({
  ...filterParams.value,
  sort_by: sortBy.value,
  sort_direction: sortDirection.value
}))

// Use entity list composable
const {
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh
} = useEntityList({
  endpoint: '/backgrounds',
  cacheKey: 'backgrounds-list',
  queryBuilder: queryParams,
  searchQuery,
  seo: {
    title: 'Backgrounds - D&D 5e Compendium',
    description: 'Browse all D&D 5e character backgrounds.'
  }
})

const backgrounds = computed(() => data.value as Background[])

// Helper functions for filter chips
const getSkillName = (slug: string) => skills.value?.find(s => s.slug === slug)?.name || slug
const getToolTypeName = (value: string) => toolTypeOptions.find(t => t.value === value)?.label || value

// Active filter count (use store getter)
const activeFilterCount = computed(() => store.activeFilterCount)

// Has active filters (use store getter)
const hasActiveFilters = computed(() => store.hasActiveFilters)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Breadcrumb -->
    <UiDetailBreadcrumb
      list-path="/backgrounds"
      list-label="Backgrounds"
      class="mb-6"
    />

    <!-- Header -->
    <UiListPageHeader
      title="Backgrounds"
      :total="totalResults"
      description="Browse D&D 5e character backgrounds"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Search and Filters -->
    <div class="mb-6">
      <UiFilterCollapse
        v-model="filtersOpen"
        label="Filters"
        :badge-count="activeFilterCount"
      >
        <template #search>
          <UiEntitySearchRow
            v-model:search="searchQuery"
            v-model:sources="selectedSources"
            v-model:sort="sortValue"
            placeholder="Search backgrounds..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="background"
          />
        </template>

        <!-- Filters: All in primary row to save space -->
        <UiFilterLayout>
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedSkills"
              :options="skillOptions"
              placeholder="All Skills"
              label="Skills"
              color="background"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedToolTypes"
              :options="toolTypeOptions"
              placeholder="All Tools"
              label="Tool Types"
              color="background"
              class="w-full sm:w-48"
            />

            <UiFilterToggle
              v-model="languageChoiceFilter"
              label="Language Choice"
              color="background"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>
        </UiFilterLayout>
      </UiFilterCollapse>

      <!-- Active Filter Chips -->
      <UiFilterChips
        :visible="hasActiveFilters"
        :search-query="searchQuery"
        :active-count="activeFilterCount"
        @clear-search="searchQuery = ''"
        @clear-all="clearFilters"
      >
        <template #sources>
          <UiFilterChip
            v-for="source in selectedSources"
            :key="source"
            color="neutral"
            test-id="source-filter-chip"
            @remove="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ getSourceName(source) }}
          </UiFilterChip>
        </template>

        <!-- Entity-specific chips -->
        <UiFilterChip
          v-for="skill in selectedSkills"
          :key="skill"
          color="background"
          test-id="skill-filter-chip"
          @remove="selectedSkills = selectedSkills.filter(s => s !== skill)"
        >
          Skill: {{ getSkillName(skill) }}
        </UiFilterChip>
        <UiFilterChip
          v-for="toolType in selectedToolTypes"
          :key="toolType"
          color="background"
          test-id="tool-type-filter-chip"
          @remove="selectedToolTypes = selectedToolTypes.filter(t => t !== toolType)"
        >
          Tool: {{ getToolTypeName(toolType) }}
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="languageChoiceFilter !== null"
            color="primary"
            test-id="language-choice-filter-chip"
            @remove="languageChoiceFilter = null"
          >
            Language Choice: {{ languageChoiceFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <!-- List States (Loading/Error/Empty/Results) -->
    <UiListStates
      :loading="loading"
      :error="error"
      :empty="backgrounds.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="background"
      entity-name-plural="Backgrounds"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <BackgroundCard
          v-for="background in backgrounds"
          :key="background.id"
          :background="background"
        />
      </template>
    </UiListStates>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Background, Source, Skill } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Custom filter state (entity-specific)
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
)

// New filters for Tier 2 implementation
const selectedSkills = ref<string[]>(
  route.query.skill ? (Array.isArray(route.query.skill) ? route.query.skill : [route.query.skill]) as string[] : []
)

const selectedToolTypes = ref<string[]>(
  route.query.tool_type ? (Array.isArray(route.query.tool_type) ? route.query.tool_type : [route.query.tool_type]) as string[] : []
)

const languageChoiceFilter = ref<string | null>((route.query.grants_language_choice as string) || null)

// Fetch reference data for filter options
const { data: sources } = useReferenceData<Source>('/sources', {
  transform: (data) => data.filter(s => ['PHB', 'ERLW', 'WGTE'].includes(s.code))
})

const { data: skills } = useReferenceData<Skill>('/skills')

// Source filter options (backgrounds only use PHB, ERLW, WGTE)
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name,
    value: source.code
  }))
})

// Skill filter options
const skillOptions = computed(() => {
  if (!skills.value) return []
  return skills.value.map(skill => ({
    label: skill.name,
    value: skill.code
  }))
})

// Tool proficiency type options (hardcoded - stable categories)
const toolTypeOptions = [
  { label: 'Artisan Tools', value: 'artisan-tools' },
  { label: 'Musical Instruments', value: 'musical-instruments' },
  { label: 'Gaming Sets', value: 'gaming-sets' }
]

// Query builder for custom filters
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  { ref: selectedSkills, field: 'skill_proficiencies', type: 'in' },
  { ref: selectedToolTypes, field: 'tool_proficiency_types', type: 'in' },
  { ref: languageChoiceFilter, field: 'grants_language_choice', type: 'boolean' }
])

// Use entity list composable for all shared logic
const {
  searchQuery,
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters: clearBaseFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/backgrounds',
  cacheKey: 'backgrounds-list',
  queryBuilder: filterParams,
  seo: {
    title: 'Backgrounds - D&D 5e Compendium',
    description: 'Browse all D&D 5e character backgrounds.'
  }
})

// Type the data array
const backgrounds = computed(() => data.value as Background[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  selectedSources.value = []
  selectedSkills.value = []
  selectedToolTypes.value = []
  languageChoiceFilter.value = null
}

// Helper functions for filter chips
const getSkillName = (code: string) => {
  return skills.value?.find(s => s.code === code)?.name || code
}

const getToolTypeName = (value: string) => {
  return toolTypeOptions.find(t => t.value === value)?.label || value
}

// Active filter count for badge
const activeFilterCount = useFilterCount(
  selectedSources,
  selectedSkills,
  selectedToolTypes,
  languageChoiceFilter
)

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
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
          <UInput
            v-model="searchQuery"
            placeholder="Search backgrounds..."
            class="flex-1"
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
        </template>

        <!-- Filters -->
        <UiFilterLayout>
          <!-- Primary Filters: Quick access filters -->
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedSources"
              :options="sourceOptions"
              placeholder="All Sources"
              label="Sources"
              color="background"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedSkills"
              :options="skillOptions"
              placeholder="All Skills"
              label="Skills"
              color="background"
              class="w-full sm:w-48"
            />
          </template>

          <!-- Quick Toggles: Binary filters -->
          <template #quick>
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

          <!-- Advanced Filters: Less frequently used -->
          <template #advanced>
            <UiFilterMultiSelect
              v-model="selectedToolTypes"
              :options="toolTypeOptions"
              placeholder="All Tool Types"
              label="Tool Types"
              color="background"
              class="w-full sm:w-48"
            />
          </template>

          <!-- Actions: Empty (Clear Filters moved to chips row) -->
          <template #actions />
        </UiFilterLayout>
      </UiFilterCollapse>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center justify-between gap-2 pt-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
          <UButton
            v-if="searchQuery"
            size="xs"
            color="neutral"
            variant="soft"
            @click="searchQuery = ''"
          >
            "{{ searchQuery }}" ✕
          </UButton>
          <UButton
            v-for="source in selectedSources"
            :key="source"
            size="xs"
            color="neutral"
            variant="soft"
            @click="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ sources?.find(s => s.code === source)?.name || source }} ✕
          </UButton>
          <UButton
            v-for="skill in selectedSkills"
            :key="skill"
            size="xs"
            color="background"
            variant="soft"
            @click="selectedSkills = selectedSkills.filter(s => s !== skill)"
          >
            {{ getSkillName(skill) }} ✕
          </UButton>
          <UButton
            v-for="toolType in selectedToolTypes"
            :key="toolType"
            size="xs"
            color="background"
            variant="soft"
            @click="selectedToolTypes = selectedToolTypes.filter(t => t !== toolType)"
          >
            {{ getToolTypeName(toolType) }} ✕
          </UButton>
          <UButton
            v-if="languageChoiceFilter !== null"
            size="xs"
            color="background"
            variant="soft"
            @click="languageChoiceFilter = null"
          >
            Language Choice: {{ languageChoiceFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
        </div>

        <!-- Clear Filters Button (right-aligned) -->
        <UButton
          color="neutral"
          variant="soft"
          size="sm"
          @click="clearFilters"
        >
          Clear filters
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Backgrounds"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="backgrounds.length === 0"
      entity-name="backgrounds"
      :has-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />

    <!-- Results -->
    <div v-else>
      <!-- Results count -->
      <UiListResultsCount
        :from="meta?.from || 0"
        :to="meta?.to || 0"
        :total="totalResults"
        entity-name="background"
      />

      <!-- Backgrounds Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <BackgroundCard
          v-for="background in backgrounds"
          :key="background.id"
          :background="background"
        />
      </div>

      <!-- Pagination -->
      <UiListPagination
        v-model="currentPage"
        :total="totalResults"
        :items-per-page="perPage"
      />
    </div>

    <!-- Back to Home -->
    <UiBackLink />
  </div>
</template>

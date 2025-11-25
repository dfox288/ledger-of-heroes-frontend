<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Background, Source, Skill } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

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

// Combined query params (filters + sorting)
const queryParams = computed(() => ({
  ...filterParams.value,
  sort_by: sortBy.value,
  sort_direction: sortDirection.value
}))

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
  queryBuilder: queryParams,
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

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' }
]

// Computed sort value for USelectMenu binding
const sortValue = computed({
  get: () => `${sortBy.value}:${sortDirection.value}`,
  set: (value: string) => {
    const [newSortBy, newSortDirection] = value.split(':')
    sortBy.value = newSortBy
    sortDirection.value = newSortDirection as 'asc' | 'desc'
  }
})

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
          <div class="flex gap-2 w-full">
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

            <!-- Source filter moved to prominent position -->
            <UiFilterMultiSelect
              v-model="selectedSources"
              :options="sourceOptions"
              placeholder="All Sources"
              color="background"
              class="w-full sm:w-48"
              data-testid="source-filter"
            />

            <USelectMenu
              v-model="sortValue"
              :items="sortOptions"
              value-key="value"
              placeholder="Sort by..."
              size="md"
              class="w-full sm:w-48"
            />
          </div>
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
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center justify-between gap-2 pt-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
          <!-- CHIP ORDER: Source → Entity-specific → Boolean toggles → Search (last) -->

          <!-- 1. Source chips (neutral color) -->
          <UButton
            v-for="source in selectedSources"
            :key="source"
            data-testid="source-filter-chip"
            size="xs"
            color="neutral"
            variant="soft"
            @click="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ sources?.find(s => s.code === source)?.name || source }} ✕
          </UButton>

          <!-- 2. Entity-specific: Skills, Tool Types -->
          <UButton
            v-for="skill in selectedSkills"
            :key="skill"
            data-testid="skill-filter-chip"
            size="xs"
            color="background"
            variant="soft"
            @click="selectedSkills = selectedSkills.filter(s => s !== skill)"
          >
            Skill: {{ getSkillName(skill) }} ✕
          </UButton>
          <UButton
            v-for="toolType in selectedToolTypes"
            :key="toolType"
            data-testid="tool-type-filter-chip"
            size="xs"
            color="background"
            variant="soft"
            @click="selectedToolTypes = selectedToolTypes.filter(t => t !== toolType)"
          >
            Tool: {{ getToolTypeName(toolType) }} ✕
          </UButton>

          <!-- 3. Boolean toggles (primary color, "Label: Yes/No" format) -->
          <UButton
            v-if="languageChoiceFilter !== null"
            data-testid="language-choice-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="languageChoiceFilter = null"
          >
            Language Choice: {{ languageChoiceFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>

          <!-- 4. Search query (always last, neutral color) -->
          <UButton
            v-if="searchQuery"
            data-testid="search-filter-chip"
            size="xs"
            color="neutral"
            variant="soft"
            @click="searchQuery = ''"
          >
            "{{ searchQuery }}" ✕
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

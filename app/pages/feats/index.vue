<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Feat, AbilityScore, Source } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

// Custom filter state (entity-specific)
const hasPrerequisites = ref<string | null>((route.query.has_prerequisites as string) || null)
const grantsProficiencies = ref<string | null>((route.query.grants_proficiencies as string) || null)

// Multi-select filters
const selectedImprovedAbilities = ref<string[]>(
  route.query.improved_ability ? (Array.isArray(route.query.improved_ability) ? route.query.improved_ability : [route.query.improved_ability]) as string[] : []
)
const selectedPrerequisiteTypes = ref<string[]>(
  route.query.prerequisite_type ? (Array.isArray(route.query.prerequisite_type) ? route.query.prerequisite_type : [route.query.prerequisite_type]) as string[] : []
)
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
)

// Fetch reference data for filter options
const { data: abilityScores } = useReferenceData<AbilityScore>('/ability-scores')
const { data: sources } = useReferenceData<Source>('/sources')

// Ability score filter options (for ASI)
const improvedAbilityOptions = computed(() => {
  if (!abilityScores.value) return []
  return abilityScores.value.map(ab => ({
    label: `${ab.name} (${ab.code})`,
    value: ab.code
  }))
})

// Prerequisite type options
const prerequisiteTypeOptions = [
  { label: 'Race Requirement', value: 'Race' },
  { label: 'Ability Score Requirement', value: 'AbilityScore' },
  { label: 'Proficiency Requirement', value: 'ProficiencyType' }
]

// Source filter options
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name,
    value: source.code
  }))
})

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
    if (newSortBy) sortBy.value = newSortBy
    if (newSortDirection) sortDirection.value = newSortDirection as 'asc' | 'desc'
  }
})

// Query builder for custom filters (using composable)
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: hasPrerequisites, field: 'has_prerequisites', type: 'boolean' },
  { ref: grantsProficiencies, field: 'grants_proficiencies', type: 'boolean' },
  { ref: selectedImprovedAbilities, field: 'improved_abilities', type: 'in' },
  { ref: selectedPrerequisiteTypes, field: 'prerequisite_types', type: 'in' },
  { ref: selectedSources, field: 'source_codes', type: 'in' }
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
  endpoint: '/feats',
  cacheKey: 'feats-list',
  queryBuilder: queryParams,
  seo: {
    title: 'Feats - D&D 5e Compendium',
    description: 'Browse all D&D 5e feats and character abilities with advanced filtering.'
  }
})

// Type the data array
const feats = computed(() => data.value as Feat[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  hasPrerequisites.value = null
  grantsProficiencies.value = null
  selectedImprovedAbilities.value = []
  selectedPrerequisiteTypes.value = []
  selectedSources.value = []
}

// Get ability name for filter chips
const getAbilityName = (code: string) => {
  const ability = abilityScores.value?.find(a => a.code === code)
  return ability ? `${ability.name} (${code})` : code
}

// Get prerequisite type label for chips
const getPrerequisiteTypeLabel = (type: string) => {
  return prerequisiteTypeOptions.find(opt => opt.value === type)?.label || type
}

// Get source name for filter chips
const getSourceName = (code: string) => {
  return sources.value?.find(s => s.code === code)?.name || code
}

// Pagination settings
const perPage = 24

// Count active filters for collapse badge
const activeFilterCount = useFilterCount(
  hasPrerequisites,
  grantsProficiencies,
  selectedImprovedAbilities,
  selectedPrerequisiteTypes,
  selectedSources
)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Feats"
      :total="totalResults"
      description="Browse D&D 5e feats with advanced filtering"
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
              placeholder="Search feats..."
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
              color="feat"
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

        <!-- Filter Content -->
        <UiFilterLayout>
          <!-- Primary Filters: Most frequently used -->
          <template #primary>
            <!-- Improved Abilities (ASI) Multiselect -->
            <UiFilterMultiSelect
              v-model="selectedImprovedAbilities"
              data-testid="improved-abilities-filter"
              :options="improvedAbilityOptions"
              label="Grants Ability Increase"
              placeholder="All Abilities"
              color="primary"
              class="w-full sm:w-64"
            />

            <!-- Prerequisite Types Multiselect -->
            <UiFilterMultiSelect
              v-model="selectedPrerequisiteTypes"
              data-testid="prerequisite-types-filter"
              :options="prerequisiteTypeOptions"
              label="Prerequisite Type"
              placeholder="All Types"
              color="primary"
              class="w-full sm:w-64"
            />
          </template>

          <!-- Quick Toggles: Binary filters -->
          <template #quick>
            <UiFilterToggle
              v-model="hasPrerequisites"
              data-testid="has-prerequisites-filter"
              label="Has Prerequisites"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="grantsProficiencies"
              data-testid="grants-proficiencies-filter"
              label="Grants Proficiencies"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>

          <!-- Advanced Filters: Less frequently used -->
          <template #advanced />


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
          <span
            v-if="activeFilterCount > 0 || searchQuery"
            class="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            Active filters:
          </span>

          <!-- Improved Abilities chips -->
          <UButton
            v-for="ability in selectedImprovedAbilities"
            :key="ability"
            size="xs"
            color="primary"
            variant="soft"
            @click="selectedImprovedAbilities = selectedImprovedAbilities.filter(a => a !== ability)"
          >
            {{ getAbilityName(ability) }} ✕
          </UButton>

          <!-- Prerequisite Types chips -->
          <UButton
            v-for="type in selectedPrerequisiteTypes"
            :key="type"
            size="xs"
            color="info"
            variant="soft"
            @click="selectedPrerequisiteTypes = selectedPrerequisiteTypes.filter(t => t !== type)"
          >
            {{ getPrerequisiteTypeLabel(type) }} ✕
          </UButton>

          <!-- Source chips -->
          <UButton
            v-for="source in selectedSources"
            :key="source"
            size="xs"
            color="neutral"
            variant="soft"
            @click="selectedSources = selectedSources.filter(s => s !== source)"
          >
            {{ getSourceName(source) }} ✕
          </UButton>

          <!-- Boolean filter chips -->
          <UButton
            v-if="hasPrerequisites !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasPrerequisites = null"
          >
            Has Prerequisites: {{ hasPrerequisites === '1' ? 'Yes' : 'No' }} ✕
          </UButton>

          <UButton
            v-if="grantsProficiencies !== null"
            size="xs"
            color="primary"
            variant="soft"
            @click="grantsProficiencies = null"
          >
            Grants Proficiencies: {{ grantsProficiencies === '1' ? 'Yes' : 'No' }} ✕
          </UButton>

          <!-- Search chip -->
          <UButton
            v-if="searchQuery"
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
          v-if="activeFilterCount > 0 || searchQuery"
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
      entity-name="Feats"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="feats.length === 0"
      entity-name="feats"
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
        entity-name="feat"
      />

      <!-- Feats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <FeatCard
          v-for="feat in feats"
          :key="feat.id"
          :feat="feat"
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

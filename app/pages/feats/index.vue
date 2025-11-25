<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Feat, AbilityScore } from '~/types'

const route = useRoute()

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')
const sortValue = useSortValue(sortBy, sortDirection)

// Source filter (using composable)
const { selectedSources, sourceOptions, getSourceName, clearSources } = useSourceFilter()

// Entity-specific filter state
const hasPrerequisites = ref<string | null>((route.query.has_prerequisites as string) || null)
const grantsProficiencies = ref<string | null>((route.query.grants_proficiencies as string) || null)
const selectedImprovedAbilities = ref<string[]>(
  route.query.improved_ability ? (Array.isArray(route.query.improved_ability) ? route.query.improved_ability : [route.query.improved_ability]) as string[] : []
)
const selectedPrerequisiteTypes = ref<string[]>(
  route.query.prerequisite_type ? (Array.isArray(route.query.prerequisite_type) ? route.query.prerequisite_type : [route.query.prerequisite_type]) as string[] : []
)

// Fetch reference data
const { data: abilityScores } = useReferenceData<AbilityScore>('/ability-scores')

// Filter options
const improvedAbilityOptions = computed(() => {
  if (!abilityScores.value) return []
  return abilityScores.value.map(ab => ({
    label: `${ab.name} (${ab.code})`,
    value: ab.code
  }))
})

const prerequisiteTypeOptions = [
  { label: 'Race Requirement', value: 'Race' },
  { label: 'Ability Score Requirement', value: 'AbilityScore' },
  { label: 'Proficiency Requirement', value: 'ProficiencyType' }
]

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' }
]

// Query builder for filters
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: hasPrerequisites, field: 'has_prerequisites', type: 'boolean' },
  { ref: grantsProficiencies, field: 'grants_proficiencies', type: 'boolean' },
  { ref: selectedImprovedAbilities, field: 'improved_abilities', type: 'in' },
  { ref: selectedPrerequisiteTypes, field: 'prerequisite_types', type: 'in' },
  { ref: selectedSources, field: 'source_codes', type: 'in' }
])

const queryParams = computed(() => ({
  ...filterParams.value,
  sort_by: sortBy.value,
  sort_direction: sortDirection.value
}))

// Use entity list composable
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

const feats = computed(() => data.value as Feat[])

// Clear all filters
const clearFilters = () => {
  clearBaseFilters()
  clearSources()
  hasPrerequisites.value = null
  grantsProficiencies.value = null
  selectedImprovedAbilities.value = []
  selectedPrerequisiteTypes.value = []
}

// Helper functions
const getAbilityName = (code: string) => {
  const ability = abilityScores.value?.find(a => a.code === code)
  return ability ? `${ability.name} (${code})` : code
}

const getPrerequisiteTypeLabel = (type: string) => {
  return prerequisiteTypeOptions.find(opt => opt.value === type)?.label || type
}

// Active filter count
const activeFilterCount = useFilterCount(
  hasPrerequisites,
  grantsProficiencies,
  selectedImprovedAbilities,
  selectedPrerequisiteTypes,
  selectedSources
)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Feats"
      :total="totalResults"
      description="Browse D&D 5e feats with advanced filtering"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

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
            placeholder="Search feats..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="feat"
          />
        </template>

        <UiFilterLayout>
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedImprovedAbilities"
              data-testid="improved-abilities-filter"
              :options="improvedAbilityOptions"
              label="Grants Ability Increase"
              placeholder="All Abilities"
              color="primary"
              class="w-full sm:w-64"
            />

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

          <template #actions />
        </UiFilterLayout>
      </UiFilterCollapse>

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

        <UiFilterChip
          v-for="ability in selectedImprovedAbilities"
          :key="ability"
          color="feat"
          test-id="improved-ability-filter-chip"
          @remove="selectedImprovedAbilities = selectedImprovedAbilities.filter(a => a !== ability)"
        >
          ASI: {{ getAbilityName(ability) }}
        </UiFilterChip>
        <UiFilterChip
          v-for="type in selectedPrerequisiteTypes"
          :key="type"
          color="feat"
          test-id="prerequisite-type-filter-chip"
          @remove="selectedPrerequisiteTypes = selectedPrerequisiteTypes.filter(t => t !== type)"
        >
          Prereq: {{ getPrerequisiteTypeLabel(type) }}
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="hasPrerequisites !== null"
            color="primary"
            test-id="has-prerequisites-filter-chip"
            @remove="hasPrerequisites = null"
          >
            Has Prerequisites: {{ hasPrerequisites === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="grantsProficiencies !== null"
            color="primary"
            test-id="grants-proficiencies-filter-chip"
            @remove="grantsProficiencies = null"
          >
            Grants Proficiencies: {{ grantsProficiencies === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <UiListStates
      :loading="loading"
      :error="error"
      :empty="feats.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="feat"
      entity-name-plural="Feats"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <FeatCard
          v-for="feat in feats"
          :key="feat.id"
          :feat="feat"
        />
      </template>
    </UiListStates>

    <UiBackLink />
  </div>
</template>

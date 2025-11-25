<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SpellSchool, Spell, CharacterClass, DamageType, AbilityScore, Source, Tag } from '~/types'

const route = useRoute()
// Note: useApi no longer needed for reference fetches (handled by useReferenceData)

// Filter collapse state
const filtersOpen = ref(false)

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

// Custom filter state (entity-specific)
// Note: UiFilterMultiSelect works with strings, so we store as strings and convert to numbers for filtering
const selectedLevels = ref<string[]>(
  route.query.level ? (Array.isArray(route.query.level) ? route.query.level.map(String) : [String(route.query.level)]) : []
)
const selectedSchool = ref(route.query.school ? Number(route.query.school) : null)
const selectedClass = ref<string | null>((route.query.class as string) || null)
const concentrationFilter = ref<string | null>((route.query.concentration as string) || null)
const ritualFilter = ref<string | null>((route.query.ritual as string) || null)

// Phase 1: Multi-select filters
const selectedDamageTypes = ref<string[]>(
  route.query.damage_type ? (Array.isArray(route.query.damage_type) ? route.query.damage_type : [route.query.damage_type]) as string[] : []
)
const selectedSavingThrows = ref<string[]>(
  route.query.saving_throw ? (Array.isArray(route.query.saving_throw) ? route.query.saving_throw : [route.query.saving_throw]) as string[] : []
)
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) as string[] : []
)
const selectedTags = ref<string[]>(
  route.query.tag ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[] : []
)

// Phase 2: Component flag filters
const verbalFilter = ref<string | null>((route.query.has_verbal as string) || null)
const somaticFilter = ref<string | null>((route.query.has_somatic as string) || null)
const materialFilter = ref<string | null>((route.query.has_material as string) || null)

// Phase 3: Removed filters (impractical for dropdowns due to free-text values):
// - higherLevelsFilter (has_higher_levels - backend field exists but not useful)
// - castingTimeFilter (casting_time - 100+ unique text values like "1 action", "1 bonus action")
// - rangeFilter (range - 50+ unique text values like "Self", "60 feet", "1 mile")
// - durationFilter (duration - 80+ unique text values like "Instantaneous", "Concentration, up to 1 minute")
// Note: These ARE filterable in Meilisearch (e.g., casting_time = "1 action"), but better served by full-text search

// Fetch reference data for filter options (using composable)
const { data: spellSchools } = useReferenceData<SpellSchool>('/spell-schools')

const { data: classes } = useReferenceData<CharacterClass>('/classes', {
  pages: 2,
  transform: (data) => data.filter(c => c.is_base_class === true)
})

const { data: damageTypes } = useReferenceData<DamageType>('/damage-types')

const { data: abilityScores } = useReferenceData<AbilityScore>('/ability-scores')

const { data: sources } = useReferenceData<Source>('/sources')

// Tag options (hardcoded - only 2 tags exist in the dataset: 21% coverage)
// Source: Analysis of 478 spells (200 sampled) - 42 spells with tags
// - Touch Spells: 31 spells
// - Ritual Caster: 17 spells
const tagOptions = [
  { label: 'Ritual Caster', value: 'ritual-caster' },
  { label: 'Touch Spells', value: 'touch-spells' }
]

// Spell level options for multiselect (values as strings for UiFilterMultiSelect compatibility)
const levelOptions = [
  { label: 'Cantrip', value: '0' },
  { label: '1st Level', value: '1' },
  { label: '2nd Level', value: '2' },
  { label: '3rd Level', value: '3' },
  { label: '4th Level', value: '4' },
  { label: '5th Level', value: '5' },
  { label: '6th Level', value: '6' },
  { label: '7th Level', value: '7' },
  { label: '8th Level', value: '8' },
  { label: '9th Level', value: '9' }
]

// School filter options
const schoolOptions = computed(() => {
  const options: Array<{ label: string, value: number | null }> = [{ label: 'All Schools', value: null }]
  if (spellSchools.value) {
    options.push(...spellSchools.value.map(school => ({
      label: school.name,
      value: school.id
    })))
  }
  return options
})

// Class filter options (already filtered to base classes, just sort)
const classOptions = computed(() => {
  const options: Array<{ label: string, value: string | null }> = [{ label: 'All Classes', value: null }]
  if (classes.value) {
    // Create a copy before sorting to avoid mutating the reactive array
    const sortedClasses = [...classes.value].sort((a, b) => a.name.localeCompare(b.name))

    options.push(...sortedClasses.map(cls => ({
      label: cls.name,
      value: cls.slug
    })))
  }
  return options
})

// Phase 1: Damage type filter options
const damageTypeOptions = computed(() => {
  if (!damageTypes.value) return []
  return damageTypes.value.map(dt => ({
    label: dt.name,
    value: dt.code
  }))
})

// Phase 1: Saving throw filter options (use ability score codes)
const savingThrowOptions = computed(() => {
  if (!abilityScores.value) return []
  return abilityScores.value.map(ab => ({
    label: ab.code, // Display just "STR", "DEX", etc.
    value: ab.code
  }))
})

// Source filter options (show full names, not codes)
const sourceOptions = computed(() => {
  if (!sources.value) return []
  return sources.value.map(source => ({
    label: source.name, // Display "Player's Handbook", "Xanathar's Guide", etc.
    value: source.code
  }))
})

// Sort options (removed Recently Added/Updated per UX feedback)
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Level (Low-High)', value: 'level:asc' },
  { label: 'Level (High-Low)', value: 'level:desc' }
]

// Computed sort value for USelectMenu binding (combines sortBy:sortDirection)
const sortValue = computed({
  get: () => `${sortBy.value}:${sortDirection.value}`,
  set: (value: string) => {
    const [newSortBy, newSortDirection] = value.split(':')
    if (newSortBy) sortBy.value = newSortBy
    if (newSortDirection) sortDirection.value = newSortDirection as 'asc' | 'desc'
  }
})

// Phase 3: Removed filter options (impractical due to high cardinality):
// - castingTimeOptions (100+ unique values: "1 action", "1 bonus action", "1 reaction", "10 minutes", etc.)
// - rangeOptions (50+ unique values: "Self", "Touch", "30 feet", "60 feet", "120 feet", "1 mile", etc.)
// - durationOptions (80+ unique values: "Instantaneous", "1 round", "Concentration, up to 1 minute", etc.)
// Users can search for these values using full-text search (?q=1 action) instead of dropdowns

// Query builder for custom filters (using composable)
const { queryParams: filterParams } = useMeilisearchFilters([
  // Level multiselect filter (convert strings to numbers for API)
  {
    ref: selectedLevels,
    field: 'level',
    type: 'in',
    transform: (levels) => levels.map(Number)
  },
  {
    ref: selectedSchool,
    field: 'school_code',
    transform: (id) => spellSchools.value?.find(s => s.id === id)?.code || null
  },
  { ref: selectedClass, field: 'class_slugs', type: 'in' },
  { ref: concentrationFilter, field: 'concentration', type: 'boolean' },
  { ref: ritualFilter, field: 'ritual', type: 'boolean' },
  { ref: selectedDamageTypes, field: 'damage_types', type: 'in' },
  { ref: selectedSavingThrows, field: 'saving_throws', type: 'in' },
  { ref: selectedSources, field: 'source_codes', type: 'in' },
  { ref: selectedTags, field: 'tag_slugs', type: 'in' },
  { ref: verbalFilter, field: 'requires_verbal', type: 'boolean' },
  { ref: somaticFilter, field: 'requires_somatic', type: 'boolean' },
  { ref: materialFilter, field: 'requires_material', type: 'boolean' }
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
  data: spellsData,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters: clearBaseFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/spells',
  cacheKey: 'spells-list',
  queryBuilder: queryParams,
  seo: {
    title: 'Spells - D&D 5e Compendium',
    description: 'Browse all D&D 5e spells. Filter by level, school, and search for specific spells.'
  }
})

const spells = computed(() => spellsData.value as Spell[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  selectedLevels.value = []
  selectedSchool.value = null
  selectedClass.value = null
  concentrationFilter.value = null
  ritualFilter.value = null
  // Phase 1: Clear multi-select filters
  selectedDamageTypes.value = []
  selectedSavingThrows.value = []
  selectedSources.value = []
  selectedTags.value = []
  // Phase 2: Clear component flag filters
  verbalFilter.value = null
  somaticFilter.value = null
  materialFilter.value = null
  // Phase 3: Removed unsupported filters (already removed from refs)
}

// Get school name by ID for filter chips
const getSchoolName = (schoolId: number) => {
  return spellSchools.value?.find(s => s.id === schoolId)?.name || 'Unknown'
}

// Get class name by slug for filter chips
const getClassName = (classSlug: string) => {
  return classes.value?.find(c => c.slug === classSlug)?.name || 'Unknown'
}

// Phase 1: Get damage type name by code for filter chips
const getDamageTypeName = (code: string) => {
  return damageTypes.value?.find(dt => dt.code === code)?.name || code
}

// Phase 1: Get ability score name by code for filter chips (just return code for compactness)
const getSavingThrowName = (code: string) => {
  return code // Display "STR", "DEX", etc.
}

// Helper to get level label for display (Cantrip, 1st, 2nd, etc.)
const getLevelLabel = (levelStr: string): string => {
  const level = Number(levelStr)
  if (level === 0) return 'Cantrip'
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${level}${suffixes[level]}`
}

// Get level filter display text for chips
const getLevelFilterText = computed(() => {
  if (selectedLevels.value.length === 0) return null

  const labels = selectedLevels.value
    .sort((a, b) => Number(a) - Number(b))
    .map(level => getLevelLabel(level))

  const prefix = selectedLevels.value.length === 1 ? 'Level' : 'Levels'
  return `${prefix}: ${labels.join(', ')}`
})

const clearLevelFilter = () => {
  selectedLevels.value = []
}

// Get source name by code for filter chips (show full name instead of code)
const getSourceName = (code: string) => {
  return sources.value?.find(s => s.code === code)?.name || code
}

// Get tag name by slug for filter chips
const getTagName = (slug: string) => {
  return tagOptions.find(t => t.value === slug)?.label || slug
}

// Pagination settings
const perPage = 24

// Count active filters (excluding search) for collapse badge (using composable)
const activeFilterCount = useFilterCount(
  selectedLevels,
  selectedSchool,
  selectedClass,
  concentrationFilter,
  ritualFilter,
  selectedDamageTypes,
  selectedSavingThrows,
  selectedSources,
  selectedTags,
  verbalFilter,
  somaticFilter,
  materialFilter
)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Spells"
      :total="totalResults"
      description="Browse and search D&D 5e spells"
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
              placeholder="Search spells..."
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
              color="primary"
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
          <!-- Primary Filters: Most frequently used (Level, School, Class) -->
          <template #primary>
            <!-- Level Filter Multiselect -->
            <UiFilterMultiSelect
              v-model="selectedLevels"
              data-testid="level-filter-multiselect"
              :options="levelOptions"
              placeholder="All Levels"
              color="primary"
              class="w-full sm:w-48"
            />

            <USelectMenu
              v-model="selectedSchool"
              :items="schoolOptions"
              value-key="value"
              placeholder="All Schools"
              size="md"
              class="w-full sm:w-48"
            />

            <USelectMenu
              v-model="selectedClass"
              :items="classOptions"
              value-key="value"
              placeholder="All Classes"
              size="md"
              class="w-full sm:w-48"
            />
          </template>

          <!-- Quick Toggles: Binary filters (Concentration, Ritual, Components) -->
          <template #quick>
            <UiFilterToggle
              v-model="concentrationFilter"
              label="Concentration"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="ritualFilter"
              label="Ritual"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="verbalFilter"
              label="Verbal"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="somaticFilter"
              label="Somatic"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="materialFilter"
              label="Material"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>

          <!-- Advanced Filters: Less frequently used (Damage Types, Saving Throws) -->
          <template #advanced>
            <UiFilterMultiSelect
              v-model="selectedDamageTypes"
              :options="damageTypeOptions"
              label="Damage Types"
              placeholder="All Damage Types"
              color="primary"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedSavingThrows"
              :options="savingThrowOptions"
              label="Saving Throws"
              placeholder="All Saving Throws"
              color="primary"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedTags"
              :options="tagOptions"
              label="Tags"
              placeholder="All Tags"
              color="primary"
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
          <span
            v-if="activeFilterCount > 0 || searchQuery"
            class="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            Active filters:
          </span>
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
            {{ getSourceName(source) }} ✕
          </UButton>

          <!-- 2. Entity-specific: Level, School, Class -->
          <UButton
            v-if="getLevelFilterText"
            data-testid="level-filter-chip"
            size="xs"
            color="spell"
            variant="soft"
            @click="clearLevelFilter"
          >
            {{ getLevelFilterText }} ✕
          </UButton>
          <UButton
            v-if="selectedSchool !== null"
            data-testid="school-filter-chip"
            size="xs"
            color="spell"
            variant="soft"
            @click="selectedSchool = null"
          >
            School: {{ getSchoolName(selectedSchool) }} ✕
          </UButton>
          <UButton
            v-if="selectedClass !== null"
            data-testid="class-filter-chip"
            size="xs"
            color="class"
            variant="soft"
            @click="selectedClass = null"
          >
            Class: {{ getClassName(selectedClass) }} ✕
          </UButton>

          <!-- 3. Entity-specific: Damage Types, Saving Throws, Tags -->
          <UButton
            v-for="damageType in selectedDamageTypes"
            :key="damageType"
            data-testid="damage-type-filter-chip"
            size="xs"
            color="error"
            variant="soft"
            @click="selectedDamageTypes = selectedDamageTypes.filter(dt => dt !== damageType)"
          >
            {{ getDamageTypeName(damageType) }} ✕
          </UButton>
          <UButton
            v-for="savingThrow in selectedSavingThrows"
            :key="savingThrow"
            data-testid="saving-throw-filter-chip"
            size="xs"
            color="info"
            variant="soft"
            @click="selectedSavingThrows = selectedSavingThrows.filter(st => st !== savingThrow)"
          >
            {{ getSavingThrowName(savingThrow) }} Save ✕
          </UButton>
          <UButton
            v-for="tag in selectedTags"
            :key="tag"
            data-testid="tag-filter-chip"
            size="xs"
            color="spell"
            variant="soft"
            @click="selectedTags = selectedTags.filter(t => t !== tag)"
          >
            {{ getTagName(tag) }} ✕
          </UButton>

          <!-- 4. Boolean toggles (primary color, "Label: Yes/No" format) -->
          <UButton
            v-if="concentrationFilter !== null"
            data-testid="concentration-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="concentrationFilter = null"
          >
            Concentration: {{ concentrationFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="ritualFilter !== null"
            data-testid="ritual-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="ritualFilter = null"
          >
            Ritual: {{ ritualFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="verbalFilter !== null"
            data-testid="verbal-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="verbalFilter = null"
          >
            Verbal: {{ verbalFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="somaticFilter !== null"
            data-testid="somatic-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="somaticFilter = null"
          >
            Somatic: {{ somaticFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="materialFilter !== null"
            data-testid="material-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="materialFilter = null"
          >
            Material: {{ materialFilter === '1' ? 'Yes' : 'No' }} ✕
          </UButton>

          <!-- 5. Search query (always last, neutral color) -->
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

    <!-- Loading State (Skeleton Cards) -->
    <UiListSkeletonCards v-if="loading" />

    <!-- Error State -->
    <UiListErrorState
      v-else-if="error"
      :error="error"
      entity-name="Spells"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="spells.length === 0"
      entity-name="spells"
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
        entity-name="spell"
      />

      <!-- Spells Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <SpellCard
          v-for="spell in spells"
          :key="spell.id"
          :spell="spell"
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

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
const levelFilterMode = ref<'exact' | 'range'>('exact')
const selectedLevel = ref(route.query.level ? Number(route.query.level) : null)
const minLevel = ref<number | null>(route.query.min_level ? Number(route.query.min_level) : null)
const maxLevel = ref<number | null>(route.query.max_level ? Number(route.query.max_level) : null)
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

// Spell level options (0 = Cantrip, 1-9 = Spell levels)
const levelOptions = [
  { label: 'All Levels', value: null },
  { label: 'Cantrip', value: 0 },
  { label: '1st Level', value: 1 },
  { label: '2nd Level', value: 2 },
  { label: '3rd Level', value: 3 },
  { label: '4th Level', value: 4 },
  { label: '5th Level', value: 5 },
  { label: '6th Level', value: 6 },
  { label: '7th Level', value: 7 },
  { label: '8th Level', value: 8 },
  { label: '9th Level', value: 9 }
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
    sortBy.value = newSortBy
    sortDirection.value = newSortDirection as 'asc' | 'desc'
  }
})

// Phase 3: Removed filter options (impractical due to high cardinality):
// - castingTimeOptions (100+ unique values: "1 action", "1 bonus action", "1 reaction", "10 minutes", etc.)
// - rangeOptions (50+ unique values: "Self", "Touch", "30 feet", "60 feet", "120 feet", "1 mile", etc.)
// - durationOptions (80+ unique values: "Instantaneous", "1 round", "Concentration, up to 1 minute", etc.)
// Users can search for these values using full-text search (?q=1 action) instead of dropdowns

// Mode toggle handlers
const switchToRangeMode = () => {
  levelFilterMode.value = 'range'
  selectedLevel.value = null
}

const switchToExactMode = () => {
  levelFilterMode.value = 'exact'
  minLevel.value = null
  maxLevel.value = null
}

// Query builder for custom filters (using composable)
const { queryParams: filterParams } = useMeilisearchFilters([
  // Use range filter in range mode, exact filter in exact mode
  ...(levelFilterMode.value === 'range'
    ? [{ field: 'level', type: 'range' as const, min: minLevel, max: maxLevel, ref: levelFilterMode }]
    : [{ ref: selectedLevel, field: 'level' }]
  ),
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
  selectedLevel.value = null
  minLevel.value = null
  maxLevel.value = null
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

// Get level filter display text for chips
const getLevelFilterText = computed(() => {
  if (levelFilterMode.value === 'exact' && selectedLevel.value !== null) {
    return `Level ${selectedLevel.value === 0 ? 'Cantrip' : selectedLevel.value}`
  }
  if (levelFilterMode.value === 'range') {
    if (minLevel.value !== null && maxLevel.value !== null) {
      return `Levels ${minLevel.value}-${maxLevel.value}`
    }
    if (minLevel.value !== null) {
      return `Level ${minLevel.value}+`
    }
    if (maxLevel.value !== null) {
      return `Level ${maxLevel.value} or lower`
    }
  }
  return null
})

const clearLevelFilter = () => {
  selectedLevel.value = null
  minLevel.value = null
  maxLevel.value = null
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
  selectedLevel,
  minLevel,
  maxLevel,
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
            <!-- Level Filter Mode Toggle -->
            <div class="flex flex-col gap-2 w-full">
              <UiFilterToggle
                data-testid="level-filter-mode-toggle"
                :model-value="levelFilterMode"
                label="Level Filter"
                color="primary"
                :options="[
                  { value: 'exact', label: 'Exact' },
                  { value: 'range', label: 'Range' }
                ]"
                @update:model-value="(value) => {
                  if (value === 'range') {
                    switchToRangeMode()
                  } else {
                    switchToExactMode()
                  }
                }"
              />

              <!-- Exact Level Mode -->
              <USelectMenu
                v-if="levelFilterMode === 'exact'"
                v-model="selectedLevel"
                data-testid="level-exact-select"
                :items="levelOptions"
                value-key="value"
                placeholder="All Levels"
                size="md"
                class="w-full sm:w-48"
              />

              <!-- Range Level Mode -->
              <div
                v-else
                class="flex gap-2 w-full"
              >
                <USelectMenu
                  v-model="minLevel"
                  data-testid="level-min-select"
                  :items="levelOptions"
                  value-key="value"
                  placeholder="Min Level"
                  size="md"
                  class="w-full sm:w-24"
                />
                <span class="self-center text-gray-500">to</span>
                <USelectMenu
                  v-model="maxLevel"
                  data-testid="level-max-select"
                  :items="levelOptions"
                  value-key="value"
                  placeholder="Max Level"
                  size="md"
                  class="w-full sm:w-24"
                />
              </div>
            </div>

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
              v-model="selectedSources"
              :options="sourceOptions"
              label="Sources"
              placeholder="All Sources"
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

          <!-- Actions: Clear filters button -->
          <template #actions>
            <UButton
              v-if="hasActiveFilters"
              color="neutral"
              variant="soft"
              @click="clearFilters"
            >
              Clear Filters
            </UButton>
          </template>
        </UiFilterLayout>
      </UiFilterCollapse>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center gap-2 pt-2"
      >
        <span
          v-if="activeFilterCount > 0 || searchQuery"
          class="text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          Active:
        </span>
        <UButton
          v-if="getLevelFilterText"
          data-testid="level-filter-chip"
          size="xs"
          color="primary"
          variant="soft"
          @click="clearLevelFilter"
        >
          {{ getLevelFilterText }} ✕
        </UButton>
        <UButton
          v-if="selectedSchool !== null"
          size="xs"
          color="info"
          variant="soft"
          @click="selectedSchool = null"
        >
          {{ getSchoolName(selectedSchool) }} ✕
        </UButton>
        <UButton
          v-if="selectedClass !== null"
          size="xs"
          color="class"
          variant="soft"
          @click="selectedClass = null"
        >
          {{ getClassName(selectedClass) }} ✕
        </UButton>
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
          v-if="concentrationFilter !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="concentrationFilter = null"
        >
          Concentration: {{ concentrationFilter === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <UButton
          v-if="ritualFilter !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="ritualFilter = null"
        >
          Ritual: {{ ritualFilter === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <!-- Phase 1: Damage type chips -->
        <UButton
          v-for="damageType in selectedDamageTypes"
          :key="damageType"
          size="xs"
          color="error"
          variant="soft"
          @click="selectedDamageTypes = selectedDamageTypes.filter(dt => dt !== damageType)"
        >
          {{ getDamageTypeName(damageType) }} ✕
        </UButton>
        <!-- Phase 1: Saving throw chips -->
        <UButton
          v-for="savingThrow in selectedSavingThrows"
          :key="savingThrow"
          size="xs"
          color="info"
          variant="soft"
          @click="selectedSavingThrows = selectedSavingThrows.filter(st => st !== savingThrow)"
        >
          {{ getSavingThrowName(savingThrow) }} Save ✕
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
        <!-- Tag chips -->
        <UButton
          v-for="tag in selectedTags"
          :key="tag"
          size="xs"
          color="spell"
          variant="soft"
          @click="selectedTags = selectedTags.filter(t => t !== tag)"
        >
          {{ getTagName(tag) }} ✕
        </UButton>
        <!-- Phase 2: Component flag chips -->
        <UButton
          v-if="verbalFilter !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="verbalFilter = null"
        >
          Verbal: {{ verbalFilter === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <UButton
          v-if="somaticFilter !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="somaticFilter = null"
        >
          Somatic: {{ somaticFilter === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <UButton
          v-if="materialFilter !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="materialFilter = null"
        >
          Material: {{ materialFilter === '1' ? 'Yes' : 'No' }} ✕
        </UButton>
        <!-- Removed: Filter chips for unsupported filters (higherLevels, castingTime, range, duration) -->
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

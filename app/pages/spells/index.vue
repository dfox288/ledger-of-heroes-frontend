<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SpellSchool, Spell, CharacterClass, DamageType, AbilityScore } from '~/types'

const route = useRoute()
const { apiFetch } = useApi()

// Filter collapse state
const filtersOpen = ref(false)

// Custom filter state (entity-specific)
const selectedLevel = ref(route.query.level ? Number(route.query.level) : null)
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

// Phase 2: Component flag filters
const verbalFilter = ref<string | null>((route.query.has_verbal as string) || null)
const somaticFilter = ref<string | null>((route.query.has_somatic as string) || null)
const materialFilter = ref<string | null>((route.query.has_material as string) || null)

// Phase 3: Removed unsupported filters (not indexed in Meilisearch):
// - higherLevelsFilter (has_higher_levels not filterable)
// - castingTimeFilter (casting_time not filterable)
// - rangeFilter (range not filterable)
// - durationFilter (duration not filterable)

// Fetch spell schools for filter options
const { data: spellSchools } = await useAsyncData<SpellSchool[]>('spell-schools', async () => {
  const response = await apiFetch<{ data: SpellSchool[] }>('/spell-schools')
  return response?.data || []
})

// Fetch classes for filter options (base classes only)
// Note: Need to fetch 2 pages since there are 131 classes but limit is 100/page
const { data: classes } = await useAsyncData<CharacterClass[]>('classes-filter', async () => {
  const [page1, page2] = await Promise.all([
    apiFetch<{ data: CharacterClass[] }>('/classes?per_page=100&page=1'),
    apiFetch<{ data: CharacterClass[] }>('/classes?per_page=100&page=2')
  ])
  const allClasses = [...(page1?.data || []), ...(page2?.data || [])]
  // Filter to base classes only (API returns boolean true/false, not string)
  return allClasses.filter(c => c.is_base_class === true)
})

// Phase 1: Fetch damage types for filter options
const { data: damageTypes } = await useAsyncData<DamageType[]>('damage-types', async () => {
  const response = await apiFetch<{ data: DamageType[] }>('/damage-types')
  return response?.data || []
})

// Phase 1: Fetch ability scores (for saving throw filter options)
const { data: abilityScores } = await useAsyncData<AbilityScore[]>('ability-scores', async () => {
  const response = await apiFetch<{ data: AbilityScore[] }>('/ability-scores')
  return response?.data || []
})

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

// Phase 3: Removed unsupported filter options (not indexed in Meilisearch)
// - castingTimeOptions (casting_time not filterable)
// - rangeOptions (range not filterable)
// - durationOptions (duration not filterable)
// Users can search for these values using full-text search (?q=1 action)

// Query builder for custom filters
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  const meilisearchFilters: string[] = []

  // Level filter (Meilisearch)
  if (selectedLevel.value !== null) {
    meilisearchFilters.push(`level = ${selectedLevel.value}`)
  }

  // School filter (Meilisearch) - Convert ID to school_code
  if (selectedSchool.value !== null) {
    const schoolCode = spellSchools.value?.find(s => s.id === selectedSchool.value)?.code
    if (schoolCode) {
      meilisearchFilters.push(`school_code = ${schoolCode}`)
    }
  }

  // Class filter (Meilisearch)
  if (selectedClass.value !== null) {
    meilisearchFilters.push(`class_slugs IN [${selectedClass.value}]`)
  }

  // Concentration filter (Meilisearch) - Convert string to boolean
  if (concentrationFilter.value !== null) {
    const boolValue = concentrationFilter.value === '1' || concentrationFilter.value === 'true'
    meilisearchFilters.push(`concentration = ${boolValue}`)
  }

  // Ritual filter (Meilisearch) - Convert string to boolean
  if (ritualFilter.value !== null) {
    const boolValue = ritualFilter.value === '1' || ritualFilter.value === 'true'
    meilisearchFilters.push(`ritual = ${boolValue}`)
  }

  // Damage types filter (Meilisearch multi-select)
  if (selectedDamageTypes.value.length > 0) {
    const codes = selectedDamageTypes.value.join(', ')
    meilisearchFilters.push(`damage_types IN [${codes}]`)
  }

  // Saving throws filter (Meilisearch multi-select)
  if (selectedSavingThrows.value.length > 0) {
    const codes = selectedSavingThrows.value.join(', ')
    meilisearchFilters.push(`saving_throws IN [${codes}]`)
  }

  // Component filters (Meilisearch) - Convert string to boolean
  if (verbalFilter.value !== null) {
    const boolValue = verbalFilter.value === '1' || verbalFilter.value === 'true'
    meilisearchFilters.push(`requires_verbal = ${boolValue}`)
  }

  if (somaticFilter.value !== null) {
    const boolValue = somaticFilter.value === '1' || somaticFilter.value === 'true'
    meilisearchFilters.push(`requires_somatic = ${boolValue}`)
  }

  if (materialFilter.value !== null) {
    const boolValue = materialFilter.value === '1' || materialFilter.value === 'true'
    meilisearchFilters.push(`requires_material = ${boolValue}`)
  }

  // NOTE: Removed unsupported filters (not indexed in Meilisearch):
  // - has_higher_levels (field not filterable)
  // - casting_time (field not filterable)
  // - range (field not filterable)
  // - duration (field not filterable)
  // Users can still search for these values using full-text search (?q=1 action)

  // Combine all Meilisearch filters with AND
  if (meilisearchFilters.length > 0) {
    params.filter = meilisearchFilters.join(' AND ')
  }

  return params
})

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
  queryBuilder,
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
  selectedSchool.value = null
  selectedClass.value = null
  concentrationFilter.value = null
  ritualFilter.value = null
  // Phase 1: Clear multi-select filters
  selectedDamageTypes.value = []
  selectedSavingThrows.value = []
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

// Pagination settings
const perPage = 24

// Count active filters (excluding search) for collapse badge
const activeFilterCount = computed(() => {
  let count = 0
  if (selectedLevel.value !== null) count++
  if (selectedSchool.value !== null) count++
  if (selectedClass.value !== null) count++
  if (concentrationFilter.value !== null) count++
  if (ritualFilter.value !== null) count++
  // Phase 1: Count multi-select filters
  if (selectedDamageTypes.value.length > 0) count++
  if (selectedSavingThrows.value.length > 0) count++
  // Phase 2: Count component flag filters
  if (verbalFilter.value !== null) count++
  if (somaticFilter.value !== null) count++
  if (materialFilter.value !== null) count++
  // Phase 3: Removed unsupported filter counts
  return count
})
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
        </template>

        <!-- Filter Content -->
        <div class="space-y-4">
          <!-- Basic Filters -->
          <div class="flex flex-wrap gap-2 mb-4">
            <!-- Level filter -->
            <USelectMenu
              v-model="selectedLevel"
              :items="levelOptions"
              value-key="value"
              placeholder="All Levels"
              size="md"
              class="w-48"
            />

            <!-- School filter -->
            <USelectMenu
              v-model="selectedSchool"
              :items="schoolOptions"
              value-key="value"
              placeholder="All Schools"
              size="md"
              class="w-48"
            />

            <!-- Class filter -->
            <USelectMenu
              v-model="selectedClass"
              :items="classOptions"
              value-key="value"
              placeholder="All Classes"
              size="md"
              class="w-48"
            />
          </div>

          <!-- Quick Toggles -->
          <div class="flex flex-wrap gap-4">
            <!-- Concentration filter -->
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

            <!-- Ritual filter -->
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
          </div>

          <!-- Phase 2: Spell Components -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Spell Components
            </label>
            <div class="flex flex-wrap gap-4">
              <!-- Verbal Component -->
              <UiFilterToggle
                v-model="verbalFilter"
                label="Verbal (V)"
                color="primary"
                :options="[
                  { value: null, label: 'All' },
                  { value: '1', label: 'Yes' },
                  { value: '0', label: 'No' }
                ]"
              />

              <!-- Somatic Component -->
              <UiFilterToggle
                v-model="somaticFilter"
                label="Somatic (S)"
                color="primary"
                :options="[
                  { value: null, label: 'All' },
                  { value: '1', label: 'Yes' },
                  { value: '0', label: 'No' }
                ]"
              />

              <!-- Material Component -->
              <UiFilterToggle
                v-model="materialFilter"
                label="Material (M)"
                color="primary"
                :options="[
                  { value: null, label: 'All' },
                  { value: '1', label: 'Yes' },
                  { value: '0', label: 'No' }
                ]"
              />
            </div>
          </div>

          <!-- Phase 2: Spell Scaling -->
          <!-- Removed: Spell Scaling filter (has_higher_levels not filterable in Meilisearch) -->

          <!-- Phase 1: Multi-select Filters -->
          <div class="flex flex-wrap gap-2">
            <!-- Damage Types filter -->
            <UiFilterMultiSelect
              v-model="selectedDamageTypes"
              :options="damageTypeOptions"
              label="Damage Types"
              placeholder="All Damage Types"
              color="primary"
              class="w-64"
            />

            <!-- Saving Throws filter -->
            <UiFilterMultiSelect
              v-model="selectedSavingThrows"
              :options="savingThrowOptions"
              label="Saving Throws"
              placeholder="All Saving Throws"
              color="primary"
              class="w-64"
            />
          </div>

          <!-- Removed: Phase 3 Direct Field Filters (casting_time, range, duration not filterable in Meilisearch) -->
          <!-- Users can search for these values using full-text search (e.g., ?q=1 action) -->

          <!-- Clear filters button -->
          <div class="flex justify-end">
            <UButton
              v-if="hasActiveFilters"
              color="neutral"
              variant="soft"
              @click="clearFilters"
            >
              Clear Filters
            </UButton>
          </div>
        </div>
      </UiFilterCollapse>

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        class="flex flex-wrap items-center gap-2 pt-2"
      >
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Active:</span>
        <UButton
          v-if="selectedLevel !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="selectedLevel = null"
        >
          Level {{ selectedLevel === 0 ? 'Cantrip' : selectedLevel }} ✕
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

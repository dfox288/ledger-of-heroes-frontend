<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SpellSchool, Spell, CharacterClass, DamageType as DamageTypeBase, AbilityScore as AbilityScoreBase } from '~/types'

// Extended types for filter entities (API returns code field for these)
interface DamageType extends DamageTypeBase {
  code: string
}

interface AbilityScore extends AbilityScoreBase {
  code: string
}

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
const higherLevelsFilter = ref<string | null>((route.query.has_higher_levels as string) || null)

// Phase 3: Direct field filters
const castingTimeFilter = ref<string | null>((route.query.casting_time as string) || null)
const rangeFilter = ref<string | null>((route.query.range as string) || null)
const durationFilter = ref<string | null>((route.query.duration as string) || null)

// Fetch spell schools for filter options
const { data: spellSchools } = await useAsyncData<SpellSchool[]>('spell-schools', async () => {
  const response = await apiFetch<{ data: SpellSchool[] }>('/spell-schools')
  return response.data
})

// Fetch classes for filter options
const { data: classes } = await useAsyncData<CharacterClass[]>('classes-filter', async () => {
  const response = await apiFetch<{ data: CharacterClass[] }>('/classes?per_page=200')
  return response.data
})

// Phase 1: Fetch damage types for filter options
const { data: damageTypes } = await useAsyncData<DamageType[]>('damage-types', async () => {
  const response = await apiFetch<{ data: DamageType[] }>('/damage-types')
  return response.data
})

// Phase 1: Fetch ability scores (for saving throw filter options)
const { data: abilityScores } = await useAsyncData<AbilityScore[]>('ability-scores', async () => {
  const response = await apiFetch<{ data: AbilityScore[] }>('/ability-scores')
  return response.data
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

// Class filter options (base classes only, sorted alphabetically)
const classOptions = computed(() => {
  const options: Array<{ label: string, value: string | null }> = [{ label: 'All Classes', value: null }]
  if (classes.value) {
    const baseClasses = classes.value
      .filter(c => c.is_base_class === '1')
      .sort((a, b) => a.name.localeCompare(b.name))

    options.push(...baseClasses.map(cls => ({
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

// Phase 3: Casting time options (hardcoded common values)
const castingTimeOptions = [
  { label: 'All Casting Times', value: null },
  { label: '1 Action', value: '1 action' },
  { label: '1 Bonus Action', value: '1 bonus action' },
  { label: '1 Reaction', value: '1 reaction' },
  { label: '1 Minute', value: '1 minute' },
  { label: '10 Minutes', value: '10 minutes' },
  { label: '1 Hour', value: '1 hour' },
  { label: '8 Hours', value: '8 hours' },
  { label: '12 Hours', value: '12 hours' },
  { label: '24 Hours', value: '24 hours' }
]

// Phase 3: Range options (hardcoded common values)
const rangeOptions = [
  { label: 'All Ranges', value: null },
  { label: 'Self', value: 'Self' },
  { label: 'Touch', value: 'Touch' },
  { label: '5 feet', value: '5 feet' },
  { label: '10 feet', value: '10 feet' },
  { label: '30 feet', value: '30 feet' },
  { label: '60 feet', value: '60 feet' },
  { label: '90 feet', value: '90 feet' },
  { label: '120 feet', value: '120 feet' },
  { label: '150 feet', value: '150 feet' },
  { label: '300 feet', value: '300 feet' },
  { label: '500 feet', value: '500 feet' },
  { label: '1 mile', value: '1 mile' },
  { label: 'Sight', value: 'Sight' },
  { label: 'Unlimited', value: 'Unlimited' }
]

// Phase 3: Duration options (hardcoded common values)
const durationOptions = [
  { label: 'All Durations', value: null },
  { label: 'Instantaneous', value: 'Instantaneous' },
  { label: '1 round', value: '1 round' },
  { label: '1 minute', value: '1 minute' },
  { label: '10 minutes', value: '10 minutes' },
  { label: '1 hour', value: '1 hour' },
  { label: '2 hours', value: '2 hours' },
  { label: '8 hours', value: '8 hours' },
  { label: '24 hours', value: '24 hours' },
  { label: '7 days', value: '7 days' },
  { label: '10 days', value: '10 days' },
  { label: '30 days', value: '30 days' },
  { label: 'Until dispelled', value: 'Until dispelled' },
  { label: 'Special', value: 'Special' },
  { label: 'Concentration, up to 1 minute', value: 'Concentration, up to 1 minute' },
  { label: 'Concentration, up to 10 minutes', value: 'Concentration, up to 10 minutes' },
  { label: 'Concentration, up to 1 hour', value: 'Concentration, up to 1 hour' },
  { label: 'Concentration, up to 8 hours', value: 'Concentration, up to 8 hours' },
  { label: 'Concentration, up to 24 hours', value: 'Concentration, up to 24 hours' }
]

// Query builder for custom filters
const queryBuilder = computed(() => {
  const params: Record<string, unknown> = {}
  if (selectedLevel.value !== null) params.level = selectedLevel.value
  if (selectedSchool.value !== null) params.school = selectedSchool.value
  if (selectedClass.value !== null) params.classes = selectedClass.value
  if (concentrationFilter.value !== null) params.concentration = concentrationFilter.value
  if (ritualFilter.value !== null) params.ritual = ritualFilter.value

  // Phase 1: Multi-select filters (comma-separated)
  if (selectedDamageTypes.value.length > 0) params.damage_type = selectedDamageTypes.value.join(',')
  if (selectedSavingThrows.value.length > 0) params.saving_throw = selectedSavingThrows.value.join(',')

  // Phase 2: Component flag filters
  if (verbalFilter.value !== null) params.has_verbal = verbalFilter.value
  if (somaticFilter.value !== null) params.has_somatic = somaticFilter.value
  if (materialFilter.value !== null) params.has_material = materialFilter.value
  if (higherLevelsFilter.value !== null) params.has_higher_levels = higherLevelsFilter.value

  // Phase 3: Direct field filters
  if (castingTimeFilter.value !== null) params.casting_time = castingTimeFilter.value
  if (rangeFilter.value !== null) params.range = rangeFilter.value
  if (durationFilter.value !== null) params.duration = durationFilter.value

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
  higherLevelsFilter.value = null
  // Phase 3: Clear direct field filters
  castingTimeFilter.value = null
  rangeFilter.value = null
  durationFilter.value = null
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
  if (higherLevelsFilter.value !== null) count++
  // Phase 3: Count direct field filters
  if (castingTimeFilter.value !== null) count++
  if (rangeFilter.value !== null) count++
  if (durationFilter.value !== null) count++
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

    <!-- Add after UiListPageHeader -->
    <div class="mb-6">
      <UButton
        to="/spells/list-generator"
        color="primary"
        variant="solid"
        icon="i-heroicons-sparkles"
      >
        🪄 Create Spell List
      </UButton>
    </div>

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
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Spell Scaling
            </label>
            <UiFilterToggle
              v-model="higherLevelsFilter"
              label="At Higher Levels"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Has Scaling' },
                { value: '0', label: 'No Scaling' }
              ]"
            />
          </div>

          <!-- Phase 1: Multi-select Filters -->
          <div class="flex flex-wrap gap-2">
            <!-- Damage Types filter -->
            <UiFilterMultiSelect
              v-model="selectedDamageTypes"
              :options="damageTypeOptions"
              label="Damage Types"
              placeholder="Select damage types"
              color="primary"
              class="w-64"
            />

            <!-- Saving Throws filter -->
            <UiFilterMultiSelect
              v-model="selectedSavingThrows"
              :options="savingThrowOptions"
              label="Saving Throws"
              placeholder="Select saving throws"
              color="primary"
              class="w-64"
            />
          </div>

          <!-- Phase 3: Direct Field Filters -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Spell Properties
            </label>
            <div class="flex flex-wrap gap-2">
              <!-- Casting Time filter -->
              <USelectMenu
                v-model="castingTimeFilter"
                :items="castingTimeOptions"
                value-key="value"
                placeholder="All Casting Times"
                size="md"
                class="w-56"
              />

              <!-- Range filter -->
              <USelectMenu
                v-model="rangeFilter"
                :items="rangeOptions"
                value-key="value"
                placeholder="All Ranges"
                size="md"
                class="w-56"
              />

              <!-- Duration filter -->
              <USelectMenu
                v-model="durationFilter"
                :items="durationOptions"
                value-key="value"
                placeholder="All Durations"
                size="md"
                class="w-56"
              />
            </div>
          </div>

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
        <UButton
          v-if="higherLevelsFilter !== null"
          size="xs"
          color="primary"
          variant="soft"
          @click="higherLevelsFilter = null"
        >
          Scaling: {{ higherLevelsFilter === '1' ? 'Has Scaling' : 'No Scaling' }} ✕
        </UButton>
        <!-- Phase 3: Direct field chips -->
        <UButton
          v-if="castingTimeFilter !== null"
          size="xs"
          color="info"
          variant="soft"
          @click="castingTimeFilter = null"
        >
          {{ castingTimeFilter }} ✕
        </UButton>
        <UButton
          v-if="rangeFilter !== null"
          size="xs"
          color="info"
          variant="soft"
          @click="rangeFilter = null"
        >
          {{ rangeFilter }} ✕
        </UButton>
        <UButton
          v-if="durationFilter !== null"
          size="xs"
          color="info"
          variant="soft"
          @click="durationFilter = null"
        >
          {{ durationFilter }} ✕
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

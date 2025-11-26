<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { SpellSchool, Spell, CharacterClass, DamageType, AbilityScore } from '~/types'
import { useSpellFiltersStore } from '~/stores/spellFilters'

const route = useRoute()

// Use filter store instead of local refs
const store = useSpellFiltersStore()
const {
  searchQuery,
  sortBy,
  sortDirection,
  selectedSources,
  selectedLevels,
  selectedSchool,
  selectedClass,
  concentrationFilter,
  ritualFilter,
  selectedDamageTypes,
  selectedSavingThrows,
  selectedTags,
  verbalFilter,
  somaticFilter,
  materialFilter,
  filtersOpen
} = storeToRefs(store)

// URL sync composable
const { hasUrlParams, syncToUrl, clearUrl } = useFilterUrlSync()

// On mount: URL params override persisted state
onMounted(() => {
  if (hasUrlParams.value) {
    store.setFromUrlQuery(route.query)
  }
})

// Sync store changes to URL (debounced)
let urlSyncTimeout: ReturnType<typeof setTimeout> | null = null
watch(
  () => store.toUrlQuery,
  (query) => {
    if (urlSyncTimeout) clearTimeout(urlSyncTimeout)
    urlSyncTimeout = setTimeout(() => {
      syncToUrl(query)
    }, 300)
  },
  { deep: true }
)

// Sort value computed (combines sortBy + sortDirection)
const sortValue = useSortValue(sortBy, sortDirection)

// Source filter options (still need the composable for options)
const { sourceOptions, getSourceName } = useSourceFilter()

// Fetch reference data
const { data: spellSchools } = useReferenceData<SpellSchool>('/spell-schools')
const { data: classes } = useReferenceData<CharacterClass>('/classes', {
  pages: 2,
  transform: (data) => data.filter(c => c.is_base_class === true)
})
const { data: damageTypes } = useReferenceData<DamageType>('/damage-types')
const { data: abilityScores } = useReferenceData<AbilityScore>('/ability-scores')

// Filter options
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

const tagOptions = [
  { label: 'Ritual Caster', value: 'ritual-caster' },
  { label: 'Touch Spells', value: 'touch-spells' }
]

const schoolOptions = computed(() => {
  const options: Array<{ label: string, value: number | null }> = [{ label: 'All Schools', value: null }]
  if (spellSchools.value) {
    options.push(...spellSchools.value.map(school => ({ label: school.name, value: school.id })))
  }
  return options
})

const classOptions = computed(() => {
  const options: Array<{ label: string, value: string | null }> = [{ label: 'All Classes', value: null }]
  if (classes.value) {
    const sorted = [...classes.value].sort((a, b) => a.name.localeCompare(b.name))
    options.push(...sorted.map(cls => ({ label: cls.name, value: cls.slug })))
  }
  return options
})

const damageTypeOptions = computed(() => {
  if (!damageTypes.value) return []
  return damageTypes.value.map(dt => ({ label: dt.name, value: dt.code }))
})

const savingThrowOptions = computed(() => {
  if (!abilityScores.value) return []
  return abilityScores.value.map(ab => ({ label: ab.code, value: ab.code }))
})

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Level (Low-High)', value: 'level:asc' },
  { label: 'Level (High-Low)', value: 'level:desc' }
]

// Query builder for filters (uses store refs)
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: selectedLevels, field: 'level', type: 'in', transform: (levels) => levels.map(Number) },
  { ref: selectedSchool, field: 'school_code', transform: (id) => spellSchools.value?.find(s => s.id === id)?.code || null },
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

const queryParams = computed(() => ({
  ...filterParams.value,
  sort_by: sortBy.value,
  sort_direction: sortDirection.value
}))

// Use entity list composable
const {
  currentPage,
  data: spellsData,
  meta,
  totalResults,
  loading,
  error,
  refresh
} = useEntityList({
  endpoint: '/spells',
  cacheKey: 'spells-list',
  queryBuilder: queryParams,
  searchQuery, // Pass store's searchQuery
  seo: {
    title: 'Spells - D&D 5e Compendium',
    description: 'Browse all D&D 5e spells. Filter by level, school, and search for specific spells.'
  }
})

const spells = computed(() => spellsData.value as Spell[])

// Clear all filters - uses store action + URL clear
const clearFilters = () => {
  store.clearAll()
  clearUrl()
}

// Helper functions
const getSchoolName = (id: number) => spellSchools.value?.find(s => s.id === id)?.name || 'Unknown'
const getClassName = (slug: string) => classes.value?.find(c => c.slug === slug)?.name || 'Unknown'
const getDamageTypeName = (code: string) => damageTypes.value?.find(dt => dt.code === code)?.name || code
const getTagName = (slug: string) => tagOptions.find(t => t.value === slug)?.label || slug

const getLevelLabel = (levelStr: string): string => {
  const level = Number(levelStr)
  if (level === 0) return 'Cantrip'
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${level}${suffixes[level]}`
}

const getLevelFilterText = computed(() => {
  if (selectedLevels.value.length === 0) return null
  const labels = selectedLevels.value.sort((a, b) => Number(a) - Number(b)).map(level => getLevelLabel(level))
  const prefix = selectedLevels.value.length === 1 ? 'Level' : 'Levels'
  return `${prefix}: ${labels.join(', ')}`
})

// Active filter count (use store getter)
const activeFilterCount = computed(() => store.activeFilterCount)

// Has active filters (use store getter)
const hasActiveFilters = computed(() => store.hasActiveFilters)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Spells"
      :total="totalResults"
      description="Browse and search D&D 5e spells"
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
            placeholder="Search spells..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="spell"
          />
        </template>

        <UiFilterLayout>
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedLevels"
              data-testid="level-filter-multiselect"
              :options="levelOptions"
              label="Level"
              placeholder="All Levels"
              color="primary"
              class="w-full sm:w-48"
            />

            <UiFilterSelect
              v-model="selectedSchool"
              :options="schoolOptions"
              label="School"
              placeholder="All Schools"
              data-testid="school-filter"
            />

            <UiFilterSelect
              v-model="selectedClass"
              :options="classOptions"
              label="Class"
              placeholder="All Classes"
              data-testid="class-filter"
            />
          </template>

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

        <!-- Level chip -->
        <UiFilterChip
          v-if="getLevelFilterText"
          color="spell"
          test-id="level-filter-chip"
          @remove="selectedLevels = []"
        >
          {{ getLevelFilterText }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedSchool !== null"
          color="spell"
          test-id="school-filter-chip"
          @remove="selectedSchool = null"
        >
          School: {{ getSchoolName(selectedSchool) }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedClass !== null"
          color="class"
          test-id="class-filter-chip"
          @remove="selectedClass = null"
        >
          Class: {{ getClassName(selectedClass) }}
        </UiFilterChip>
        <UiFilterChip
          v-for="damageType in selectedDamageTypes"
          :key="damageType"
          color="error"
          test-id="damage-type-filter-chip"
          @remove="selectedDamageTypes = selectedDamageTypes.filter(dt => dt !== damageType)"
        >
          {{ getDamageTypeName(damageType) }}
        </UiFilterChip>
        <UiFilterChip
          v-for="savingThrow in selectedSavingThrows"
          :key="savingThrow"
          color="info"
          test-id="saving-throw-filter-chip"
          @remove="selectedSavingThrows = selectedSavingThrows.filter(st => st !== savingThrow)"
        >
          {{ savingThrow }} Save
        </UiFilterChip>
        <UiFilterChip
          v-for="tag in selectedTags"
          :key="tag"
          color="spell"
          test-id="tag-filter-chip"
          @remove="selectedTags = selectedTags.filter(t => t !== tag)"
        >
          {{ getTagName(tag) }}
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="concentrationFilter !== null"
            color="primary"
            test-id="concentration-filter-chip"
            @remove="concentrationFilter = null"
          >
            Concentration: {{ concentrationFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="ritualFilter !== null"
            color="primary"
            test-id="ritual-filter-chip"
            @remove="ritualFilter = null"
          >
            Ritual: {{ ritualFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="verbalFilter !== null"
            color="primary"
            test-id="verbal-filter-chip"
            @remove="verbalFilter = null"
          >
            Verbal: {{ verbalFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="somaticFilter !== null"
            color="primary"
            test-id="somatic-filter-chip"
            @remove="somaticFilter = null"
          >
            Somatic: {{ somaticFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="materialFilter !== null"
            color="primary"
            test-id="material-filter-chip"
            @remove="materialFilter = null"
          >
            Material: {{ materialFilter === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <UiListStates
      :loading="loading"
      :error="error"
      :empty="spells.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="spell"
      entity-name-plural="Spells"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <SpellCard
          v-for="spell in spells"
          :key="spell.id"
          :spell="spell"
        />
      </template>
    </UiListStates>

    <UiBackLink />
  </div>
</template>

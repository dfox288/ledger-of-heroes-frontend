<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { CharacterClass } from '~/types'
import { useClassFiltersStore } from '~/stores/classFilters'

const route = useRoute()

// Use filter store instead of local refs
const store = useClassFiltersStore()
const {
  searchQuery,
  sortBy,
  sortDirection,
  selectedSources,
  isBaseClass,
  isSpellcaster,
  selectedHitDice,
  selectedSpellcastingAbility,
  selectedParentClass,
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

// Fetch base classes for parent filter
const { data: baseClasses } = useReferenceData<CharacterClass>('/classes', {
  transform: (data) => data.filter(c => c.is_base_class === true)
})

// Filter options
const hitDieOptions = [
  { label: 'd6', value: 6 },
  { label: 'd8', value: 8 },
  { label: 'd10', value: 10 },
  { label: 'd12', value: 12 }
]

const spellcastingAbilityOptions = [
  { label: 'All Abilities', value: null },
  { label: 'Intelligence', value: 'INT' },
  { label: 'Wisdom', value: 'WIS' },
  { label: 'Charisma', value: 'CHA' }
]

const parentClassOptions = computed(() => {
  const options = [{ label: 'All Classes', value: null }]
  if (baseClasses.value) {
    baseClasses.value.forEach(cls => {
      options.push({ label: cls.name, value: cls.name })
    })
  }
  return options
})

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Hit Die (Low→High)', value: 'hit_die:asc' },
  { label: 'Hit Die (High→Low)', value: 'hit_die:desc' }
]

// Query builder for filters (uses store refs)
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: isBaseClass, field: 'is_base_class', type: 'boolean' },
  { ref: isSpellcaster, field: 'is_spellcaster', type: 'boolean' },
  { ref: selectedHitDice, field: 'hit_die', type: 'in' },
  { ref: selectedSpellcastingAbility, field: 'spellcasting_ability' },
  { ref: selectedParentClass, field: 'parent_class_name' },
  { ref: selectedSources, field: 'source_codes', type: 'in' }
])

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
  endpoint: '/classes',
  cacheKey: 'classes-list',
  queryBuilder: queryParams,
  searchQuery, // Pass store's searchQuery
  seo: {
    title: 'Classes - D&D 5e Compendium',
    description: 'Browse all D&D 5e player classes and subclasses.'
  }
})

const classes = computed(() => data.value as CharacterClass[])

// Clear all filters - uses store action + URL clear
const clearFilters = () => {
  store.clearAll()
  clearUrl()
}

// Active filter count (use store getter)
const activeFilterCount = computed(() => store.activeFilterCount)

// Has active filters (use store getter)
const hasActiveFilters = computed(() => store.hasActiveFilters)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <UiListPageHeader
      title="Classes"
      :total="totalResults"
      description="Browse D&D 5e classes and subclasses"
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
            placeholder="Search classes..."
            :source-options="sourceOptions"
            :sort-options="sortOptions"
            color="class"
          />
        </template>

        <UiFilterLayout>
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedHitDice"
              :options="hitDieOptions"
              label="Hit Die"
              placeholder="All Hit Dice"
              color="class"
              class="w-full sm:w-48"
              data-testid="hit-die-filter"
            />

            <UiFilterSelect
              v-model="selectedSpellcastingAbility"
              :options="spellcastingAbilityOptions"
              label="Spellcasting"
              placeholder="All Abilities"
              data-testid="spellcasting-ability-filter"
            />

            <UiFilterSelect
              v-model="selectedParentClass"
              :options="parentClassOptions"
              label="Parent Class"
              placeholder="All Classes"
              data-testid="parent-class-filter"
            />
          </template>

          <template #quick>
            <UiFilterToggle
              v-model="isBaseClass"
              label="Base Class Only"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="isSpellcaster"
              label="Spellcaster"
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
          v-for="hitDie in selectedHitDice"
          :key="hitDie"
          color="class"
          test-id="hit-die-filter-chip"
          @remove="selectedHitDice = selectedHitDice.filter(d => d !== hitDie)"
        >
          Hit Die: d{{ hitDie }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedSpellcastingAbility"
          color="class"
          test-id="spellcasting-ability-filter-chip"
          @remove="selectedSpellcastingAbility = null"
        >
          Spellcasting: {{ spellcastingAbilityOptions.find(o => o.value === selectedSpellcastingAbility)?.label }}
        </UiFilterChip>
        <UiFilterChip
          v-if="selectedParentClass"
          color="class"
          test-id="parent-class-filter-chip"
          @remove="selectedParentClass = null"
        >
          Parent: {{ selectedParentClass }}
        </UiFilterChip>

        <template #toggles>
          <UiFilterChip
            v-if="isBaseClass !== null"
            color="primary"
            test-id="is-base-class-filter-chip"
            @remove="isBaseClass = null"
          >
            Base Class: {{ isBaseClass === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
          <UiFilterChip
            v-if="isSpellcaster !== null"
            color="primary"
            test-id="is-spellcaster-filter-chip"
            @remove="isSpellcaster = null"
          >
            Spellcaster: {{ isSpellcaster === '1' ? 'Yes' : 'No' }}
          </UiFilterChip>
        </template>
      </UiFilterChips>
    </div>

    <UiListStates
      :loading="loading"
      :error="error"
      :empty="classes.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="class"
      entity-name-plural="Classes"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <template #grid>
        <ClassCard
          v-for="charClass in classes"
          :key="charClass.id"
          :character-class="charClass"
        />
      </template>
    </UiListStates>

    <UiBackLink />
  </div>
</template>

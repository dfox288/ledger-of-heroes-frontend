<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CharacterClass, Source } from '~/types'

const route = useRoute()

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

// Custom filter state (entity-specific)
const isBaseClass = ref<string | null>((route.query.is_base_class as string) || null)
const isSpellcaster = ref<string | null>((route.query.is_spellcaster as string) || null)

// Hit Die filter
const selectedHitDice = ref<number[]>([])
const hitDieOptions = [
  { label: 'd6', value: 6 },
  { label: 'd8', value: 8 },
  { label: 'd10', value: 10 },
  { label: 'd12', value: 12 }
]

// Spellcasting Ability filter
const selectedSpellcastingAbility = ref<string | null>(null)
const spellcastingAbilityOptions = [
  { label: 'All Abilities', value: null },
  { label: 'Intelligence', value: 'INT' },
  { label: 'Wisdom', value: 'WIS' },
  { label: 'Charisma', value: 'CHA' }
]

// Parent Class filter - fetch base classes for dropdown
const { data: baseClasses } = useReferenceData<CharacterClass>('/classes', {
  transform: (data) => data.filter(c => c.is_base_class === true)
})

const parentClassOptions = computed(() => {
  const options = [{ label: 'All Classes', value: null }]
  if (baseClasses.value) {
    baseClasses.value.forEach(cls => {
      options.push({ label: cls.name, value: cls.name })
    })
  }
  return options
})

const selectedParentClass = ref<string | null>(null)

// Source filter
const { data: sources } = useReferenceData<Source>('/sources')

const sourceOptions = computed(() =>
  sources.value?.map(s => ({ label: s.name, value: s.code })) || []
)

const selectedSources = ref<string[]>([])

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'Hit Die (Low→High)', value: 'hit_die:asc' },
  { label: 'Hit Die (High→Low)', value: 'hit_die:desc' }
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

// Query builder (using composable)
const { queryParams: filterParams } = useMeilisearchFilters([
  { ref: isBaseClass, field: 'is_base_class', type: 'boolean' },
  { ref: isSpellcaster, field: 'is_spellcaster', type: 'boolean' },
  { ref: selectedHitDice, field: 'hit_die', type: 'in' },
  { ref: selectedSpellcastingAbility, field: 'spellcasting_ability' },
  { ref: selectedParentClass, field: 'parent_class_name' },
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
  endpoint: '/classes',
  cacheKey: 'classes-list',
  queryBuilder: queryParams,
  seo: {
    title: 'Classes - D&D 5e Compendium',
    description: 'Browse all D&D 5e player classes and subclasses.'
  }
})

// Type the data array
const classes = computed(() => data.value as CharacterClass[])

// Clear all filters (base + custom)
const clearFilters = () => {
  clearBaseFilters()
  isBaseClass.value = null
  isSpellcaster.value = null
  selectedHitDice.value = []
  selectedSpellcastingAbility.value = null
  selectedParentClass.value = null
  selectedSources.value = []
}

// Filter collapse state
const filtersOpen = ref(false)

// Active filter count for badge
const activeFilterCount = useFilterCount(
  isBaseClass,
  isSpellcaster,
  selectedHitDice,
  selectedSpellcastingAbility,
  selectedParentClass,
  selectedSources
)

// Pagination settings
const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Classes"
      :total="totalResults"
      description="Browse D&D 5e classes and subclasses"
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
              placeholder="Search classes..."
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
              color="class"
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
            <!-- Base Class filter -->
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

            <!-- Spellcaster filter -->
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

      <!-- Active Filter Chips -->
      <div
        v-if="hasActiveFilters"
        data-testid="chips-container"
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

          <!-- 2. Entity-specific: Hit Die, Spellcasting Ability, Parent Class -->
          <UButton
            v-for="hitDie in selectedHitDice"
            :key="hitDie"
            data-testid="hit-die-filter-chip"
            size="xs"
            color="class"
            variant="soft"
            @click="selectedHitDice = selectedHitDice.filter(d => d !== hitDie)"
          >
            Hit Die: d{{ hitDie }} ✕
          </UButton>
          <UButton
            v-if="selectedSpellcastingAbility"
            data-testid="spellcasting-ability-filter-chip"
            size="xs"
            color="class"
            variant="soft"
            @click="selectedSpellcastingAbility = null"
          >
            Spellcasting: {{ spellcastingAbilityOptions.find(o => o.value === selectedSpellcastingAbility)?.label }} ✕
          </UButton>
          <UButton
            v-if="selectedParentClass"
            data-testid="parent-class-filter-chip"
            size="xs"
            color="class"
            variant="soft"
            @click="selectedParentClass = null"
          >
            Parent: {{ selectedParentClass }} ✕
          </UButton>

          <!-- 3. Boolean toggles (primary color, "Label: Yes/No" format) -->
          <UButton
            v-if="isBaseClass !== null"
            data-testid="is-base-class-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="isBaseClass = null"
          >
            Base Class: {{ isBaseClass === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="isSpellcaster !== null"
            data-testid="is-spellcaster-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="isSpellcaster = null"
          >
            Spellcaster: {{ isSpellcaster === '1' ? 'Yes' : 'No' }} ✕
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
          v-if="activeFilterCount > 0 || searchQuery"
          data-testid="clear-filters-button"
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
      entity-name="Classes"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="classes.length === 0"
      entity-name="classes"
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
        entity-name="class"
      />

      <!-- Classes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ClassCard
          v-for="charClass in classes"
          :key="charClass.id"
          :character-class="charClass"
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

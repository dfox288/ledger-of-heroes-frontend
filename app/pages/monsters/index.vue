<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Monster, Size, Source } from '~/types'

const route = useRoute()

// Sorting state
const sortBy = ref<string>((route.query.sort_by as string) || 'name')
const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || 'asc')

// Custom filter state
// Note: UiFilterMultiSelect works with strings, so we store as strings and convert to numbers for filtering
const selectedCRs = ref<string[]>(
  route.query.cr ? (Array.isArray(route.query.cr) ? route.query.cr.map(String) : [String(route.query.cr)]) : []
)
const selectedType = ref(route.query.type ? String(route.query.type) : null)
const isLegendary = ref<string | null>((route.query.is_legendary as string) || null)
const selectedSizes = ref<string[]>(
  route.query.size_id ? (Array.isArray(route.query.size_id) ? route.query.size_id.map(String) : [String(route.query.size_id)]) : []
)
const selectedAlignments = ref<string[]>(
  route.query.alignment ? (Array.isArray(route.query.alignment) ? route.query.alignment : [route.query.alignment]) : []
)

// Movement types multiselect (replaces individual toggles)
const selectedMovementTypes = ref<string[]>(
  route.query.movement ? (Array.isArray(route.query.movement) ? route.query.movement : [route.query.movement]) : []
)

// New filters (6 additional filters)
const selectedArmorTypes = ref<string[]>(
  route.query.armor_type ? (Array.isArray(route.query.armor_type) ? route.query.armor_type : [route.query.armor_type]) : []
)
const canHover = ref<string | null>((route.query.can_hover as string) || null)
const hasLairActions = ref<string | null>((route.query.has_lair_actions as string) || null)
const hasReactions = ref<string | null>((route.query.has_reactions as string) || null)
const isSpellcaster = ref<string | null>((route.query.is_spellcaster as string) || null)
const hasMagicResistance = ref<string | null>((route.query.has_magic_resistance as string) || null)

// AC filter
const selectedACRange = ref<string | null>(null)
const acRangeOptions = [
  { label: 'All AC', value: null },
  { label: 'Low (10-14)', value: '10-14' },
  { label: 'Medium (15-17)', value: '15-17' },
  { label: 'High (18+)', value: '18-25' }
]

// HP filter
const selectedHPRange = ref<string | null>(null)
const hpRangeOptions = [
  { label: 'All HP', value: null },
  { label: 'Low (1-50)', value: '1-50' },
  { label: 'Medium (51-150)', value: '51-150' },
  { label: 'High (151-300)', value: '151-300' },
  { label: 'Very High (301+)', value: '301-600' }
]

// Fetch reference data for filters
const { data: sizes } = useReferenceData<Size>('/sizes')
const { data: sources } = useReferenceData<Source>('/sources')

// Movement type options for multiselect
const movementTypeOptions = [
  { label: 'Fly', value: 'fly' },
  { label: 'Swim', value: 'swim' },
  { label: 'Burrow', value: 'burrow' },
  { label: 'Climb', value: 'climb' },
  { label: 'Hover', value: 'hover' }
]

// Source filter state
const selectedSources = ref<string[]>(
  route.query.source ? (Array.isArray(route.query.source) ? route.query.source : [route.query.source]) : []
)

// Source filter options
const sourceOptions = computed(() =>
  sources.value?.map(s => ({ label: s.name, value: s.code })) || []
)

// CR multiselect options (common D&D 5e CR values)
const crOptions = [
  { label: 'CR 0', value: '0' },
  { label: 'CR 1/8', value: '0.125' },
  { label: 'CR 1/4', value: '0.25' },
  { label: 'CR 1/2', value: '0.5' },
  { label: 'CR 1', value: '1' },
  { label: 'CR 2', value: '2' },
  { label: 'CR 3', value: '3' },
  { label: 'CR 4', value: '4' },
  { label: 'CR 5', value: '5' },
  { label: 'CR 6', value: '6' },
  { label: 'CR 7', value: '7' },
  { label: 'CR 8', value: '8' },
  { label: 'CR 9', value: '9' },
  { label: 'CR 10', value: '10' },
  { label: 'CR 11', value: '11' },
  { label: 'CR 12', value: '12' },
  { label: 'CR 13', value: '13' },
  { label: 'CR 14', value: '14' },
  { label: 'CR 15', value: '15' },
  { label: 'CR 16', value: '16' },
  { label: 'CR 17', value: '17' },
  { label: 'CR 18', value: '18' },
  { label: 'CR 19', value: '19' },
  { label: 'CR 20', value: '20' },
  { label: 'CR 21', value: '21' },
  { label: 'CR 22', value: '22' },
  { label: 'CR 23', value: '23' },
  { label: 'CR 24', value: '24' },
  { label: 'CR 25', value: '25' },
  { label: 'CR 26', value: '26' },
  { label: 'CR 27', value: '27' },
  { label: 'CR 28', value: '28' },
  { label: 'CR 29', value: '29' },
  { label: 'CR 30', value: '30' }
]

// Size options from reference data
const sizeOptions = computed(() =>
  sizes.value?.map(s => ({ label: s.name, value: String(s.id) })) || []
)

// Alignment options (from API analysis - common D&D alignments)
const alignmentOptions = [
  { label: 'Lawful Good', value: 'Lawful Good' },
  { label: 'Neutral Good', value: 'Neutral Good' },
  { label: 'Chaotic Good', value: 'Chaotic Good' },
  { label: 'Lawful Neutral', value: 'Lawful Neutral' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'Chaotic Neutral', value: 'Chaotic Neutral' },
  { label: 'Lawful Evil', value: 'Lawful Evil' },
  { label: 'Neutral Evil', value: 'Neutral Evil' },
  { label: 'Chaotic Evil', value: 'Chaotic Evil' },
  { label: 'Unaligned', value: 'Unaligned' },
  { label: 'Any Alignment', value: 'Any alignment' }
]

// Type options
const typeOptions = [
  { label: 'All Types', value: null },
  { label: 'Aberration', value: 'aberration' },
  { label: 'Beast', value: 'beast' },
  { label: 'Celestial', value: 'celestial' },
  { label: 'Construct', value: 'construct' },
  { label: 'Dragon', value: 'dragon' },
  { label: 'Elemental', value: 'elemental' },
  { label: 'Fey', value: 'fey' },
  { label: 'Fiend', value: 'fiend' },
  { label: 'Giant', value: 'giant' },
  { label: 'Humanoid', value: 'humanoid' },
  { label: 'Monstrosity', value: 'monstrosity' },
  { label: 'Ooze', value: 'ooze' },
  { label: 'Plant', value: 'plant' },
  { label: 'Undead', value: 'undead' }
]

// Armor Type options (from API analysis - common armor types)
const armorTypeOptions = [
  { label: 'Natural Armor', value: 'natural armor' },
  { label: 'Plate Armor', value: 'plate armor' },
  { label: 'Leather Armor', value: 'leather armor' },
  { label: 'Studded Leather Armor', value: 'studded leather armor' },
  { label: 'Hide Armor', value: 'hide armor' },
  { label: 'Chain Mail', value: 'chain mail' },
  { label: 'Scale Mail', value: 'scale mail' },
  { label: 'Half Plate Armor', value: 'half plate armor' },
  { label: 'Breastplate', value: 'breastplate' },
  { label: 'Unarmored Defense', value: 'Unarmored Defense' }
]

// Sort options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
  { label: 'CR (Low→High)', value: 'challenge_rating:asc' },
  { label: 'CR (High→Low)', value: 'challenge_rating:desc' }
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

// Query builder (using composable for all filters)
const { queryParams: filterParams } = useMeilisearchFilters([
  // CR multiselect filter (convert strings to numbers for API)
  {
    ref: selectedCRs,
    field: 'challenge_rating',
    type: 'in',
    transform: (crs) => crs.map(Number)
  },
  { ref: selectedType, field: 'type' },
  // FIX: Changed from 'is_legendary' to 'has_legendary_actions' (correct Meilisearch field)
  { ref: isLegendary, field: 'has_legendary_actions', type: 'boolean' },
  // FIX: Changed from 'size_id' to 'size_code' and transform ID to code
  {
    ref: selectedSizes,
    field: 'size_code',
    type: 'in',
    transform: (sizeIds) => sizeIds.map((id: string) => {
      const size = sizes.value?.find(s => String(s.id) === id)
      return size?.code || null
    }).filter((code): code is string => code !== null)
  },
  // Alignment multiselect filter - values with spaces are auto-quoted by composable
  {
    ref: selectedAlignments,
    field: 'alignment',
    type: 'in'
  },
  // Note: Movement types handled manually in queryBuilder (requires IS NOT NULL syntax)
  // Other filters
  { ref: selectedArmorTypes, field: 'armor_type', type: 'in' },
  { ref: hasLairActions, field: 'has_lair_actions', type: 'boolean' },
  { ref: hasReactions, field: 'has_reactions', type: 'boolean' },
  { ref: isSpellcaster, field: 'is_spellcaster', type: 'boolean' },
  { ref: hasMagicResistance, field: 'has_magic_resistance', type: 'boolean' },
  { ref: selectedSources, field: 'source_codes', type: 'in' }
])

const queryBuilder = computed(() => {
  const params = { ...filterParams.value }
  const meilisearchFilters: string[] = []

  // Start with filters from composable
  if (params.filter) {
    meilisearchFilters.push(params.filter as string)
  }

  // Add AC range filter manually
  if (selectedACRange.value) {
    const ranges: Record<string, string> = {
      '10-14': 'armor_class >= 10 AND armor_class <= 14',
      '15-17': 'armor_class >= 15 AND armor_class <= 17',
      '18-25': 'armor_class >= 18 AND armor_class <= 25'
    }
    const rangeFilter = ranges[selectedACRange.value]
    if (rangeFilter) {
      meilisearchFilters.push(rangeFilter)
    }
  }

  // Add HP range filter manually
  if (selectedHPRange.value) {
    const ranges: Record<string, string> = {
      '1-50': 'hit_points_average >= 1 AND hit_points_average <= 50',
      '51-150': 'hit_points_average >= 51 AND hit_points_average <= 150',
      '151-300': 'hit_points_average >= 151 AND hit_points_average <= 300',
      '301-600': 'hit_points_average >= 301 AND hit_points_average <= 600'
    }
    const rangeFilter = ranges[selectedHPRange.value]
    if (rangeFilter) {
      meilisearchFilters.push(rangeFilter)
    }
  }

  // Add movement types filter (uses IS NOT NULL for each selected type)
  if (selectedMovementTypes.value.length > 0) {
    const movementFilters = selectedMovementTypes.value.map(type => {
      const fieldMap: Record<string, string> = {
        fly: 'speed_fly',
        swim: 'speed_swim',
        burrow: 'speed_burrow',
        climb: 'speed_climb',
        hover: 'can_hover'
      }
      const field = fieldMap[type]
      // For hover, it's a boolean field; for others, check IS NOT NULL
      return type === 'hover' ? `${field} = true` : `${field} IS NOT NULL`
    })
    // All selected movement types must be present (AND logic)
    meilisearchFilters.push(`(${movementFilters.join(' AND ')})`)
  }

  // Combine all filters
  if (meilisearchFilters.length > 0) {
    params.filter = meilisearchFilters.join(' AND ')
  }

  // Add sorting
  params.sort_by = sortBy.value
  params.sort_direction = sortDirection.value

  return params
})

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
  endpoint: '/monsters',
  cacheKey: 'monsters-list',
  queryBuilder,
  seo: {
    title: 'Monsters - D&D 5e Compendium',
    description: 'Browse D&D 5e monsters with stats, abilities, and lore. Filter by Challenge Rating and creature type.'
  }
})

const monsters = computed(() => data.value as Monster[])

// Clear all filters
const clearFilters = () => {
  clearBaseFilters()
  selectedCRs.value = []
  selectedType.value = null
  isLegendary.value = null
  selectedSizes.value = []
  selectedAlignments.value = []
  selectedMovementTypes.value = []
  selectedACRange.value = null
  selectedHPRange.value = null
  selectedArmorTypes.value = []
  hasLairActions.value = null
  hasReactions.value = null
  isSpellcaster.value = null
  hasMagicResistance.value = null
  selectedSources.value = []
}

// Helper functions for filter chips
const getCRLabel = (cr: string) => {
  // Convert back to display format (e.g., "0.125" → "CR 1/8", "5" → "CR 5")
  return crOptions.find(o => o.value === cr)?.label || `CR ${cr}`
}

// Get CR filter display text for chips
const getCRFilterText = computed(() => {
  if (selectedCRs.value.length === 0) return null

  const labels = selectedCRs.value
    .sort((a, b) => Number(a) - Number(b))
    .map(cr => getCRLabel(cr).replace('CR ', '')) // Remove "CR " prefix for compactness

  const prefix = selectedCRs.value.length === 1 ? 'CR' : 'CRs'
  return `${prefix}: ${labels.join(', ')}`
})

const clearCRFilter = () => {
  selectedCRs.value = []
}

const getTypeLabel = (type: string) => {
  return typeOptions.find(o => o.value === type)?.label || type
}

// Helper functions for size filter chips
const getSizeLabel = (sizeId: string) => {
  return sizeOptions.value.find(o => o.value === sizeId)?.label || sizeId
}

// Get Size filter display text for chips
const getSizeFilterText = computed(() => {
  if (selectedSizes.value.length === 0) return null

  const labels = selectedSizes.value
    .map(sizeId => getSizeLabel(sizeId))
    .sort()

  const prefix = selectedSizes.value.length === 1 ? 'Size' : 'Sizes'
  return `${prefix}: ${labels.join(', ')}`
})

const clearSizeFilter = () => {
  selectedSizes.value = []
}

// Helper functions for alignment filter chips
const getAlignmentFilterText = computed(() => {
  if (selectedAlignments.value.length === 0) return null

  const labels = selectedAlignments.value.sort()
  const prefix = selectedAlignments.value.length === 1 ? 'Alignment' : 'Alignments'
  return `${prefix}: ${labels.join(', ')}`
})

const clearAlignmentFilter = () => {
  selectedAlignments.value = []
}

// Helper functions for armor type filter chips
const getArmorTypeFilterText = computed(() => {
  if (selectedArmorTypes.value.length === 0) return null

  const labels = selectedArmorTypes.value.sort()
  const prefix = selectedArmorTypes.value.length === 1 ? 'Armor Type' : 'Armor Types'
  return `${prefix}: ${labels.join(', ')}`
})

const clearArmorTypeFilter = () => {
  selectedArmorTypes.value = []
}

// Helper functions for movement types filter chip
const getMovementTypesFilterText = computed(() => {
  if (selectedMovementTypes.value.length === 0) return null

  const labels = selectedMovementTypes.value
    .map(type => movementTypeOptions.find(o => o.value === type)?.label || type)
    .sort()

  return `Movement: ${labels.join(', ')}`
})

const clearMovementTypesFilter = () => {
  selectedMovementTypes.value = []
}

// Filter collapse state
const filtersOpen = ref(false)

// Active filter count for badge
const activeFilterCount = useFilterCount(
  selectedCRs,
  selectedType,
  isLegendary,
  selectedSizes,
  selectedAlignments,
  selectedMovementTypes,
  selectedACRange,
  selectedHPRange,
  selectedArmorTypes,
  hasLairActions,
  hasReactions,
  isSpellcaster,
  hasMagicResistance,
  selectedSources
)

const perPage = 24
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <UiListPageHeader
      title="Monsters"
      :total="totalResults"
      description="Browse D&D 5e monsters with stats, abilities, and lore"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
    />

    <!-- Filters -->
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
              placeholder="Search monsters..."
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

            <!-- Source filter in prominent position -->
            <UiFilterMultiSelect
              v-model="selectedSources"
              :options="sourceOptions"
              placeholder="All Sources"
              color="monster"
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
          <!-- Primary Filters: Dropdowns and multiselects -->
          <template #primary>
            <UiFilterMultiSelect
              v-model="selectedCRs"
              data-testid="cr-filter-multiselect"
              :options="crOptions"
              label="Challenge Rating"
              placeholder="All CRs"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterSelect
              v-model="selectedType"
              :options="typeOptions"
              label="Creature Type"
              placeholder="All Types"
              data-testid="type-filter"
            />

            <UiFilterMultiSelect
              v-model="selectedSizes"
              data-testid="size-filter-multiselect"
              :options="sizeOptions"
              label="Size"
              placeholder="All Sizes"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedAlignments"
              data-testid="alignment-filter-multiselect"
              :options="alignmentOptions"
              label="Alignment"
              placeholder="All Alignments"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterMultiSelect
              v-model="selectedMovementTypes"
              data-testid="movement-types-filter"
              :options="movementTypeOptions"
              label="Movement"
              placeholder="All Movement"
              color="monster"
              class="w-full sm:w-48"
            />
          </template>

          <!-- Quick Toggles: Boolean yes/no filters only -->
          <template #quick>
            <UiFilterToggle
              v-model="isLegendary"
              label="Legendary"
              color="error"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasLairActions"
              data-testid="has-lair-actions-toggle"
              label="Lair Actions"
              color="warning"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasReactions"
              data-testid="has-reactions-toggle"
              label="Reactions"
              color="secondary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="isSpellcaster"
              data-testid="is-spellcaster-toggle"
              label="Spellcaster"
              color="primary"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />

            <UiFilterToggle
              v-model="hasMagicResistance"
              data-testid="has-magic-resistance-toggle"
              label="Magic Resist"
              color="success"
              :options="[
                { value: null, label: 'All' },
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
              ]"
            />
          </template>

          <!-- Advanced Filters: Stat ranges -->
          <template #advanced>
            <UiFilterMultiSelect
              v-model="selectedArmorTypes"
              data-testid="armor-type-filter-multiselect"
              :options="armorTypeOptions"
              label="Armor Type"
              placeholder="All Armor"
              color="monster"
              class="w-full sm:w-48"
            />

            <UiFilterSelect
              v-model="selectedACRange"
              :options="acRangeOptions"
              label="AC Range"
              placeholder="All AC"
              data-testid="ac-filter"
            />

            <UiFilterSelect
              v-model="selectedHPRange"
              :options="hpRangeOptions"
              label="HP Range"
              placeholder="All HP"
              data-testid="hp-filter"
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
            {{ sources?.find(s => s.code === source)?.name || source }} ✕
          </UButton>

          <!-- 2. Entity-specific: CR, Type, Size, Alignment, Movement, AC, HP, Armor -->
          <UButton
            v-if="getCRFilterText"
            data-testid="cr-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="clearCRFilter"
          >
            {{ getCRFilterText }} ✕
          </UButton>
          <UButton
            v-if="selectedType !== null"
            data-testid="type-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="selectedType = null"
          >
            Type: {{ getTypeLabel(selectedType) }} ✕
          </UButton>
          <UButton
            v-if="getSizeFilterText"
            data-testid="size-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="clearSizeFilter"
          >
            {{ getSizeFilterText }} ✕
          </UButton>
          <UButton
            v-if="getAlignmentFilterText"
            data-testid="alignment-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="clearAlignmentFilter"
          >
            {{ getAlignmentFilterText }} ✕
          </UButton>
          <UButton
            v-if="getMovementTypesFilterText"
            data-testid="movement-types-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="clearMovementTypesFilter"
          >
            {{ getMovementTypesFilterText }} ✕
          </UButton>
          <UButton
            v-if="selectedACRange"
            data-testid="ac-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="selectedACRange = null"
          >
            AC: {{ acRangeOptions.find(o => o.value === selectedACRange)?.label }} ✕
          </UButton>
          <UButton
            v-if="selectedHPRange"
            data-testid="hp-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="selectedHPRange = null"
          >
            HP: {{ hpRangeOptions.find(o => o.value === selectedHPRange)?.label }} ✕
          </UButton>
          <UButton
            v-if="getArmorTypeFilterText"
            data-testid="armor-type-filter-chip"
            size="xs"
            color="monster"
            variant="soft"
            @click="clearArmorTypeFilter"
          >
            {{ getArmorTypeFilterText }} ✕
          </UButton>

          <!-- 3. Boolean toggles (primary color, "Label: Yes/No" format) -->
          <UButton
            v-if="isLegendary !== null"
            data-testid="is-legendary-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="isLegendary = null"
          >
            Legendary: {{ isLegendary === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="hasLairActions !== null"
            data-testid="has-lair-actions-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasLairActions = null"
          >
            Lair Actions: {{ hasLairActions === '1' ? 'Yes' : 'No' }} ✕
          </UButton>
          <UButton
            v-if="hasReactions !== null"
            data-testid="has-reactions-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasReactions = null"
          >
            Reactions: {{ hasReactions === '1' ? 'Yes' : 'No' }} ✕
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
          <UButton
            v-if="hasMagicResistance !== null"
            data-testid="has-magic-resistance-filter-chip"
            size="xs"
            color="primary"
            variant="soft"
            @click="hasMagicResistance = null"
          >
            Magic Resistance: {{ hasMagicResistance === '1' ? 'Yes' : 'No' }} ✕
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
      entity-name="Monsters"
      @retry="refresh"
    />

    <!-- Empty State -->
    <UiListEmptyState
      v-else-if="monsters.length === 0"
      entity-name="monsters"
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
        entity-name="monster"
      />

      <!-- Monsters Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MonsterCard
          v-for="monster in monsters"
          :key="monster.id"
          :monster="monster"
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

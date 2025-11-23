<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { EntityType, SearchResultData } from '~/types/search'
import type { BadgeColor } from '~/utils/badgeColors'

const route = useRoute()
const { search, results, loading, error } = useSearch()

const selectedTypes = ref<EntityType[]>([])

/**
 * Get count of results for a specific entity type
 */
const getCount = (type: EntityType): number => {
  return results.value?.data[type]?.length || 0
}

/**
 * Get total count across all types
 */
const totalCount = computed(() => {
  if (!results.value?.data) return 0
  return Object.values(results.value.data).reduce((sum, arr) => sum + (arr?.length || 0), 0)
})

/**
 * Filter options for entity types
 */
const filterOptions = computed(() => [
  { label: `All (${totalCount.value})`, value: 'all' },
  { label: `Spells (${getCount('spells')})`, value: 'spells', disabled: getCount('spells') === 0 },
  { label: `Items (${getCount('items')})`, value: 'items', disabled: getCount('items') === 0 },
  { label: `Races (${getCount('races')})`, value: 'races', disabled: getCount('races') === 0 },
  { label: `Classes (${getCount('classes')})`, value: 'classes', disabled: getCount('classes') === 0 },
  { label: `Backgrounds (${getCount('backgrounds')})`, value: 'backgrounds', disabled: getCount('backgrounds') === 0 },
  { label: `Feats (${getCount('feats')})`, value: 'feats', disabled: getCount('feats') === 0 },
  { label: `Monsters (${getCount('monsters')})`, value: 'monsters', disabled: getCount('monsters') === 0 }
])

/**
 * Filter results based on selected types
 */
const filteredResults = computed<SearchResultData>(() => {
  if (!results.value?.data) return {}
  if (selectedTypes.value.length === 0) return results.value.data

  const filtered: Partial<SearchResultData> = {}
  selectedTypes.value.forEach((type) => {
    const data = results.value?.data[type]
    if (data) {
      // Type assertion needed due to TypeScript's inability to narrow indexed access types
      filtered[type] = data as any
    }
  })
  return filtered as SearchResultData
})

/**
 * Get entity color for filter buttons
 * Maps plural entity names to their semantic entity colors
 */
const getFilterColor = (value: string): BadgeColor => {
  const entityColors: Record<string, BadgeColor> = {
    spells: 'spell',
    items: 'item',
    races: 'race',
    classes: 'class',
    backgrounds: 'background',
    feats: 'feat',
    monsters: 'monster'
  }
  return entityColors[value] || 'neutral'
}

/**
 * Perform search when query parameter changes
 */
watch(
  () => route.query.q,
  async (newQuery) => {
    if (typeof newQuery === 'string' && newQuery.trim()) {
      await search(newQuery)
    }
  },
  { immediate: true }
)

useHead({
  title: computed(() => `Search: ${route.query.q} - D&D 5e Compendium`)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Search Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Search Results
      </h1>

      <!-- Query display -->
      <div
        v-if="route.query.q"
        class="flex items-center gap-2"
      >
        <span class="text-gray-600 dark:text-gray-400">Searching for:</span>
        <UBadge
          size="lg"
          color="primary"
          variant="subtle"
        >
          {{ route.query.q }}
        </UBadge>
        <span
          v-if="!loading"
          class="text-gray-600 dark:text-gray-400"
        >
          ({{ totalCount }} {{ totalCount === 1 ? 'result' : 'results' }})
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-12"
    >
      <div class="flex flex-col items-center gap-4">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 animate-spin text-primary-500"
        />
        <p class="text-gray-600 dark:text-gray-400">
          Searching...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="py-12"
    >
      <UCard>
        <div class="text-center">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-12 h-12 mx-auto mb-4 text-red-500"
          />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Search Error
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ error }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!results || totalCount === 0"
      class="py-12"
    >
      <UCard>
        <div class="text-center">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="w-12 h-12 mx-auto mb-4 text-gray-400"
          />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Results Found
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Try searching for something else or check your spelling
          </p>
        </div>
      </UCard>
    </div>

    <!-- Results -->
    <div v-else>
      <!-- Entity Type Filters -->
      <div class="mb-6 flex flex-wrap gap-2">
        <UButton
          v-for="option in filterOptions"
          :key="option.value"
          :variant="selectedTypes.length === 0 && option.value === 'all' ? 'solid' : selectedTypes.includes(option.value as EntityType) ? 'solid' : 'soft'"
          :color="selectedTypes.length === 0 && option.value === 'all' ? 'primary' : selectedTypes.includes(option.value as EntityType) ? getFilterColor(option.value) : 'neutral'"
          :disabled="option.disabled"
          @click="() => {
            if (option.value === 'all') {
              selectedTypes = []
            }
            else {
              const type = option.value as EntityType
              const index = selectedTypes.indexOf(type)
              if (index > -1) {
                selectedTypes = selectedTypes.filter(t => t !== type)
              }
              else {
                selectedTypes = [...selectedTypes, type]
              }
            }
          }"
        >
          {{ option.label }}
        </UButton>
      </div>

      <!-- Results Grid -->
      <div class="space-y-8">
        <!-- Spells -->
        <div v-if="filteredResults.spells && filteredResults.spells.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Spells ({{ filteredResults.spells.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchResultCard
              v-for="spell in filteredResults.spells"
              :key="spell.id"
              :result="spell"
              type="spell"
            />
          </div>
        </div>

        <!-- Items -->
        <div v-if="filteredResults.items && filteredResults.items.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Items ({{ filteredResults.items.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchResultCard
              v-for="item in filteredResults.items"
              :key="item.id"
              :result="item"
              type="item"
            />
          </div>
        </div>

        <!-- Races -->
        <div v-if="filteredResults.races && filteredResults.races.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Races ({{ filteredResults.races.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchResultCard
              v-for="race in filteredResults.races"
              :key="race.id"
              :result="race"
              type="race"
            />
          </div>
        </div>

        <!-- Classes -->
        <div v-if="filteredResults.classes && filteredResults.classes.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Classes ({{ filteredResults.classes.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchResultCard
              v-for="charClass in filteredResults.classes"
              :key="charClass.id"
              :result="charClass"
              type="class"
            />
          </div>
        </div>

        <!-- Backgrounds -->
        <div v-if="filteredResults.backgrounds && filteredResults.backgrounds.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Backgrounds ({{ filteredResults.backgrounds.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchResultCard
              v-for="background in filteredResults.backgrounds"
              :key="background.id"
              :result="background"
              type="background"
            />
          </div>
        </div>

        <!-- Feats -->
        <div v-if="filteredResults.feats && filteredResults.feats.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Feats ({{ filteredResults.feats.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchResultCard
              v-for="feat in filteredResults.feats"
              :key="feat.id"
              :result="feat"
              type="feat"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

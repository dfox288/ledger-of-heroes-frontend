<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SearchResult } from '~/types/search'

const router = useRouter()
const { search, results, loading, clearResults } = useSearch()

const query = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(-1)

/**
 * Native debounce implementation (no @vueuse/core needed)
 * Waits 300ms after user stops typing before triggering search
 */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = (searchQuery: string) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(async () => {
    if (searchQuery.trim().length < 2) {
      clearResults()
      showDropdown.value = false
      selectedIndex.value = -1
      return
    }

    await search(searchQuery, { limit: 5 })
    showDropdown.value = true
    selectedIndex.value = -1
  }, 300)
}

// Watch for query changes and debounce search
watch(query, (newQuery) => {
  debouncedSearch(newQuery)
})

/**
 * Flatten all results into a single array for keyboard navigation
 */
const flatResults = computed(() => {
  if (!results.value?.data) return []

  const flattened: Array<{ type: string, slug: string, name: string, entityType: string }> = []

  if (results.value.data.spells) {
    results.value.data.spells.forEach((spell) => {
      flattened.push({ type: 'spells', slug: spell.slug, name: spell.name, entityType: 'Spell' })
    })
  }
  if (results.value.data.items) {
    results.value.data.items.forEach((item) => {
      flattened.push({ type: 'items', slug: item.slug, name: item.name, entityType: 'Item' })
    })
  }
  if (results.value.data.races) {
    results.value.data.races.forEach((race) => {
      flattened.push({ type: 'races', slug: race.slug, name: race.name, entityType: 'Race' })
    })
  }
  if (results.value.data.classes) {
    results.value.data.classes.forEach((charClass) => {
      flattened.push({ type: 'classes', slug: charClass.slug, name: charClass.name, entityType: 'Class' })
    })
  }
  if (results.value.data.backgrounds) {
    results.value.data.backgrounds.forEach((background) => {
      flattened.push({ type: 'backgrounds', slug: background.slug, name: background.name, entityType: 'Background' })
    })
  }
  if (results.value.data.feats) {
    results.value.data.feats.forEach((feat) => {
      flattened.push({ type: 'feats', slug: feat.slug, name: feat.name, entityType: 'Feat' })
    })
  }

  return flattened
})

/**
 * Handle keyboard navigation
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value || flatResults.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, flatResults.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < flatResults.value.length) {
        const selected = flatResults.value[selectedIndex.value]
        if (selected) {
          selectResult(selected.type, selected.slug)
        }
      } else {
        handleSubmit()
      }
      break
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      break
  }
}

/**
 * Handle Enter key - navigate to full results page
 */
const handleSubmit = () => {
  if (query.value.trim()) {
    showDropdown.value = false
    selectedIndex.value = -1
    router.push(`/search?q=${encodeURIComponent(query.value.trim())}`)
  }
}

/**
 * Handle clicking a result - navigate to detail page
 */
const selectResult = (entityType: string, slug: string) => {
  showDropdown.value = false
  selectedIndex.value = -1
  query.value = ''
  router.push(`/${entityType}/${slug}`)
}

/**
 * Close dropdown (with small delay for click events)
 */
const closeDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
    selectedIndex.value = -1
  }, 200)
}

/**
 * Get total number of results across all entity types
 */
const getTotalResults = (searchResults: SearchResult | null): number => {
  if (!searchResults?.data) return 0
  return Object.values(searchResults.data).reduce((total, items) => {
    return total + (items?.length || 0)
  }, 0)
}

/**
 * Check if a result is selected
 */
const isSelected = (index: number): boolean => {
  return selectedIndex.value === index
}

/**
 * Get global index for a specific result
 */
let globalIndex = 0
const getGlobalIndex = () => globalIndex++
const resetGlobalIndex = () => {
  globalIndex = 0
}
</script>

<template>
  <div class="relative w-full">
    <form @submit.prevent="handleSubmit">
      <UInput
        v-model="query"
        type="search"
        placeholder="Search spells, items, races..."
        icon="i-heroicons-magnifying-glass"
        size="xl"
        :loading="loading"
        autocomplete="off"
        variant="outline"
        :ui="{
          base: 'text-lg px-4 py-3'
        }"
        @blur="closeDropdown"
        @keydown="handleKeydown"
      />
    </form>

    <!-- Dropdown with instant results -->
    <UCard
      v-if="showDropdown && results && getTotalResults(results) > 0"
      class="absolute z-50 mt-2 w-full max-h-96 overflow-y-auto"
      @mousedown.prevent
    >
      <div>
        {{ resetGlobalIndex() }}
        <!-- Spells -->
        <div
          v-if="results.data.spells && results.data.spells.length > 0"
          class="mb-3"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Spells
          </div>
          <button
            v-for="spell in results.data.spells"
            :key="spell.id"
            type="button"
            :class="[
              'w-full text-left px-3 py-2 rounded transition-colors',
              isSelected(getGlobalIndex())
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="selectResult('spells', spell.slug)"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ spell.name }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Level {{ spell.level }} • {{ spell.casting_time }}
            </div>
          </button>
        </div>

        <!-- Items -->
        <div
          v-if="results.data.items && results.data.items.length > 0"
          class="mb-3"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Items
          </div>
          <button
            v-for="item in results.data.items"
            :key="item.id"
            type="button"
            :class="[
              'w-full text-left px-3 py-2 rounded transition-colors',
              isSelected(getGlobalIndex())
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="selectResult('items', item.slug)"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ item.name }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ item.rarity }}{{ item.is_magic ? ' • Magic' : '' }}
            </div>
          </button>
        </div>

        <!-- Races -->
        <div
          v-if="results.data.races && results.data.races.length > 0"
          class="mb-3"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Races
          </div>
          <button
            v-for="race in results.data.races"
            :key="race.id"
            type="button"
            :class="[
              'w-full text-left px-3 py-2 rounded transition-colors',
              isSelected(getGlobalIndex())
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="selectResult('races', race.slug)"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ race.name }}
            </div>
          </button>
        </div>

        <!-- Classes -->
        <div
          v-if="results.data.classes && results.data.classes.length > 0"
          class="mb-3"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Classes
          </div>
          <button
            v-for="charClass in results.data.classes"
            :key="charClass.id"
            type="button"
            :class="[
              'w-full text-left px-3 py-2 rounded transition-colors',
              isSelected(getGlobalIndex())
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="selectResult('classes', charClass.slug)"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ charClass.name }}
            </div>
          </button>
        </div>

        <!-- Backgrounds -->
        <div
          v-if="results.data.backgrounds && results.data.backgrounds.length > 0"
          class="mb-3"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Backgrounds
          </div>
          <button
            v-for="background in results.data.backgrounds"
            :key="background.id"
            type="button"
            :class="[
              'w-full text-left px-3 py-2 rounded transition-colors',
              isSelected(getGlobalIndex())
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="selectResult('backgrounds', background.slug)"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ background.name }}
            </div>
          </button>
        </div>

        <!-- Feats -->
        <div
          v-if="results.data.feats && results.data.feats.length > 0"
          class="mb-3"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Feats
          </div>
          <button
            v-for="feat in results.data.feats"
            :key="feat.id"
            type="button"
            :class="[
              'w-full text-left px-3 py-2 rounded transition-colors',
              isSelected(getGlobalIndex())
                ? 'bg-primary-100 dark:bg-primary-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="selectResult('feats', feat.slug)"
          >
            <div class="font-medium text-gray-900 dark:text-gray-100">
              {{ feat.name }}
            </div>
          </button>
        </div>

        <!-- View all results footer -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <button
            type="button"
            class="w-full text-center px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            @click="handleSubmit"
          >
            View all results for "{{ query }}"
          </button>
        </div>
      </div>
    </UCard>

    <!-- No results message -->
    <UCard
      v-if="showDropdown && results && getTotalResults(results) === 0"
      class="absolute z-50 mt-2 w-full shadow-xl"
    >
      <div class="text-center text-gray-500 dark:text-gray-400">
        No results found for "{{ query }}"
      </div>
    </UCard>
  </div>
</template>

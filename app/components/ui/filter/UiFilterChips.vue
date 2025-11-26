<script setup lang="ts">
/**
 * Reusable filter chips container for entity list pages.
 *
 * Provides the consistent layout and styling for active filter chips,
 * including the "Active filters:" label, search chip, and clear button.
 *
 * Entity-specific chips are passed via the default slot.
 *
 * Chip order (enforced by slot naming):
 * 1. Source chips (via #sources slot)
 * 2. Entity-specific chips (via default slot)
 * 3. Boolean toggle chips (via #toggles slot)
 * 4. Search chip (auto-rendered if searchQuery provided)
 *
 * @example
 * ```vue
 * <UiFilterChips
 *   :visible="hasActiveFilters"
 *   :search-query="searchQuery"
 *   :active-count="activeFilterCount"
 *   @clear-search="searchQuery = ''"
 *   @clear-all="clearFilters"
 * >
 *   <template #sources>
 *     <UiFilterChip
 *       v-for="source in selectedSources"
 *       :key="source"
 *       color="neutral"
 *       @remove="selectedSources = selectedSources.filter(s => s !== source)"
 *     >
 *       {{ getSourceName(source) }}
 *     </UiFilterChip>
 *   </template>
 *
 *   <!-- Entity-specific chips in default slot -->
 *   <UiFilterChip color="spell" @remove="selectedSchool = null">
 *     School: {{ schoolName }}
 *   </UiFilterChip>
 *
 *   <template #toggles>
 *     <UiFilterChip v-if="concentrationFilter !== null" color="primary" @remove="concentrationFilter = null">
 *       Concentration: {{ concentrationFilter === '1' ? 'Yes' : 'No' }}
 *     </UiFilterChip>
 *   </template>
 * </UiFilterChips>
 * ```
 */

interface Props {
  /** Whether to show the chips container */
  visible: boolean
  /** Current search query (for search chip) */
  searchQuery?: string
  /** Number of active filters (for clear button visibility) */
  activeCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  activeCount: 0
})

const emit = defineEmits<{
  'clear-search': []
  'clear-all': []
}>()

// Show clear button if there are active filters or search query
const showClearButton = computed(() => props.activeCount > 0 || props.searchQuery)
</script>

<template>
  <div
    v-if="visible"
    class="flex flex-wrap items-center justify-between gap-2 pt-2"
    data-testid="active-filters-row"
  >
    <div class="flex flex-wrap items-center gap-2">
      <!-- Label -->
      <span
        v-if="activeCount > 0 || searchQuery"
        class="text-sm font-medium text-gray-600 dark:text-gray-400"
        data-testid="active-filters-label"
      >
        Active filters:
      </span>

      <!-- 1. Source chips slot -->
      <slot name="sources" />

      <!-- 2. Entity-specific chips (default slot) -->
      <slot />

      <!-- 3. Boolean toggle chips slot -->
      <slot name="toggles" />

      <!-- 4. Search chip (always last before clear button) -->
      <UButton
        v-if="searchQuery"
        data-testid="search-query-chip"
        size="xs"
        color="neutral"
        variant="soft"
        @click="emit('clear-search')"
      >
        "{{ searchQuery }}" ✕
      </UButton>
    </div>

    <!-- Clear Filters Button (right-aligned) -->
    <UButton
      v-if="showClearButton"
      data-testid="clear-filters-button"
      color="neutral"
      variant="soft"
      size="sm"
      @click="emit('clear-all')"
    >
      Clear filters
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { PaginationMeta } from '~/composables/useEntityList'

/**
 * Wrapper component for list page states (loading, error, empty, results).
 *
 * Handles the conditional rendering logic that's identical across all entity pages.
 *
 * @example
 * ```vue
 * <UiListStates
 *   :loading="loading"
 *   :error="error"
 *   :empty="items.length === 0"
 *   :meta="meta"
 *   :total="totalResults"
 *   entity-name="spell"
 *   :has-filters="hasActiveFilters"
 *   :current-page="currentPage"
 *   :per-page="perPage"
 *   @retry="refresh"
 *   @clear-filters="clearFilters"
 *   @update:current-page="currentPage = $event"
 * >
 *   <template #grid>
 *     <SpellCard v-for="spell in spells" :key="spell.id" :spell="spell" />
 *   </template>
 * </UiListStates>
 * ```
 */

interface Props {
  /** Loading state */
  loading: boolean
  /** Error object (if any) */
  error: unknown
  /** Whether the data array is empty */
  empty: boolean
  /** Pagination metadata */
  meta: PaginationMeta | null
  /** Total results count */
  total: number
  /** Entity name for display (singular, e.g., "spell", "item") */
  entityName: string
  /** Entity name for error/empty states (capitalized plural, e.g., "Spells") */
  entityNamePlural?: string
  /** Whether filters are active (for empty state messaging) */
  hasFilters: boolean
  /** Current page number (v-model:current-page) */
  currentPage: number
  /** Items per page */
  perPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 24,
  entityNamePlural: ''
})

const emit = defineEmits<{
  'retry': []
  'clear-filters': []
  'update:current-page': [value: number]
}>()

// Compute plural name if not provided
const pluralName = computed(() => {
  if (props.entityNamePlural) return props.entityNamePlural
  // Simple pluralization: capitalize first letter and add 's'
  return props.entityName.charAt(0).toUpperCase() + props.entityName.slice(1) + 's'
})

// Local ref for pagination v-model
const pageModel = computed({
  get: () => props.currentPage,
  set: (value: number) => emit('update:current-page', value)
})
</script>

<template>
  <!-- Loading State -->
  <UiListSkeletonCards v-if="loading" />

  <!-- Error State -->
  <UiListErrorState
    v-else-if="error"
    :error="error"
    :entity-name="pluralName"
    @retry="emit('retry')"
  />

  <!-- Empty State -->
  <template v-else-if="empty">
    <slot name="empty">
      <UiListEmptyState
        :entity-name="entityName"
        :has-filters="hasFilters"
        @clear-filters="emit('clear-filters')"
      />
    </slot>
  </template>

  <!-- Results -->
  <div v-else>
    <!-- Results count -->
    <UiListResultsCount
      :from="meta?.from || 0"
      :to="meta?.to || 0"
      :total="total"
      :entity-name="entityName"
    />

    <!-- Grid slot for entity cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <slot name="grid" />
    </div>

    <!-- Pagination -->
    <UiListPagination
      v-model="pageModel"
      :total="total"
      :items-per-page="perPage"
    />
  </div>
</template>

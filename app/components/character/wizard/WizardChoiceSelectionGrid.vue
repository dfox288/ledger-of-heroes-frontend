<!-- app/components/character/wizard/choice/ChoiceSelectionGrid.vue -->
<script setup lang="ts">
/**
 * ChoiceSelectionGrid - Grid layout for choice selection with header and count
 *
 * Used in wizard steps to display a selection grid with:
 * - Label describing the choice
 * - Selection count badge (X/Y selected)
 * - Responsive grid layout for options
 */

interface Props {
  /** Label for the choice (e.g., "Choose 2 languages") */
  label: string
  /** Total quantity to select */
  quantity: number
  /** Current selection count */
  selectedCount: number
  /** Whether options are currently loading */
  loading?: boolean
  /** Custom grid column classes (default: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4") */
  gridCols?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
})

const isComplete = computed(() => props.selectedCount >= props.quantity)

const badgeColor = computed(() => isComplete.value ? 'success' : 'neutral')

const gridClasses = computed(() => {
  return ['grid', 'gap-3', ...props.gridCols.split(' ')]
})
</script>

<template>
  <div
    data-testid="choice-selection-grid"
    class="mb-6"
  >
    <!-- Header with label and count badge -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium">
        {{ label }}:
      </span>
      <UBadge
        :color="badgeColor"
        size="md"
        data-testid="choice-count-badge"
      >
        {{ selectedCount }}/{{ quantity }} selected
      </UBadge>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      data-testid="choice-grid-loading"
      class="flex items-center gap-2 p-4 text-gray-500"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-5 h-5 animate-spin"
      />
      <span>Loading options...</span>
    </div>

    <!-- Options grid -->
    <div
      v-else
      data-testid="choice-grid"
      :class="gridClasses"
    >
      <slot />
    </div>
  </div>
</template>

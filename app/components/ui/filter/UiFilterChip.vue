<script setup lang="ts">
/**
 * Individual filter chip component.
 *
 * A thin wrapper around UButton that provides consistent styling
 * for filter chips with a remove action.
 *
 * @example
 * ```vue
 * <UiFilterChip color="spell" @remove="selectedSchool = null">
 *   School: Evocation
 * </UiFilterChip>
 *
 * <UiFilterChip
 *   v-for="source in selectedSources"
 *   :key="source"
 *   color="neutral"
 *   @remove="removeSource(source)"
 * >
 *   {{ getSourceName(source) }}
 * </UiFilterChip>
 * ```
 */

type ChipColor =
  | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
  | 'spell' | 'item' | 'race' | 'class' | 'background' | 'feat' | 'monster'
  | 'ability' | 'condition' | 'damage' | 'itemtype' | 'language'
  | 'proficiency' | 'size' | 'skill' | 'school' | 'source'

interface Props {
  /** Chip color (entity semantic color or 'neutral', 'primary') */
  color?: ChipColor
  /** Test ID for e2e testing */
  testId?: string
}

withDefaults(defineProps<Props>(), {
  color: 'primary'
})

defineEmits<{
  remove: []
}>()
</script>

<template>
  <UButton
    :data-testid="testId"
    size="xs"
    :color="color"
    variant="soft"
    @click="$emit('remove')"
  >
    <slot /> ✕
  </UButton>
</template>

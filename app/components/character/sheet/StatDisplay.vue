<!-- app/components/character/sheet/StatDisplay.vue -->
<script setup lang="ts">
/**
 * Generic Stat Display Component
 *
 * Reusable stat card for simple numeric stats with label.
 * Uses formatModifier by default, supports custom format functions.
 */
import { formatModifier } from '~/utils/formatModifier'

const props = defineProps<{
  label: string
  value: number | null
  formatFn?: (val: number) => string
}>()

const formattedValue = computed(() => {
  if (props.value === null) return '—'
  if (props.formatFn) return props.formatFn(props.value)
  return formatModifier(props.value)
})
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
      {{ label }}
    </div>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ formattedValue }}
    </div>
  </div>
</template>

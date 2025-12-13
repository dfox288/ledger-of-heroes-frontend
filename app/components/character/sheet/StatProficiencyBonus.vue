<!-- app/components/character/sheet/StatProficiencyBonus.vue -->
<script setup lang="ts">
/**
 * Proficiency Bonus Stat Display
 *
 * Simple stat card showing the character's proficiency bonus.
 * Reusable across character sheet and other contexts.
 */

defineProps<{
  bonus: number | null
}>()

function formatModifier(value: number | null): string {
  if (value === null) return '—'
  return value >= 0 ? `+${value}` : `${value}`
}
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
      Prof Bonus
    </div>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ formatModifier(bonus) }}
    </div>
  </div>
</template>

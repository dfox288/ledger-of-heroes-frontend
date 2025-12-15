<!-- app/components/character/sheet/Senses.vue -->
<script setup lang="ts">
/**
 * Senses Display
 *
 * Shows character senses like Darkvision, Blindsight, Tremorsense.
 * Designed for the sidebar (~200px width), placed after Passive Scores.
 *
 * @see Issue #648
 */
import type { CharacterSense } from '~/types/character'

const props = defineProps<{
  senses?: CharacterSense[]
}>()

/**
 * Formats a sense into display text
 * Example: "Darkvision 60 ft." or "Blindsight 30 ft. (limited)"
 */
function formatSense(sense: CharacterSense): string {
  let text = `${sense.name} ${sense.range} ft.`
  if (sense.is_limited) {
    text += ' (limited)'
  }
  return text
}

// Only render if there are senses
const hasSenses = computed(() => props.senses && props.senses.length > 0)
</script>

<template>
  <div
    v-if="hasSenses"
    class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
  >
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Senses
    </h3>
    <div class="space-y-2">
      <div
        v-for="(sense, index) in senses"
        :key="index"
        class="flex items-start gap-2"
      >
        <UIcon
          name="i-heroicons-eye"
          class="size-5 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <span class="text-sm text-gray-900 dark:text-gray-100">
            {{ formatSense(sense) }}
          </span>
          <span
            v-if="sense.notes"
            class="text-xs text-gray-600 dark:text-gray-400 ml-1"
          >
            ({{ sense.notes }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

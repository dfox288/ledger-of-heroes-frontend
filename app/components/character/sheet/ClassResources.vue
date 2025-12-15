<!-- app/components/character/sheet/ClassResources.vue -->
<script setup lang="ts">
/**
 * Class Resources Display Component
 *
 * Displays class-specific resource counters (Rage, Ki, Bardic Inspiration, etc.)
 * Renders nothing if counters array is empty.
 *
 * @see Issue #632
 */
import type { Counter } from '~/types/character'

defineProps<{
  counters: Counter[]
  editable?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  spend: [slug: string]
  restore: [slug: string]
}>()
</script>

<template>
  <div
    v-if="counters.length > 0"
    class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
  >
    <div class="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
      Class Resources
    </div>

    <div class="space-y-3">
      <CharacterSheetClassResourceCounter
        v-for="counter in counters"
        :key="counter.slug"
        :counter="counter"
        :editable="editable"
        :disabled="disabled"
        @spend="slug => emit('spend', slug)"
        @restore="slug => emit('restore', slug)"
      />
    </div>
  </div>
</template>

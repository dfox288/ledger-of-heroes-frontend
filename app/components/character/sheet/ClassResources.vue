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
  spend: [id: number]
  restore: [id: number]
}>()
</script>

<template>
  <div
    v-if="counters.length > 0"
    data-testid="class-resources-manager"
    class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
  >
    <div class="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
      Class Resources
    </div>

    <div class="space-y-3">
      <CharacterSheetClassResourceCounter
        v-for="counter in counters"
        :key="counter.id"
        :counter="counter"
        :editable="editable"
        :disabled="disabled"
        @spend="id => emit('spend', id)"
        @restore="id => emit('restore', id)"
      />
    </div>
  </div>
</template>

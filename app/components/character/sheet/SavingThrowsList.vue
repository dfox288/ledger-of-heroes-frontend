<!-- app/components/character/sheet/SavingThrowsList.vue -->
<script setup lang="ts">
import type { CharacterSavingThrow } from '~/types/character'

defineProps<{
  savingThrows: CharacterSavingThrow[]
}>()

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Saving Throws
    </h3>
    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="save in savingThrows"
        :key="save.ability"
        class="flex items-center gap-2"
      >
        <!-- Proficiency indicator -->
        <div
          role="img"
          :aria-label="save.proficient ? 'Proficient' : 'Not proficient'"
          class="w-3 h-3 rounded-full border-2"
          :class="save.proficient
            ? 'bg-success-500 border-success-500'
            : 'border-gray-400 dark:border-gray-500'"
          :data-testid="save.proficient ? 'proficient' : 'not-proficient'"
        />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
          {{ save.ability }}
        </span>
        <span class="text-sm font-bold text-gray-900 dark:text-white">
          {{ formatModifier(save.modifier) }}
        </span>
      </div>
    </div>
  </div>
</template>

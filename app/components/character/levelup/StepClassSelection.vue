<!-- app/components/character/levelup/StepClassSelection.vue -->
<script setup lang="ts">
/**
 * Level-Up: Class Selection Step
 *
 * Shown for multiclass characters to select which class to level.
 * TODO: Implement full multiclass support
 */
const props = defineProps<{
  characterId?: number
  publicId?: string
  nextStep?: () => Promise<void>
}>()
</script>

<template>
  <div class="max-w-2xl mx-auto text-center py-12">
    <UIcon
      name="i-heroicons-shield-check"
      class="w-16 h-16 mx-auto text-gray-400 mb-4"
    />
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      Class Selection
    </h2>
    <p class="text-gray-500 mb-6">
      Multiclass support coming soon.
    </p>
  </div>
</template>

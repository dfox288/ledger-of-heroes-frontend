<!-- app/components/character/wizard/review/ReviewCharacterIdentity.vue -->
<script setup lang="ts">
/**
 * Character identity header - displays name and race/class/background
 */

defineProps<{
  characterName: string
  race: string
  characterClass: string
  background: string
}>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ characterName }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ race }} · {{ characterClass }} · {{ background }}
      </p>
    </div>
    <UButton
      variant="ghost"
      label="Edit Details"
      icon="i-heroicons-pencil-square"
    />
  </div>
</template>

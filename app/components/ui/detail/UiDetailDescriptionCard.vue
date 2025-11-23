<script setup lang="ts">
/**
 * UiDetailDescriptionCard
 *
 * Displays entity description in a card without an accompanying image.
 * Used when image is displayed separately (e.g., in side-by-side layout).
 */

interface Props {
  description?: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  title: 'Description'
})
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ title }}
      </h2>
    </template>

    <div class="prose dark:prose-invert max-w-none">
      <p
        v-if="description"
        class="whitespace-pre-line text-base text-gray-700 dark:text-gray-300 leading-relaxed"
      >
        {{ description }}
      </p>
      <p
        v-else
        class="text-gray-500 dark:text-gray-400 italic"
      >
        No description available.
      </p>
    </div>
  </UCard>
</template>

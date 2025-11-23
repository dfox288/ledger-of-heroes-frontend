<script setup lang="ts">
/**
 * UiDetailStandaloneImage
 *
 * Displays entity images wrapped in a card on detail pages.
 * Used in side-by-side layouts where Quick Stats take 2/3 and image takes 1/3.
 * Only renders when imagePath is provided.
 *
 * @example
 * <UiDetailStandaloneImage
 *   image-path="/images/classes/fighter-512.jpg"
 *   image-alt="Fighter class illustration"
 * />
 */

interface Props {
  imagePath: string | null | undefined
  imageAlt: string
}

const props = defineProps<Props>()
</script>

<template>
  <UCard v-if="imagePath">
    <NuxtImg
      :src="imagePath"
      :alt="imageAlt"
      class="w-full h-auto rounded-lg shadow-md"
      loading="lazy"
    />
  </UCard>
</template>

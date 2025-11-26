<script setup lang="ts">
/**
 * UiClassParentImageOverlay
 *
 * Displays a small parent class image thumbnail as an overlay.
 * Used on subclass detail pages to show class heritage.
 */

interface Props {
  parentSlug: string
  parentName: string
}

defineProps<Props>()

const { getImagePath } = useEntityImage()
</script>

<template>
  <NuxtLink
    :to="`/classes/${parentSlug}`"
    class="block group"
    :title="`View ${parentName} base class`"
  >
    <div class="flex flex-col items-center gap-1">
      <div class="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-class-300 dark:border-class-600 shadow-md transition-all group-hover:border-class-500 group-hover:shadow-lg group-hover:scale-105">
        <NuxtImg
          :src="getImagePath('classes', parentSlug, 128)"
          :alt="`${parentName} class illustration`"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div class="text-center">
        <div class="text-xs font-medium text-gray-600 dark:text-gray-400">
          Base Class
        </div>
        <div class="text-sm font-semibold text-class-600 dark:text-class-400 group-hover:underline">
          {{ parentName }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

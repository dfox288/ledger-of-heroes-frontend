<!-- app/components/ui/detail/UiDetailDescriptionWithImage.vue -->
<script setup lang="ts">
/**
 * @deprecated This component is deprecated as of 2025-11-23.
 * Use side-by-side layout with UiDetailEntityImage instead.
 *
 * New pattern:
 * - Wrap first container (Quick Stats/Traits) + UiDetailEntityImage in flex layout
 * - First container: lg:w-2/3
 * - UiDetailEntityImage: lg:w-1/3
 * - Description: Separate UCard below
 *
 * This component will be removed in a future version.
 */
interface Props {
  description?: string
  imagePath?: string | null
  imageAlt?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  imagePath: null,
  imageAlt: '',
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

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Content: 2/3 width when image present, full width otherwise -->
      <div :class="imagePath ? 'lg:w-2/3' : 'w-full'">
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
      </div>

      <!-- Image: 1/3 width on large screens, stacks below on mobile -->
      <div
        v-if="imagePath"
        class="lg:w-1/3 flex-shrink-0"
      >
        <NuxtImg
          :src="imagePath"
          :alt="imageAlt"
          class="w-full h-auto rounded-lg shadow-lg object-cover"
          loading="lazy"
          width="512"
          height="512"
        />
      </div>
    </div>
  </UCard>
</template>

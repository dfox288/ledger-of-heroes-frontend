<script setup lang="ts">
/**
 * Background Feature Card Component
 *
 * Displays the signature background feature (e.g., "Shelter of the Faithful").
 *
 * Updated to use pre-extracted feature_name/feature_description fields
 * from the API instead of trait objects (Issue #67).
 */

interface Feature {
  name: string
  description: string
}

interface Props {
  feature: Feature | null | undefined
}

defineProps<Props>()
</script>

<template>
  <UCard
    v-if="feature"
    class="border-2 border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50 to-white dark:from-primary-950 dark:to-gray-900"
  >
    <div class="space-y-4">
      <!-- Label with star icon -->
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-star"
          class="w-5 h-5 text-primary-600 dark:text-primary-400"
        />
        <span class="text-xs font-bold tracking-wider text-primary-700 dark:text-primary-300">
          FEATURE
        </span>
      </div>

      <!-- Feature name -->
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ feature.name }}
      </h2>

      <!-- Feature description -->
      <div
        v-if="feature.description"
        class="prose prose-sm dark:prose-invert max-w-none"
      >
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
          {{ feature.description }}
        </p>
      </div>
    </div>
  </UCard>
</template>

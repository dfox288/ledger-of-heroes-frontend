<script setup lang="ts">
interface Props {
  higherLevels: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-3">
      <span
        class="text-lg"
        aria-hidden="true"
      >📈</span>
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        AT HIGHER LEVELS
      </h3>
    </div>

    <!-- Higher levels text -->
    <div class="text-sm text-gray-900 dark:text-gray-100">
      {{ higherLevels }}
    </div>
  </div>
</template>

<!-- app/components/character/sheet/DeathSaves.vue -->
<script setup lang="ts">
/**
 * Death Saves Visual Tracker
 *
 * Displays death save successes and failures as filled/empty circles.
 * Compact design fits in the sidebar (~200px width).
 */

defineProps<{
  successes: number // 0-3
  failures: number // 0-3
}>()
</script>

<template>
  <div class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <!-- Title -->
    <div class="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
      Death Saves
    </div>

    <!-- Successes Row -->
    <div class="space-y-1">
      <div class="text-xs text-gray-600 dark:text-gray-400">
        Successes
      </div>
      <div class="flex gap-2">
        <!-- 3 circles for successes -->
        <UIcon
          v-for="i in 3"
          :key="`success-${i}`"
          :name="i <= successes ? 'i-heroicons-check-circle-solid' : 'i-heroicons-check-circle'"
          :class="i <= successes ? 'text-green-600 dark:text-green-500' : 'text-gray-300 dark:text-gray-600'"
          class="w-6 h-6"
          :data-testid="i <= successes ? `success-filled-${i}` : `success-empty-${i}`"
        />
      </div>
    </div>

    <!-- Failures Row -->
    <div class="space-y-1">
      <div class="text-xs text-gray-600 dark:text-gray-400">
        Failures
      </div>
      <div class="flex gap-2">
        <!-- 3 circles for failures -->
        <UIcon
          v-for="i in 3"
          :key="`failure-${i}`"
          :name="i <= failures ? 'i-heroicons-x-circle-solid' : 'i-heroicons-x-circle'"
          :class="i <= failures ? 'text-red-600 dark:text-red-500' : 'text-gray-300 dark:text-gray-600'"
          class="w-6 h-6"
          :data-testid="i <= failures ? `failure-filled-${i}` : `failure-empty-${i}`"
        />
      </div>
    </div>
  </div>
</template>

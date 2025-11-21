<script setup lang="ts">
interface Props {
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 6
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <UCard v-for="i in count" :key="i" class="animate-pulse">
      <div class="space-y-3">
        <div class="flex gap-2">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </UCard>
  </div>
</template>

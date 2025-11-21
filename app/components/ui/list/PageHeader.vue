<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  total?: number
  description?: string
  loading?: boolean
  hasActiveFilters?: boolean
}

const props = defineProps<Props>()

// Show count only when total is provided and not loading
const showCount = computed(() => props.total !== undefined && !props.loading)

// Determine "filtered" vs "total" label
const countLabel = computed(() => props.hasActiveFilters ? 'filtered' : 'total')
</script>

<template>
  <div class="mb-8">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      {{ title }}
      <span v-if="showCount" class="text-2xl text-gray-500 dark:text-gray-400 font-normal">
        ({{ total }} {{ countLabel }})
      </span>
    </h1>
    <p v-if="description" class="text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  from: number
  to: number
  total: number
  entityName?: string
}

const props = defineProps<Props>()

// Pluralize entity name or use default "results"
const displayName = computed(() => {
  if (!props.entityName) return 'results'

  // Simple pluralization: add 's' if not already plural
  if (props.entityName.endsWith('s')) return props.entityName
  return `${props.entityName}s`
})
</script>

<template>
  <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
    Showing {{ from }}-{{ to }} of {{ total }} {{ displayName }}
  </div>
</template>

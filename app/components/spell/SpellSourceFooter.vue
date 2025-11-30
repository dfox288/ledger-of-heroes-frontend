<script setup lang="ts">
import type { EntitySource } from '~/types'

interface Props {
  sources: EntitySource[]
}

const props = defineProps<Props>()

/**
 * Format a single source reference
 * Format: "CODE p.pages" or just "CODE" if no pages
 */
const formatSource = (source: EntitySource): string => {
  if (source.pages) {
    return `${source.code} p.${source.pages}`
  }
  return source.code
}

/**
 * Format all sources as comma-separated list
 */
const formattedSources = computed(() => {
  return props.sources.map(formatSource).join(', ')
})
</script>

<template>
  <div class="text-sm text-gray-600 dark:text-gray-400">
    <span class="font-medium">Source:</span>
    {{ formattedSources }}
  </div>
</template>

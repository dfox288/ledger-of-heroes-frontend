<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  entityName?: string
  message?: string
  hasFilters?: boolean
}

interface Emits {
  (e: 'clearFilters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const heading = computed(() => {
  if (props.message) {
    return props.message
  }

  if (props.entityName && props.entityName.trim() !== '') {
    return `No ${props.entityName} found`
  }

  return 'No results found'
})

const handleClearFilters = () => {
  emit('clearFilters')
}
</script>

<template>
  <div data-testid="empty-state-container" class="py-12">
    <UCard>
      <div data-testid="empty-state-inner" class="text-center py-8">
        <UIcon
          data-testid="empty-state-icon"
          name="i-heroicons-magnifying-glass"
          class="w-16 h-16 mx-auto mb-4 text-gray-400"
        />
        <h2
          data-testid="empty-state-heading"
          class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
        >
          {{ heading }}
        </h2>
        <p
          data-testid="empty-state-subtitle"
          class="text-gray-600 dark:text-gray-400 mb-6"
        >
          Try adjusting your filters or searching for different keywords
        </p>
        <UButton
          v-if="hasFilters"
          data-testid="clear-filters-button"
          color="primary"
          @click="handleClearFilters"
        >
          Clear All Filters
        </UButton>
      </div>
    </UCard>
  </div>
</template>

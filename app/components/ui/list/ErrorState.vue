<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  error: Error | string
  entityName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const errorMessage = computed(() => {
  return typeof props.error === 'string' ? props.error : props.error.message
})

const heading = computed(() => {
  return props.entityName ? `Error Loading ${props.entityName}` : 'Error Loading Data'
})

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div data-testid="error-container" class="py-12">
    <UCard>
      <div data-testid="error-content" class="text-center">
        <UIcon
          data-testid="error-icon"
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 mx-auto mb-4 text-red-500"
        />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ heading }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">{{ errorMessage }}</p>
        <UButton color="primary" class="mt-4" @click="handleRetry">
          Try Again
        </UButton>
      </div>
    </UCard>
  </div>
</template>

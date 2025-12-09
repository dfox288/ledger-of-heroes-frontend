<!-- app/components/character/sheet/ValidationWarning.vue -->
<script setup lang="ts">
import type { ValidationResult } from '~/composables/useCharacterValidation'

const props = defineProps<{
  validationResult: ValidationResult | null
}>()

/**
 * Get the dangling reference items array
 */
const danglingItems = computed(() => {
  return props.validationResult?.dangling_references.items ?? []
})

/**
 * Only show warning when there are actual dangling references
 */
const showWarning = computed(() => {
  return props.validationResult && !props.validationResult.valid && danglingItems.value.length > 0
})

/**
 * Number of dangling references for display
 */
const danglingCount = computed(() => {
  return danglingItems.value.length
})
</script>

<template>
  <UAlert
    v-if="showWarning"
    data-testid="validation-warning"
    color="warning"
    icon="i-heroicons-exclamation-triangle"
    :title="`Character has ${danglingCount} invalid references`"
  >
    <template #description>
      <p class="mb-2">
        Some sourcebook content this character uses is no longer available:
      </p>
      <ul class="list-disc list-inside space-y-1">
        <li
          v-for="item in danglingItems"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </template>
  </UAlert>
</template>

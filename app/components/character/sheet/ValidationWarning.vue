<!-- app/components/character/sheet/ValidationWarning.vue -->
<script setup lang="ts">
import type { ValidationResult } from '~/composables/useCharacterValidation'

const props = defineProps<{
  validationResult: ValidationResult | null
}>()

/**
 * Only show warning when there are dangling references
 */
const showWarning = computed(() => {
  return props.validationResult && !props.validationResult.valid
})

/**
 * Number of dangling references for display
 */
const danglingCount = computed(() => {
  return props.validationResult?.dangling_references.length ?? 0
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
          v-for="ref in validationResult!.dangling_references"
          :key="ref.slug"
        >
          {{ ref.message }}
        </li>
      </ul>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Multi-select filter component for selecting multiple values from a list
 *
 * @example
 * ```vue
 * <UiFilterMultiSelect
 *   v-model="selectedTypes"
 *   label="Damage Types"
 *   :options="[
 *     { value: 'fire', label: 'Fire' },
 *     { value: 'cold', label: 'Cold' }
 *   ]"
 *   color="warning"
 *   placeholder="Select damage types..."
 * />
 * ```
 */

interface Option {
  value: string
  label: string
}

interface Props {
  /** Array of selected values */
  modelValue: string[] | null | undefined
  /** Filter label */
  label: string
  /** Available options */
  options: Option[]
  /** Entity semantic color (default: 'primary') */
  color?: string
  /** Placeholder text when nothing selected (default: 'Select...') */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  placeholder: 'Select...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// Normalize model value (handle null/undefined)
const normalizedValue = computed<string[]>(() => {
  if (!props.modelValue) return []
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

// Button text showing selection count or placeholder (calculated for potential future use)
const _buttonText = computed(() => {
  const count = normalizedValue.value.length
  if (count === 0) return props.placeholder
  return `${count} selected`
})

// Show clear button when items are selected
const showClearButton = computed(() => normalizedValue.value.length > 0)

// Handle selection change from USelectMenu
const handleChange = (newSelection: unknown) => {
  if (!newSelection) {
    emit('update:modelValue', [])
    return
  }
  const values = Array.isArray(newSelection)
    ? newSelection.map(item => typeof item === 'string' ? item : (item as Option)?.value).filter((v): v is string => Boolean(v))
    : []
  emit('update:modelValue', values)
}

// Clear all selections
const clearAll = () => {
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <label
      v-if="label"
      class="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <!-- Select Menu Container -->
    <div class="flex items-center gap-2">
      <!-- Multi-Select Dropdown (fixed width to prevent jumping) -->
      <div class="w-48">
        <USelectMenu
          :model-value="normalizedValue"
          :items="options"
          multiple
          searchable
          :placeholder="placeholder"
          :aria-label="`${label} filter`"
          value-key="value"
          @update:model-value="handleChange"
        />
      </div>

      <!-- Selection Count Badge -->
      <UBadge
        v-if="normalizedValue.length > 0"
        :color="color as any"
        size="md"
        variant="soft"
      >
        {{ normalizedValue.length }}
      </UBadge>

      <!-- Clear Button -->
      <UButton
        v-if="showClearButton"
        icon="i-heroicons-x-mark"
        color="neutral"
        variant="ghost"
        size="sm"
        :aria-label="`Clear ${label} filter`"
        @click="clearAll"
      />
    </div>
  </div>
</template>

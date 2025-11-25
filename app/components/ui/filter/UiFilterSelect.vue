<script setup lang="ts">
/**
 * Single-select filter component with optional label
 * Wraps USelectMenu to match UiFilterMultiSelect/UiFilterToggle structure
 *
 * @example
 * ```vue
 * <UiFilterSelect
 *   v-model="selectedCost"
 *   label="Cost Range"
 *   :options="costOptions"
 *   placeholder="All Costs"
 * />
 * ```
 */

interface Option {
  value: string | number | null
  label: string
}

interface Props {
  /** Selected value */
  modelValue: string | number | null | undefined
  /** Filter label (optional - if not provided, no label shown but space reserved) */
  label?: string
  /** Available options */
  options: Option[]
  /** Placeholder text when nothing selected */
  placeholder?: string
  /** Width class (default: 'w-full sm:w-44') */
  widthClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select...',
  widthClass: 'w-full sm:w-44'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

// Handle selection change
const handleChange = (value: unknown) => {
  emit('update:modelValue', value as string | number | null)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Label (or spacer for alignment) -->
    <label
      v-if="label"
      class="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>
    <div
      v-else
      class="h-5"
      aria-hidden="true"
    />

    <!-- Select Menu -->
    <USelectMenu
      :model-value="modelValue"
      :items="options"
      value-key="value"
      :placeholder="placeholder"
      size="md"
      :class="widthClass"
      @update:model-value="handleChange"
    />
  </div>
</template>

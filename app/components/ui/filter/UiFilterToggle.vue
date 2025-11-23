<script setup lang="ts">
import { computed } from 'vue'

interface FilterOption {
  value: string | number | boolean | null
  label: string
}

interface Props {
  modelValue: string | number | boolean | null | undefined
  label: string
  options?: FilterOption[]
  color?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [
    { value: null, label: 'All' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ],
  color: 'primary',
  size: 'md',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
  'change': [value: string | number | boolean | null]
}>()

// Normalize model value for comparison (handle undefined/null)
const normalizedValue = computed(() => {
  return props.modelValue ?? null
})

// Check if an option is currently selected
const isSelected = (optionValue: string | number | boolean | null) => {
  return normalizedValue.value === optionValue
}

// Handle option click
const selectOption = (value: string | number | boolean | null) => {
  if (props.disabled) return

  emit('update:modelValue', value)
  emit('change', value)
}

// Dynamic button classes based on state
const getButtonClasses = (optionValue: string | number | boolean | null) => {
  const selected = isSelected(optionValue)
  const baseClasses = [
    'px-4',
    'py-2',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    `focus:ring-${props.color}-500`
  ]

  // Size classes
  const sizeClasses = {
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-5', 'py-2.5']
  }

  // State classes
  if (props.disabled) {
    baseClasses.push('opacity-50', 'cursor-not-allowed', 'bg-gray-100', 'text-gray-400', 'dark:bg-gray-800', 'dark:text-gray-600')
  } else if (selected) {
    baseClasses.push(
      `bg-${props.color}-500`,
      'text-white',
      'shadow-md',
      'hover:shadow-lg',
      `hover:bg-${props.color}-600`
    )
  } else {
    baseClasses.push(
      'bg-gray-100',
      'text-gray-700',
      'hover:bg-gray-200',
      'dark:bg-gray-800',
      'dark:text-gray-300',
      'dark:hover:bg-gray-700'
    )
  }

  return [...baseClasses, ...sizeClasses[props.size]]
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

    <!-- Button Group -->
    <div
      class="inline-flex rounded-md"
      role="group"
      :aria-label="`${label} filter`"
    >
      <button
        v-for="(option, index) in options"
        :key="index"
        type="button"
        :class="[
          'relative px-2 py-1 text-xs font-medium transition-colors',
          'focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
          {
            // Border radius
            'rounded-l-md': index === 0,
            'rounded-r-md': index === options.length - 1,
            '-ml-px': index > 0,

            // Selected state
            'bg-primary-500 text-white border border-primary-500': isSelected(option.value) && !disabled,
            'hover:bg-primary-600': isSelected(option.value) && !disabled,

            // Unselected state
            'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300': !isSelected(option.value) && !disabled,
            'border border-gray-300 dark:border-gray-600': !isSelected(option.value) && !disabled,
            'hover:bg-gray-50 dark:hover:bg-gray-700': !isSelected(option.value) && !disabled,

            // Disabled state
            'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400': disabled
          }
        ]"
        :aria-pressed="isSelected(option.value)"
        :aria-label="`${label}: ${option.label}`"
        :disabled="disabled"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

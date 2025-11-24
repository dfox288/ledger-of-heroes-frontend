<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * Dual-handle range slider filter component for numeric min/max filtering
 *
 * @example
 * ```vue
 * <UiFilterRangeSlider
 *   v-model="crRange"
 *   label="Challenge Rating"
 *   :min="0"
 *   :max="30"
 *   :step="0.25"
 *   color="error"
 *   :formatLabel="(val) => `CR ${val}`"
 * />
 * ```
 */

interface Props {
  /** Current range [min, max] */
  modelValue: [number, number]
  /** Filter label */
  label: string
  /** Minimum allowed value */
  min: number
  /** Maximum allowed value */
  max: number
  /** Step increment (default: 1) */
  step?: number
  /** Entity semantic color (default: 'primary') */
  color?: string
  /** Custom label formatter function */
  formatLabel?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  color: 'primary'
})

const emit = defineEmits<{
  'update:modelValue': [value: [number, number]]
}>()

// Local refs for slider values
const minValue = ref(props.modelValue[0])
const maxValue = ref(props.modelValue[1])

// Watch for external prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    minValue.value = newValue[0]
    maxValue.value = newValue[1]
  }
)

// Format value for display
const formatValue = (value: number): string => {
  if (props.formatLabel) {
    return props.formatLabel(value)
  }
  return value.toString()
}

// Display text showing current range
const rangeText = computed(() => {
  return `${formatValue(minValue.value)} - ${formatValue(maxValue.value)}`
})

// Show reset button when not at full range
const showResetButton = computed(() => {
  return minValue.value !== props.min || maxValue.value !== props.max
})

// Handle min slider change
const handleMinChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let newMin = Number(target.value)

  // Ensure min doesn't exceed max
  if (newMin > maxValue.value) {
    newMin = maxValue.value
  }

  minValue.value = newMin
  emit('update:modelValue', [newMin, maxValue.value])
}

// Handle max slider change
const handleMaxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let newMax = Number(target.value)

  // Ensure max doesn't go below min
  if (newMax < minValue.value) {
    newMax = minValue.value
  }

  maxValue.value = newMax
  emit('update:modelValue', [minValue.value, newMax])
}

// Reset to full range
const resetRange = () => {
  minValue.value = props.min
  maxValue.value = props.max
  emit('update:modelValue', [props.min, props.max])
}

// Calculate track fill width and position (for visual styling)
const trackFillStyle = computed(() => {
  const range = props.max - props.min
  const minPercent = ((minValue.value - props.min) / range) * 100
  const maxPercent = ((maxValue.value - props.min) / range) * 100
  const width = maxPercent - minPercent

  return {
    left: `${minPercent}%`,
    width: `${width}%`
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Label and Range Display -->
    <div class="flex items-center justify-between">
      <label
        v-if="label"
        class="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {{ label }}
      </label>
      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
        {{ rangeText }}
      </span>
    </div>

    <!-- Slider Container -->
    <div class="relative flex items-center gap-2">
      <!-- Dual Range Slider -->
      <div class="relative flex-1">
        <!-- Track Background -->
        <div class="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <!-- Active Track Fill -->
          <div
            class="absolute h-2 rounded-full transition-all"
            :class="`bg-${color}-500`"
            :style="trackFillStyle"
          />
        </div>

        <!-- Min Slider -->
        <input
          :value="minValue"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          class="absolute top-0 w-full appearance-none bg-transparent pointer-events-none"
          :class="`slider-thumb-${color}`"
          :aria-label="`Minimum ${label}`"
          @input="handleMinChange"
        >

        <!-- Max Slider -->
        <input
          :value="maxValue"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          class="absolute top-0 w-full appearance-none bg-transparent pointer-events-none"
          :class="`slider-thumb-${color}`"
          :aria-label="`Maximum ${label}`"
          @input="handleMaxChange"
        >
      </div>

      <!-- Reset Button -->
      <UButton
        v-if="showResetButton"
        icon="i-heroicons-arrow-path"
        color="neutral"
        variant="ghost"
        size="xs"
        :aria-label="`Reset ${label} range`"
        @click="resetRange"
      />
    </div>
  </div>
</template>

<style scoped>
/* Custom range input styling */
input[type="range"] {
  -webkit-appearance: none;
  pointer-events: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: all;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: white;
  border: 2px solid rgb(var(--color-primary-500));
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

input[type="range"]::-moz-range-thumb {
  pointer-events: all;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: white;
  border: 2px solid rgb(var(--color-primary-500));
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.2);
}

input[type="range"]:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.2);
}
</style>

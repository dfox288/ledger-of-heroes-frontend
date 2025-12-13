<!-- app/components/character/inventory/EncumbranceBar.vue -->
<script setup lang="ts">
/**
 * Encumbrance Tracking Bar
 *
 * Visual weight tracking with progress bar and localStorage toggle.
 * - Green: Under 66% capacity
 * - Yellow: 67-99% capacity
 * - Red: At or over capacity
 *
 * Toggle state persists per-character in localStorage.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

interface Props {
  currentWeight: number
  carryingCapacity: number
  publicId: string
}

const props = defineProps<Props>()

// Toggle state persisted to localStorage
const isEnabled = ref(false)
const storageKey = computed(() => `encumbrance-tracking-${props.publicId}`)

onMounted(() => {
  const saved = localStorage.getItem(storageKey.value)
  isEnabled.value = saved === 'true'
})

function toggleEnabled() {
  isEnabled.value = !isEnabled.value
  localStorage.setItem(storageKey.value, String(isEnabled.value))
}

// Calculate percentage (capped at 100% for display)
const percentage = computed(() => {
  if (props.carryingCapacity <= 0) return 0
  return Math.min((props.currentWeight / props.carryingCapacity) * 100, 100)
})

// Determine bar color based on capacity usage
const barColor = computed(() => {
  const pct = (props.currentWeight / props.carryingCapacity) * 100
  if (pct >= 100) return 'bg-error'
  if (pct >= 67) return 'bg-warning'
  return 'bg-success'
})

const isOverCapacity = computed(() => props.currentWeight > props.carryingCapacity)
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Encumbrance
      </h3>
      <button
        data-testid="encumbrance-toggle"
        class="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        @click="toggleEnabled"
      >
        {{ isEnabled ? 'Hide' : 'Show' }}
      </button>
    </div>

    <div
      v-if="isEnabled"
      class="space-y-2"
    >
      <!-- Weight Display -->
      <div class="flex justify-between text-sm">
        <span :class="isOverCapacity ? 'text-error font-medium' : 'text-gray-600 dark:text-gray-300'">
          {{ currentWeight }} / {{ carryingCapacity }} lbs
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          data-testid="encumbrance-fill"
          :class="['h-full transition-all duration-300', barColor]"
          :style="{ width: `${percentage}%` }"
        />
      </div>
    </div>

    <p
      v-else
      class="text-sm text-gray-400 dark:text-gray-500 italic"
    >
      Click "Show" to track weight
    </p>
  </div>
</template>

<!-- app/components/character/inventory/EncumbranceBar.vue -->
<script setup lang="ts">
/**
 * Encumbrance Tracking Bar
 *
 * Visual weight tracking with progress bar and localStorage toggle.
 * Uses D&D 5e Variant Encumbrance rules (PHB p.176):
 * - Green (OK): Under 33% capacity (under STR × 5)
 * - Yellow (Encumbered): 33-66% capacity (STR × 5 to STR × 10) — Speed -10 ft
 * - Red (Heavily Encumbered): 66%+ capacity (over STR × 10) — Speed -20 ft, disadvantage
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

// Determine bar color based on D&D 5e encumbrance thresholds
const barColor = computed(() => {
  const pct = (props.currentWeight / props.carryingCapacity) * 100
  if (pct >= 66) return 'bg-error' // Heavily encumbered (Speed -20ft, disadvantage)
  if (pct >= 33) return 'bg-warning' // Encumbered (Speed -10ft)
  return 'bg-success' // OK
})

// Encumbrance status with D&D 5e penalties
const encumbranceStatus = computed(() => {
  const pct = (props.currentWeight / props.carryingCapacity) * 100
  if (pct >= 66) {
    return {
      label: 'Heavily Encumbered',
      penalty: 'Speed −20 ft, disadvantage on ability checks, attack rolls, and saving throws using STR, DEX, or CON'
    }
  }
  if (pct >= 33) {
    return {
      label: 'Encumbered',
      penalty: 'Speed −10 ft'
    }
  }
  return {
    label: 'Not Encumbered',
    penalty: null
  }
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
        <UTooltip
          v-if="encumbranceStatus.penalty"
          :text="encumbranceStatus.penalty"
        >
          <span
            data-testid="encumbrance-status"
            :class="[
              'text-xs font-medium',
              barColor === 'bg-error' ? 'text-error' : 'text-warning'
            ]"
          >
            {{ encumbranceStatus.label }}
          </span>
        </UTooltip>
      </div>

      <!-- Progress Bar -->
      <UTooltip :text="encumbranceStatus.penalty || 'No penalties'">
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-help">
          <div
            data-testid="encumbrance-fill"
            :class="['h-full transition-all duration-300', barColor]"
            :style="{ width: `${percentage}%` }"
          />
        </div>
      </UTooltip>
    </div>

    <p
      v-else
      class="text-sm text-gray-400 dark:text-gray-500 italic"
    >
      Click "Show" to track weight
    </p>
  </div>
</template>

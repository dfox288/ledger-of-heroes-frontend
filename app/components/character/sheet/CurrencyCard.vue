<!-- app/components/character/sheet/CurrencyCard.vue -->
<script setup lang="ts">
/**
 * Currency Card
 *
 * Displays character's coin purse in a compact 2x2+1 grid layout.
 * Designed for the sidebar (~200px width).
 * Emits click event when editable to allow parent to open edit modal.
 *
 * Layout:
 *   PP: 0   GP: 15
 *   EP: 0   SP: 30
 *       CP: 50
 */

export interface Currency {
  pp: number
  gp: number
  ep: number
  sp: number
  cp: number
}

const props = defineProps<{
  currency: Currency | null
  editable?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  if (!props.editable) return
  emit('click')
}

/**
 * Format number with locale-appropriate thousands separators
 */
function formatAmount(value: number | undefined): string {
  if (value === undefined || value === null) return '—'
  return value.toLocaleString()
}

// Currency display configuration with colors matching coin types
const currencies = [
  { key: 'pp', label: 'PP', color: 'text-gray-400 dark:text-gray-300' },
  { key: 'gp', label: 'GP', color: 'text-yellow-600 dark:text-yellow-500' },
  { key: 'ep', label: 'EP', color: 'text-gray-500 dark:text-gray-400' },
  { key: 'sp', label: 'SP', color: 'text-slate-400 dark:text-slate-300' },
  { key: 'cp', label: 'CP', color: 'text-orange-700 dark:text-orange-500' }
] as const
</script>

<template>
  <div
    data-testid="currency-card"
    :class="[
      'bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors',
      editable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
    ]"
    @click="handleClick"
  >
    <!-- Title -->
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">
      Currency
    </h3>

    <!-- Empty State -->
    <div
      v-if="!currency"
      class="text-center text-gray-400 dark:text-gray-500 text-sm py-2"
    >
      <span>—</span>
    </div>

    <!-- Currency Grid -->
    <div
      v-else
      class="space-y-2"
    >
      <!-- Row 1: PP and GP -->
      <div class="grid grid-cols-2 gap-2">
        <div
          data-testid="currency-pp"
          class="flex items-center justify-between"
        >
          <span :class="['text-xs font-bold', currencies[0].color]">PP</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ formatAmount(currency.pp) }}
          </span>
        </div>
        <div
          data-testid="currency-gp"
          class="flex items-center justify-between"
        >
          <span :class="['text-xs font-bold', currencies[1].color]">GP</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ formatAmount(currency.gp) }}
          </span>
        </div>
      </div>

      <!-- Row 2: EP and SP -->
      <div class="grid grid-cols-2 gap-2">
        <div
          data-testid="currency-ep"
          class="flex items-center justify-between"
        >
          <span :class="['text-xs font-bold', currencies[2].color]">EP</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ formatAmount(currency.ep) }}
          </span>
        </div>
        <div
          data-testid="currency-sp"
          class="flex items-center justify-between"
        >
          <span :class="['text-xs font-bold', currencies[3].color]">SP</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ formatAmount(currency.sp) }}
          </span>
        </div>
      </div>

      <!-- Row 3: CP centered -->
      <div class="flex justify-center">
        <div
          data-testid="currency-cp"
          class="flex items-center gap-2"
        >
          <span :class="['text-xs font-bold', currencies[4].color]">CP</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ formatAmount(currency.cp) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

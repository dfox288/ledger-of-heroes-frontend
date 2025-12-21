<!-- app/components/character/sheet/StatCurrency.vue -->
<script setup lang="ts">
/**
 * Currency Stat Display
 *
 * Displays character's coin purse with colored coin indicators.
 * Only shows currencies with non-zero values.
 * Emits click event when editable to allow parent to open edit modal.
 */

import type { CharacterCurrency } from '~/types/character'
import { CURRENCY_CONFIG } from '~/constants/currency'

const props = defineProps<{
  currency: CharacterCurrency | null
  editable?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

/**
 * Filter to only include currencies with non-zero values
 */
const visibleCurrencies = computed(() => {
  if (!props.currency) return []
  return CURRENCY_CONFIG
    .filter(c => props.currency![c.key as keyof CharacterCurrency] > 0)
    .map(c => ({
      ...c,
      value: props.currency![c.key as keyof CharacterCurrency]
    }))
})

function handleClick() {
  if (!props.editable) return
  emit('click')
}
</script>

<template>
  <div
    data-testid="currency-cell"
    :class="[
      'bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors',
      editable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
    ]"
    @click="handleClick"
  >
    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
      Currency
    </div>
    <!-- Show non-zero currencies in a clean grid -->
    <div
      v-if="visibleCurrencies.length > 0"
      class="flex flex-wrap justify-center gap-x-3 gap-y-1"
    >
      <div
        v-for="coin in visibleCurrencies"
        :key="coin.key"
        class="flex items-center gap-1"
      >
        <div
          :class="[coin.bg, 'w-5 h-5 rounded-full flex items-center justify-center']"
        >
          <span :class="[coin.coinText, 'text-[10px] font-black']">{{ coin.abbrev }}</span>
        </div>
        <span class="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {{ coin.value.toLocaleString() }}
        </span>
      </div>
    </div>
    <!-- Empty state when no currency or all zeros -->
    <div
      v-else
      class="text-center text-gray-400 dark:text-gray-500 text-sm"
    >
      —
    </div>
  </div>
</template>

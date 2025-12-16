<!-- app/components/character/inventory/SellModal.vue -->
<script setup lang="ts">
/**
 * Sell Modal
 *
 * Modal for selling items from inventory with price input.
 * Shows item info, allows quantity selection, custom sale price.
 * Displays currency preview (what you'll receive).
 *
 * Design mirrors ShopModal for consistency.
 *
 * @see ShopModal.vue for reference
 */

import type { CharacterEquipment, CharacterCurrency } from '~/types/character'

interface Props {
  item: CharacterEquipment | null
  currency: CharacterCurrency | null
  loading?: boolean
}

interface SellPayload {
  equipment_id: number
  quantity: number
  total_price_cp: number
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  sell: [payload: SellPayload]
}>()

// Selection state
const quantity = ref(1)
const customPrice = ref<number | null>(null)

// Currency conversion rates (to copper pieces)
const CURRENCY_TO_CP = {
  pp: 1000,
  gp: 100,
  ep: 50,
  sp: 10,
  cp: 1
}

/**
 * Currency display configuration (matches StatCurrency component)
 */
const currencyConfig = [
  { key: 'pp', label: 'P', bg: 'bg-gray-300 dark:bg-gray-500', text: 'text-gray-700 dark:text-gray-200' },
  { key: 'gp', label: 'G', bg: 'bg-yellow-400 dark:bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-900' },
  { key: 'ep', label: 'E', bg: 'bg-gray-200 dark:bg-gray-400', text: 'text-gray-600 dark:text-gray-700' },
  { key: 'sp', label: 'S', bg: 'bg-slate-300 dark:bg-slate-400', text: 'text-slate-700 dark:text-slate-800' },
  { key: 'cp', label: 'C', bg: 'bg-orange-400 dark:bg-orange-500', text: 'text-orange-800 dark:text-orange-900' }
] as const

/**
 * Filter to only include currencies with non-zero values
 */
const visibleCurrencies = computed(() => {
  if (!props.currency) return []
  return currencyConfig
    .filter(c => props.currency![c.key as keyof CharacterCurrency] > 0)
    .map(c => ({
      ...c,
      value: props.currency![c.key as keyof CharacterCurrency]
    }))
})

// Get item name from equipment
const itemName = computed(() => {
  if (!props.item) return ''
  if (props.item.custom_name) return props.item.custom_name
  const item = props.item.item as { name?: string } | null
  return item?.name ?? 'Unknown Item'
})

// Get item's base value (cost_cp / 2 for standard D&D sell price)
const baseItemValue = computed(() => {
  if (!props.item) return 0
  const item = props.item.item as { cost_cp?: number } | null
  const costCp = item?.cost_cp ?? 0
  // Standard D&D rule: sell for half value
  return Math.floor(costCp / 2)
})

// Max quantity (can't sell more than you have)
const maxQuantity = computed(() => props.item?.quantity ?? 1)

// Get unit price (custom or default half-value)
const unitPrice = computed((): number => {
  if (customPrice.value !== null && customPrice.value >= 0) {
    return customPrice.value
  }
  return baseItemValue.value
})

// Calculate total sale price
const totalPrice = computed((): number => {
  return unitPrice.value * quantity.value
})

// Calculate total current currency in copper
const totalCurrencyInCopper = computed((): number => {
  if (!props.currency) return 0
  return (
    props.currency.pp * CURRENCY_TO_CP.pp
    + props.currency.gp * CURRENCY_TO_CP.gp
    + props.currency.ep * CURRENCY_TO_CP.ep
    + props.currency.sp * CURRENCY_TO_CP.sp
    + props.currency.cp * CURRENCY_TO_CP.cp
  )
})

// Calculate currency after sale
const currencyAfterSale = computed((): number => {
  return totalCurrencyInCopper.value + totalPrice.value
})

/**
 * Convert copper pieces to currency breakdown for display with icons
 */
function copperToBreakdown(copperPieces: number) {
  let cp = copperPieces
  if (cp <= 0) return []

  const gp = Math.floor(cp / 100)
  cp = cp % 100
  const sp = Math.floor(cp / 10)
  cp = cp % 10

  const breakdown: Array<{ key: string, label: string, bg: string, text: string, value: number }> = []

  if (gp > 0) {
    const config = currencyConfig.find(c => c.key === 'gp')!
    breakdown.push({ ...config, value: gp })
  }
  if (sp > 0) {
    const config = currencyConfig.find(c => c.key === 'sp')!
    breakdown.push({ ...config, value: sp })
  }
  if (cp > 0) {
    const config = currencyConfig.find(c => c.key === 'cp')!
    breakdown.push({ ...config, value: cp })
  }

  return breakdown
}

const totalPriceBreakdown = computed(() => copperToBreakdown(totalPrice.value))
const afterSaleBreakdown = computed(() => copperToBreakdown(currencyAfterSale.value))

/**
 * Format copper pieces to human-readable currency
 */
function formatCurrency(copperPieces: number): string {
  if (copperPieces === 0) return '0 cp'

  if (copperPieces >= 100) {
    const gp = Math.floor(copperPieces / 100)
    const remainder = copperPieces % 100
    if (remainder === 0) return `${gp} gp`
    const sp = Math.floor(remainder / 10)
    const cp = remainder % 10
    let result = `${gp} gp`
    if (sp > 0) result += ` ${sp} sp`
    if (cp > 0) result += ` ${cp} cp`
    return result
  }

  if (copperPieces >= 10) {
    const sp = Math.floor(copperPieces / 10)
    const cp = copperPieces % 10
    if (cp === 0) return `${sp} sp`
    return `${sp} sp ${cp} cp`
  }

  return `${copperPieces} cp`
}

// Get item type icon
function getItemIcon(): string {
  if (!props.item) return 'i-heroicons-cube'
  const item = props.item.item as { item_type?: string } | null
  const itemType = item?.item_type?.toLowerCase() ?? ''

  if (itemType.includes('weapon') || itemType.includes('melee') || itemType.includes('ranged')) {
    return 'i-heroicons-bolt'
  }
  if (itemType.includes('armor') || itemType.includes('shield')) {
    return 'i-heroicons-shield-check'
  }
  if (itemType.includes('potion')) {
    return 'i-heroicons-beaker'
  }
  return 'i-heroicons-cube'
}

// Validation
const canSell = computed((): boolean => {
  if (props.loading) return false
  if (!props.item) return false
  if (quantity.value < 1) return false
  if (quantity.value > maxQuantity.value) return false
  return true
})

// Handle sell button
function handleSell() {
  if (!canSell.value || !props.item) return

  const payload: SellPayload = {
    equipment_id: props.item.id,
    quantity: quantity.value,
    total_price_cp: totalPrice.value
  }

  emit('sell', payload)
}

// Handle cancel
function handleCancel() {
  open.value = false
}

// Reset state when modal opens/closes
watch(open, (isOpen) => {
  if (isOpen) {
    quantity.value = 1
    customPrice.value = null
  }
})

// Clamp quantity when item changes
watch(() => props.item, () => {
  if (props.item && quantity.value > props.item.quantity) {
    quantity.value = props.item.quantity
  }
})
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Sell Item
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Current Currency Display -->
        <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
            Your Currency
          </div>
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
                <span :class="[coin.text, 'text-[10px] font-black']">{{ coin.label }}</span>
              </div>
              <span class="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                {{ coin.value.toLocaleString() }}
              </span>
            </div>
          </div>
          <div
            v-else
            class="text-center text-gray-400 dark:text-gray-500 text-sm"
          >
            No currency
          </div>
        </div>

        <!-- Item Display -->
        <div
          v-if="item"
          data-testid="sell-item"
          class="space-y-3"
        >
          <div class="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
            <div class="flex items-center gap-3">
              <UIcon
                :name="getItemIcon()"
                class="w-5 h-5 text-warning-600 dark:text-warning-400"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ itemName }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  You have: {{ item.quantity }}
                  <span v-if="baseItemValue > 0">
                    · Base value: {{ formatCurrency(baseItemValue) }} each
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Quantity and Price -->
          <div class="grid grid-cols-2 gap-3">
            <UFormField
              label="Quantity to Sell"
              class="w-full"
            >
              <UInput
                v-model.number="quantity"
                data-testid="quantity-input"
                type="number"
                :min="1"
                :max="maxQuantity"
                :ui="{ root: 'w-full' }"
              />
            </UFormField>
            <UFormField
              label="Sale Price (cp each)"
              class="w-full"
            >
              <UInput
                v-model.number="customPrice"
                data-testid="custom-price-input"
                type="number"
                :min="0"
                :placeholder="String(baseItemValue)"
                :ui="{ root: 'w-full' }"
              />
            </UFormField>
          </div>

          <!-- Total You'll Receive -->
          <div class="flex items-center justify-between p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
            <span class="text-sm text-gray-600 dark:text-gray-300">You'll Receive</span>
            <div class="flex items-center gap-2">
              <div
                v-for="coin in totalPriceBreakdown"
                :key="coin.key"
                class="flex items-center gap-1"
              >
                <div
                  :class="[coin.bg, 'w-4 h-4 rounded-full flex items-center justify-center']"
                >
                  <span :class="[coin.text, 'text-[8px] font-black']">{{ coin.label }}</span>
                </div>
                <span class="text-sm font-semibold text-success-600 dark:text-success-400 tabular-nums">
                  {{ coin.value.toLocaleString() }}
                </span>
              </div>
              <span
                v-if="totalPriceBreakdown.length === 0"
                class="font-bold text-gray-500"
              >
                0 cp
              </span>
            </div>
          </div>

          <!-- Currency Preview After Sale -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">After sale:</span>
            <div class="flex items-center gap-2">
              <div
                v-for="coin in afterSaleBreakdown"
                :key="coin.key"
                class="flex items-center gap-1"
              >
                <div
                  :class="[coin.bg, 'w-4 h-4 rounded-full flex items-center justify-center']"
                >
                  <span :class="[coin.text, 'text-[8px] font-black']">{{ coin.label }}</span>
                </div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {{ coin.value.toLocaleString() }}
                </span>
              </div>
              <span
                v-if="afterSaleBreakdown.length === 0"
                class="text-gray-500"
              >
                0 cp
              </span>
            </div>
          </div>

          <!-- Warning if selling all -->
          <div
            v-if="quantity === maxQuantity && maxQuantity > 1"
            class="text-xs text-warning-600 dark:text-warning-400 text-center"
          >
            You're selling all {{ maxQuantity }} of this item
          </div>
        </div>

        <!-- No item selected state -->
        <div
          v-else
          class="text-center py-8 text-gray-500"
        >
          No item selected
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="sell-btn"
          color="warning"
          :disabled="!canSell"
          :loading="loading"
          @click="handleSell"
        >
          Sell
        </UButton>
      </div>
    </template>
  </UModal>
</template>

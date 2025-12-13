<!-- app/components/character/inventory/ShopModal.vue -->
<script setup lang="ts">
/**
 * Shop Modal
 *
 * Modal for purchasing items from a shop with price tracking.
 * Shows item prices, allows price overrides, validates funds.
 *
 * Features:
 * - Search compendium items with prices
 * - Item cost display (from cost_cp field)
 * - Editable "Your Price" for haggling/discounts
 * - Currency preview (current → remaining)
 * - Insufficient funds warning
 * - Quantity multiplier
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { Item } from '~/types'
import type { CharacterCurrency } from '~/types/character'

interface Props {
  open: boolean
  currency: CharacterCurrency | null
  loading?: boolean
}

interface PurchasePayload {
  item_slug: string
  quantity: number
  total_cost_cp: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'purchase': [payload: PurchasePayload]
}>()

const { apiFetch } = useApi()

// Search state
const searchQuery = ref('')
const searchResults = ref<Item[]>([])
const isSearching = ref(false)

// Selection state
const selectedItem = ref<Item | null>(null)
const quantity = ref(1)
const customPrice = ref<number | null>(null)

// Currency conversion rates (to copper pieces)
const CURRENCY_TO_CP = {
  pp: 1000, // 1 platinum = 10 gold = 1000 copper
  gp: 100, // 1 gold = 100 copper
  ep: 50, // 1 electrum = 50 copper
  sp: 10, // 1 silver = 10 copper
  cp: 1 // 1 copper = 1 copper
}

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null

async function searchItems(query: string) {
  if (!query.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await apiFetch<{ data: Item[] }>('/items', {
      params: { q: query, per_page: 10 }
    })
    searchResults.value = response.data || []
  } catch (error) {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function handleSearchInput(value: string) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchItems(value)
  }, 300)
}

// Watch search query for debounced search
watch(searchQuery, handleSearchInput)

// Select an item from search results
function selectItem(item: Item) {
  selectedItem.value = item
  searchQuery.value = ''
  searchResults.value = []
  customPrice.value = null // Reset custom price for new item
}

// Clear selection
function clearSelection() {
  selectedItem.value = null
  customPrice.value = null
}

// Calculate total currency in copper pieces
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

// Get unit price for selected item (either custom or from item data)
const unitPrice = computed((): number => {
  if (customPrice.value !== null && customPrice.value >= 0) {
    return customPrice.value
  }
  return selectedItem.value?.cost_cp ?? 0
})

// Calculate total cost (unit price * quantity)
const totalCost = computed((): number => {
  return unitPrice.value * quantity.value
})

// Calculate remaining currency after purchase
const remainingGold = computed((): number => {
  return totalCurrencyInCopper.value - totalCost.value
})

// Check if funds are insufficient
const isInsufficientFunds = computed((): boolean => {
  if (!selectedItem.value) return false
  return totalCost.value > totalCurrencyInCopper.value
})

// Validation for purchase
const canPurchase = computed((): boolean => {
  if (props.loading) return false
  if (!selectedItem.value) return false
  if (quantity.value < 1) return false
  if (isInsufficientFunds.value) return false
  return true
})

// Handle purchase button
function handlePurchase() {
  if (!canPurchase.value || !selectedItem.value) return

  const payload: PurchasePayload = {
    item_slug: selectedItem.value.slug,
    quantity: quantity.value,
    total_cost_cp: totalCost.value
  }

  emit('purchase', payload)
}

// Handle cancel
function handleCancel() {
  emit('update:open', false)
}

// Reset state when modal opens/closes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Reset all state
    searchQuery.value = ''
    searchResults.value = []
    selectedItem.value = null
    quantity.value = 1
    customPrice.value = null
    isSearching.value = false
  }
})

/**
 * Format copper pieces to human-readable currency
 * Displays in the largest reasonable denomination
 */
function formatCurrency(copperPieces: number): string {
  if (copperPieces === 0) return '0 cp'

  // Convert to gold/silver/copper display
  if (copperPieces >= 100) {
    const gp = Math.floor(copperPieces / 100)
    const remainder = copperPieces % 100
    if (remainder === 0) {
      return `${gp} gp`
    }
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
    if (cp === 0) {
      return `${sp} sp`
    }
    return `${sp} sp ${cp} cp`
  }

  return `${copperPieces} cp`
}

/**
 * Format currency for display (simplified - just gold equivalent)
 */
function formatGoldEquivalent(copperPieces: number): string {
  const gp = Math.floor(copperPieces / 100)
  const remainder = copperPieces % 100
  if (remainder === 0) {
    return `${gp} gp`
  }
  return `${(copperPieces / 100).toFixed(2)} gp`
}

// Get item type icon
function getItemIcon(item: Item): string {
  const typeCode = item.item_type?.code
  switch (typeCode) {
    case 'W': return 'i-heroicons-bolt'
    case 'A': return 'i-heroicons-shield-check'
    case 'P': return 'i-heroicons-beaker'
    default: return 'i-heroicons-cube'
  }
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Shop
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Current Gold Display -->
        <div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <span class="text-sm text-yellow-700 dark:text-yellow-300">Your Gold</span>
          <span class="font-semibold text-yellow-800 dark:text-yellow-200">
            {{ formatGoldEquivalent(totalCurrencyInCopper) }}
          </span>
        </div>

        <!-- Selected Item Display -->
        <div
          v-if="selectedItem"
          data-testid="selected-item"
          class="space-y-3"
        >
          <div class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div class="flex items-center gap-3">
              <UIcon
                :name="getItemIcon(selectedItem)"
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedItem.name }}
                </p>
                <p
                  v-if="selectedItem.cost_cp"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  Base price: {{ formatCurrency(selectedItem.cost_cp) }}
                </p>
              </div>
            </div>
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-x-mark"
              @click="clearSelection"
            />
          </div>

          <!-- Quantity and Price -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Quantity
              </label>
              <UInput
                v-model.number="quantity"
                data-testid="quantity-input"
                type="number"
                :min="1"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                Your Price (cp)
              </label>
              <UInput
                v-model.number="customPrice"
                data-testid="custom-price-input"
                type="number"
                :min="0"
                :placeholder="String(selectedItem.cost_cp ?? 0)"
              />
            </div>
          </div>

          <!-- Total Cost -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span class="text-sm text-gray-600 dark:text-gray-300">Total Cost</span>
            <span
              :class="[
                'font-bold',
                isInsufficientFunds
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-gray-900 dark:text-white'
              ]"
            >
              {{ formatCurrency(totalCost) }}
            </span>
          </div>

          <!-- Insufficient Funds Warning -->
          <div
            v-if="isInsufficientFunds"
            data-testid="insufficient-funds-warning"
            class="p-3 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg"
          >
            <p class="text-sm text-error-700 dark:text-error-300 text-center font-medium">
              Insufficient funds! You need {{ formatCurrency(totalCost - totalCurrencyInCopper) }} more.
            </p>
          </div>

          <!-- Currency Preview -->
          <div
            v-else
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-500 dark:text-gray-400">After purchase:</span>
            <span class="text-success-600 dark:text-success-400 font-medium">
              {{ formatGoldEquivalent(remainingGold) }} remaining
            </span>
          </div>
        </div>

        <!-- Search Input (hidden when item is selected) -->
        <div v-else>
          <UInput
            v-model="searchQuery"
            data-testid="shop-search"
            placeholder="Search items to buy..."
            icon="i-heroicons-magnifying-glass"
            :loading="isSearching"
          />

          <!-- Search Results -->
          <div
            v-if="searchResults.length > 0"
            class="mt-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700"
          >
            <button
              v-for="item in searchResults"
              :key="item.id"
              :data-testid="`item-result-${item.id}`"
              class="w-full flex items-center justify-between gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              @click="selectItem(item)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <UIcon
                  :name="getItemIcon(item)"
                  class="w-5 h-5 text-gray-400 flex-shrink-0"
                />
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">
                    {{ item.name }}
                  </p>
                  <p
                    v-if="item.item_type"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ item.item_type.name }}
                  </p>
                </div>
              </div>
              <span
                v-if="item.cost_cp"
                class="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex-shrink-0"
              >
                {{ formatCurrency(item.cost_cp) }}
              </span>
              <span
                v-else
                class="text-sm text-gray-400 dark:text-gray-500 italic flex-shrink-0"
              >
                Priceless
              </span>
            </button>
          </div>

          <!-- Empty Search State -->
          <p
            v-else-if="searchQuery.trim() && !isSearching"
            class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center py-4"
          >
            No items found
          </p>

          <!-- Hint when no search -->
          <p
            v-else-if="!searchQuery.trim()"
            class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center py-4"
          >
            Search for items to purchase
          </p>
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
          data-testid="purchase-btn"
          color="primary"
          :disabled="!canPurchase"
          :loading="loading"
          @click="handlePurchase"
        >
          Purchase
        </UButton>
      </div>
    </template>
  </UModal>
</template>

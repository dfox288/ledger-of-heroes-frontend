<!-- app/pages/characters/[publicId]/inventory.vue -->
<script setup lang="ts">
/**
 * Inventory Management Page
 *
 * Full inventory UI with grouped item table, equipment status sidebar,
 * add loot/shop modals, and optional encumbrance tracking.
 *
 * Uses CharacterPageHeader for unified header with play mode, inspiration, etc.
 * Uses characterPlayState store for currency and play mode state.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-redesign.md
 * @see Issue #584 - Character sheet component refactor
 */

import type { Character, CharacterEquipment } from '~/types/character'
import type { EquipmentLocation } from '~/composables/useInventoryActions'
import type { EquipmentSlot } from '~/utils/equipmentSlots'
import { storeToRefs } from 'pinia'
import { logger } from '~/utils/logger'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const toast = useToast()
const { apiFetch } = useApi()

// ============================================================================
// Play State Store
// ============================================================================

const playStateStore = useCharacterPlayStateStore()
const { canEdit } = storeToRefs(playStateStore)

// Modal state
const isAddLootOpen = ref(false)
const isShopOpen = ref(false)
const isItemDetailOpen = ref(false)
const isSellModalOpen = ref(false)
const isEditQtyModalOpen = ref(false)
const isDropConfirmOpen = ref(false)
const selectedItem = ref<CharacterEquipment | null>(null)
const itemToDrop = ref<CharacterEquipment | null>(null)
const isAddingItem = ref(false)
const isPurchasing = ref(false)
const isSelling = ref(false)
const isUpdatingQty = ref(false)
const isDropping = ref(false)

// Slot picker modal state
const isSlotPickerOpen = ref(false)
const slotPickerItem = ref<CharacterEquipment | null>(null)
const slotPickerValidSlots = ref<EquipmentSlot[]>([])
const slotPickerSuggestedSlot = ref<EquipmentSlot | null>(null)
const isEquipping = ref(false)

// Search state
const searchQuery = ref('')

// Fetch full character data (needed for PageHeader)
const { data: characterData, pending: characterPending, refresh: refreshCharacter } = await useAsyncData(
  `inventory-character-${publicId.value}`,
  () => apiFetch<{ data: Character }>(`/characters/${publicId.value}`)
)

// Fetch equipment data
const { data: equipmentData, pending: equipmentPending, refresh: refreshEquipment } = await useAsyncData(
  `inventory-equipment-${publicId.value}`,
  () => apiFetch<{ data: CharacterEquipment[] }>(`/characters/${publicId.value}/equipment`)
)

// Fetch stats for carrying capacity, spellcaster check, and HP (for store init)
interface StatsResponse {
  carrying_capacity?: number
  push_drag_lift?: number
  spellcasting?: unknown
  hit_points?: { current: number | null, max: number | null, temporary?: number | null }
}
const { data: statsData, pending: statsPending } = await useAsyncData(
  `inventory-stats-${publicId.value}`,
  () => apiFetch<{ data: StatsResponse }>(
    `/characters/${publicId.value}/stats`
  )
)

// Track initial load vs refresh - only show skeleton on initial load
const hasLoadedOnce = ref(false)
const loading = computed(() => {
  // After initial load, never show loading skeleton (prevents flash on refresh)
  if (hasLoadedOnce.value) return false
  return characterPending.value || equipmentPending.value || statsPending.value
})

// Mark as loaded once all data is available
watch(
  () => !characterPending.value && !equipmentPending.value && !statsPending.value,
  (allLoaded) => {
    if (allLoaded && !hasLoadedOnce.value) {
      hasLoadedOnce.value = true
    }
  },
  { immediate: true }
)

const character = computed(() => characterData.value?.data ?? null)
// Filter out currency items - they're shown in the currency display, not inventory
const equipment = computed(() =>
  (equipmentData.value?.data ?? []).filter(item => !item.is_currency)
)
const stats = computed(() => statsData.value?.data ?? null)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)

// ============================================================================
// Store Initialization
// ============================================================================

/**
 * Initialize play state store when character and stats load
 * Store manages HP, death saves, and currency state for play mode
 */
watch([character, statsData], ([char, s]) => {
  if (char && s?.data) {
    playStateStore.initialize({
      characterId: char.id,
      isDead: char.is_dead ?? false,
      hitPoints: {
        current: s.data.hit_points?.current ?? null,
        max: s.data.hit_points?.max ?? null,
        temporary: s.data.hit_points?.temporary ?? null
      },
      deathSaves: {
        successes: char.death_save_successes ?? 0,
        failures: char.death_save_failures ?? 0
      },
      currency: char.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    })
  }
}, { immediate: true })

// Reset store when leaving the page
onUnmounted(() => {
  playStateStore.$reset()
})

// Item count for header
const itemCount = computed(() => equipment.value.length)

// Calculate total weight of all equipment
const currentWeight = computed(() => {
  const total = equipment.value.reduce((sum, item) => {
    const itemData = item.item as { weight?: string | number } | null
    const weight = parseFloat(String(itemData?.weight ?? 0)) || 0
    return sum + (weight * item.quantity)
  }, 0)
  return Math.round(total * 100) / 100
})

// Handle clicking an item in the sidebar (scroll to it in table)
function handleSidebarItemClick(itemId: number) {
  const element = document.querySelector(`[data-item-id="${itemId}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Handle clicking an item in the table (open detail modal)
function handleItemClick(item: CharacterEquipment) {
  selectedItem.value = item
  isItemDetailOpen.value = true
}

// Inventory actions composable
const {
  equipItem,
  unequipItem,
  addItem,
  dropItem,
  sellItem,
  purchaseItem,
  updateQuantity,
  setAttunement
} = useInventoryActions(publicId)

// Item action handlers
async function handleEquip(itemId: number, slot: string) {
  try {
    await equipItem(itemId, slot as EquipmentLocation)
    toast.add({ title: 'Item equipped!', color: 'success' })
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to equip item:', error)
    toast.add({ title: 'Failed to equip item', color: 'error' })
  }
}

function handleEquipWithPicker(itemId: number, validSlots: EquipmentSlot[], suggestedSlot: EquipmentSlot | null) {
  const item = equipment.value.find(e => e.id === itemId)
  if (!item) return

  slotPickerItem.value = item
  slotPickerValidSlots.value = validSlots
  slotPickerSuggestedSlot.value = suggestedSlot
  isSlotPickerOpen.value = true
}

async function handleSlotSelected(slot: EquipmentSlot) {
  if (!slotPickerItem.value) return

  isEquipping.value = true
  try {
    await equipItem(slotPickerItem.value.id, slot as EquipmentLocation)
    toast.add({ title: 'Item equipped!', color: 'success' })
    isSlotPickerOpen.value = false
    slotPickerItem.value = null
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to equip item:', error)
    toast.add({ title: 'Failed to equip item', color: 'error' })
  } finally {
    isEquipping.value = false
  }
}

async function handleUnequip(itemId: number) {
  try {
    await unequipItem(itemId)
    toast.add({ title: 'Item unequipped', color: 'success' })
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to unequip item:', error)
    toast.add({ title: 'Failed to unequip item', color: 'error' })
  }
}

// Attunement handlers (issue #588)
async function handleAttune(itemId: number) {
  try {
    await setAttunement(itemId, true)
    toast.add({ title: 'Item attuned!', color: 'success' })
    await refreshEquipment()
  } catch (error: unknown) {
    // FetchError from ofetch - access data property directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    logger.error('Attunement error:', err)

    // Extract message - Nitro wraps backend response in data.data
    // err.data = Nitro error response, err.data.data = backend response body
    const message = err?.data?.data?.message
      || err?.data?.message
      || 'Maximum attunement slots reached'

    const statusCode = err?.statusCode || err?.status || 0

    if (statusCode === 422 || err?.statusMessage === 'Unprocessable Content') {
      toast.add({
        title: 'Cannot attune',
        description: message,
        color: 'error'
      })
    } else {
      toast.add({ title: 'Failed to attune item', color: 'error' })
    }
  }
}

async function handleBreakAttune(itemId: number) {
  try {
    await setAttunement(itemId, false)
    toast.add({ title: 'Attunement broken', color: 'success' })
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to break attunement:', error)
    toast.add({ title: 'Failed to break attunement', color: 'error' })
  }
}

function handleSell(itemId: number) {
  const item = equipment.value.find(e => e.id === itemId)
  if (!item) return
  selectedItem.value = item
  isSellModalOpen.value = true
}

function handleDrop(itemId: number) {
  const item = equipment.value.find(e => e.id === itemId)
  if (!item) return
  itemToDrop.value = item
  isDropConfirmOpen.value = true
}

async function handleDropConfirm() {
  if (!itemToDrop.value) return

  isDropping.value = true
  try {
    await dropItem(itemToDrop.value.id)
    toast.add({ title: 'Item dropped', color: 'success' })
    isDropConfirmOpen.value = false
    itemToDrop.value = null
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to drop item:', error)
    toast.add({ title: 'Failed to drop item', color: 'error' })
  } finally {
    isDropping.value = false
  }
}

function handleEditQty(itemId: number) {
  const item = equipment.value.find(e => e.id === itemId)
  if (!item) return
  selectedItem.value = item
  isEditQtyModalOpen.value = true
}

async function handleIncrementQty(itemId: number) {
  try {
    const item = equipment.value.find(e => e.id === itemId)
    if (!item) return
    await updateQuantity(itemId, item.quantity + 1)
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to increment quantity:', error)
    toast.add({ title: 'Failed to update quantity', color: 'error' })
  }
}

async function handleDecrementQty(itemId: number) {
  try {
    const item = equipment.value.find(e => e.id === itemId)
    if (!item || item.quantity <= 1) return
    await updateQuantity(itemId, item.quantity - 1)
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to decrement quantity:', error)
    toast.add({ title: 'Failed to update quantity', color: 'error' })
  }
}

// Add Loot modal handler
interface AddItemPayload {
  item_slug: string | null
  quantity: number
  custom_name: string | null
  custom_description: string | null
}

async function handleAddLoot(payload: AddItemPayload) {
  isAddingItem.value = true
  try {
    await addItem({
      item_slug: payload.item_slug,
      quantity: payload.quantity,
      custom_name: payload.custom_name,
      custom_description: payload.custom_description
    })

    const itemName = payload.custom_name || payload.item_slug?.split(':')[1] || 'item'
    toast.add({
      title: 'Item Added!',
      description: `Added ${payload.quantity}x ${itemName} to inventory`,
      color: 'success'
    })

    isAddLootOpen.value = false
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to add item:', error)
    toast.add({ title: 'Failed to add item', color: 'error' })
  } finally {
    isAddingItem.value = false
  }
}

// Shop modal handler
interface PurchasePayload {
  item_slug: string
  quantity: number
  total_cost_cp: number
}

async function handlePurchase(payload: PurchasePayload) {
  isPurchasing.value = true
  try {
    await purchaseItem(payload.item_slug, payload.quantity, payload.total_cost_cp)

    const itemName = payload.item_slug.split(':')[1] || 'item'
    const goldCost = (payload.total_cost_cp / 100).toFixed(2)
    toast.add({
      title: 'Purchase Complete!',
      description: `Bought ${payload.quantity}x ${itemName} for ${goldCost} gp`,
      color: 'success'
    })

    isShopOpen.value = false
    await Promise.all([refreshEquipment(), refreshCharacter()])
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    if (err.statusCode === 422) {
      toast.add({
        title: 'Purchase failed',
        description: err.data?.message || 'Insufficient funds',
        color: 'error'
      })
    } else {
      logger.error('Failed to purchase item:', error)
      toast.add({ title: 'Purchase failed', color: 'error' })
    }
  } finally {
    isPurchasing.value = false
  }
}

// Sell modal handler
interface SellPayload {
  equipment_id: number
  quantity: number
  total_price_cp: number
}

async function handleSellConfirm(payload: SellPayload) {
  isSelling.value = true
  try {
    const item = equipment.value.find(e => e.id === payload.equipment_id)
    if (!item) return

    // If selling all, delete the item
    if (payload.quantity >= item.quantity) {
      await sellItem(payload.equipment_id, payload.total_price_cp)
    } else {
      // Partial sell: reduce quantity and add currency via store
      await updateQuantity(payload.equipment_id, item.quantity - payload.quantity)
      await playStateStore.updateCurrency({ cp: `+${payload.total_price_cp}` })
    }

    toast.add({
      title: 'Item sold!',
      description: `Received ${(payload.total_price_cp / 100).toFixed(2)} gp`,
      color: 'success'
    })

    isSellModalOpen.value = false
    selectedItem.value = null
    await refreshEquipment()
    // Full sell path updates currency via sellItem, need to refresh character to sync store
    if (payload.quantity >= item.quantity) {
      await refreshCharacter()
    }
  } catch (error) {
    logger.error('Failed to sell item:', error)
    toast.add({ title: 'Failed to sell item', color: 'error' })
  } finally {
    isSelling.value = false
  }
}

// Edit quantity modal handler
interface EditQuantityPayload {
  equipment_id: number
  quantity: number
}

async function handleEditQtyConfirm(payload: EditQuantityPayload) {
  isUpdatingQty.value = true
  try {
    await updateQuantity(payload.equipment_id, payload.quantity)
    toast.add({ title: 'Quantity updated!', color: 'success' })
    isEditQtyModalOpen.value = false
    selectedItem.value = null
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to update quantity:', error)
    toast.add({ title: 'Failed to update quantity', color: 'error' })
  } finally {
    isUpdatingQty.value = false
  }
}

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Inventory` : 'Inventory'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <div class="grid lg:grid-cols-[2fr_1fr] gap-6">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="character">
      <!-- Unified Page Header (back button, play mode, portrait, tabs) -->
      <CharacterPageHeader
        :character="character"
        :is-spellcaster="isSpellcaster"
        :back-to="`/characters/${publicId}`"
        back-label="Back to Character"
        @updated="refreshCharacter"
      />

      <!-- Inventory Content -->
      <div
        data-testid="inventory-layout"
        class="grid lg:grid-cols-2 gap-6 mt-6"
      >
        <!-- Left Column: Item Table -->
        <div class="space-y-4">
          <!-- Header Row: Title + Action Buttons -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Items
              <span class="text-gray-400 dark:text-gray-500 font-normal">
                ({{ itemCount }})
              </span>
            </h2>
            <div
              v-if="canEdit"
              class="flex gap-2"
            >
              <UButton
                data-testid="add-loot-btn"
                size="sm"
                icon="i-heroicons-plus"
                @click="isAddLootOpen = true"
              >
                Add Loot
              </UButton>
              <UButton
                data-testid="shop-btn"
                size="sm"
                variant="outline"
                icon="i-heroicons-shopping-cart"
                @click="isShopOpen = true"
              >
                Shop
              </UButton>
            </div>
          </div>

          <!-- Search Bar -->
          <UInput
            v-model="searchQuery"
            data-testid="item-search"
            placeholder="Search items..."
            icon="i-heroicons-magnifying-glass"
          />

          <!-- Item Table (grouped) -->
          <CharacterInventoryItemTable
            data-testid="item-table"
            :items="equipment"
            :editable="canEdit"
            :search-query="searchQuery"
            @item-click="handleItemClick"
            @equip="handleEquip"
            @equip-with-picker="handleEquipWithPicker"
            @unequip="handleUnequip"
            @increment-qty="handleIncrementQty"
            @decrement-qty="handleDecrementQty"
            @sell="handleSell"
            @drop="handleDrop"
            @edit-qty="handleEditQty"
            @attune="handleAttune"
            @break-attune="handleBreakAttune"
          />
        </div>

        <!-- Right Column: Sidebar (sticky on desktop) -->
        <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <!-- Currency Manager (self-contained with modal) -->
          <CharacterSheetCurrencyManager :editable="canEdit" />

          <!-- Equipment Status -->
          <CharacterInventoryEquipmentStatus
            :equipment="equipment"
            @item-click="handleSidebarItemClick"
          />

          <!-- Encumbrance Bar -->
          <CharacterInventoryEncumbranceBar
            v-if="stats?.carrying_capacity"
            :current-weight="currentWeight"
            :carrying-capacity="stats.carrying_capacity"
            :public-id="publicId"
          />
        </div>
      </div>
    </template>

    <!-- Item Detail Modal -->
    <CharacterInventoryItemDetailModal
      :open="isItemDetailOpen"
      :item="selectedItem"
      @update:open="isItemDetailOpen = $event"
    />

    <!-- Add Loot Modal -->
    <CharacterInventoryAddLootModal
      v-model:open="isAddLootOpen"
      :loading="isAddingItem"
      @add="handleAddLoot"
    />

    <!-- Shop Modal -->
    <CharacterInventoryShopModal
      v-model:open="isShopOpen"
      :currency="playStateStore.currency"
      :loading="isPurchasing"
      @purchase="handlePurchase"
    />

    <!-- Sell Modal -->
    <CharacterInventorySellModal
      :open="isSellModalOpen"
      :item="selectedItem"
      :currency="playStateStore.currency"
      :loading="isSelling"
      @update:open="isSellModalOpen = $event"
      @sell="handleSellConfirm"
    />

    <!-- Edit Quantity Modal -->
    <CharacterInventoryEditQuantityModal
      :open="isEditQtyModalOpen"
      :item="selectedItem"
      :loading="isUpdatingQty"
      @update:open="isEditQtyModalOpen = $event"
      @update-quantity="handleEditQtyConfirm"
    />

    <!-- Drop Confirmation Modal -->
    <CharacterInventoryDropConfirmModal
      :open="isDropConfirmOpen"
      :item-name="itemToDrop?.custom_name || (itemToDrop?.item as any)?.name || 'Item'"
      :loading="isDropping"
      @update:open="isDropConfirmOpen = $event"
      @confirm="handleDropConfirm"
    />

    <!-- Slot Picker Modal -->
    <CharacterInventoryEquipSlotPickerModal
      v-model:open="isSlotPickerOpen"
      :item-name="slotPickerItem?.custom_name || (slotPickerItem?.item as any)?.name || 'Item'"
      :valid-slots="slotPickerValidSlots"
      :suggested-slot="slotPickerSuggestedSlot"
      :loading="isEquipping"
      @select="handleSlotSelected"
    />
  </div>
</template>

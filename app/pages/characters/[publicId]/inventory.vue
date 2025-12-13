<!-- app/pages/characters/[publicId]/inventory.vue -->
<script setup lang="ts">
/**
 * Inventory Management Page
 *
 * Full inventory UI with item actions, equipment status sidebar,
 * add loot/shop modals, and optional encumbrance tracking.
 *
 * Uses CharacterPageHeader for unified header with play mode, inspiration, etc.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { Character, CharacterEquipment, CharacterCurrency } from '~/types/character'
import type { CurrencyDelta } from '~/components/character/sheet/CurrencyEditModal.vue'
import { logger } from '~/utils/logger'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const toast = useToast()
const { apiFetch } = useApi()

// Reference to PageHeader to access isPlayMode
const pageHeaderRef = ref<{ isPlayMode: boolean } | null>(null)
const isPlayMode = computed(() => pageHeaderRef.value?.isPlayMode ?? false)

// Modal state
const isAddLootOpen = ref(false)
const isShopOpen = ref(false)
const isCurrencyModalOpen = ref(false)
const isAddingItem = ref(false)
const isPurchasing = ref(false)
const isCurrencyLoading = ref(false)
const currencyError = ref<string | null>(null)

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

// Fetch stats for carrying capacity and spellcaster check
const { data: statsData, pending: statsPending } = await useAsyncData(
  `inventory-stats-${publicId.value}`,
  () => apiFetch<{ data: { carrying_capacity?: number; push_drag_lift?: number; spellcasting?: unknown } }>(
    `/characters/${publicId.value}/stats`
  )
)

const loading = computed(() => characterPending.value || equipmentPending.value || statsPending.value)
const character = computed(() => characterData.value?.data ?? null)
const currency = computed(() => character.value?.currency ?? null)
const equipment = computed(() => equipmentData.value?.data ?? [])
const stats = computed(() => statsData.value?.data ?? null)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)

// Calculate total weight of all equipment
const currentWeight = computed(() => {
  const total = equipment.value.reduce((sum, item) => {
    const itemData = item.item as { weight?: string | number } | null
    const weight = parseFloat(String(itemData?.weight ?? 0)) || 0
    return sum + (weight * item.quantity)
  }, 0)
  return Math.round(total * 100) / 100
})

// Handle clicking an item in the sidebar (scroll to it in list)
function handleItemClick(itemId: number) {
  const element = document.querySelector(`[data-item-id="${itemId}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Inventory actions composable
const {
  equipItem,
  unequipItem,
  addItem,
  dropItem,
  purchaseItem
} = useInventoryActions(publicId)

// Item action handlers
async function handleEquip(itemId: number, slot: string) {
  try {
    await equipItem(itemId, slot as 'main_hand' | 'off_hand' | 'worn' | 'attuned')
    toast.add({ title: 'Item equipped!', color: 'success' })
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to equip item:', error)
    toast.add({ title: 'Failed to equip item', color: 'error' })
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

function handleSell(_itemId: number) {
  toast.add({ title: 'Sell modal coming soon', color: 'info' })
}

async function handleDrop(itemId: number) {
  try {
    await dropItem(itemId)
    toast.add({ title: 'Item dropped', color: 'success' })
    await refreshEquipment()
  } catch (error) {
    logger.error('Failed to drop item:', error)
    toast.add({ title: 'Failed to drop item', color: 'error' })
  }
}

function handleEditQty(_itemId: number) {
  toast.add({ title: 'Edit quantity coming soon', color: 'info' })
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
    const err = error as { statusCode?: number; data?: { message?: string } }
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

// Currency edit handler
async function handleCurrencyUpdate(payload: CurrencyDelta) {
  isCurrencyLoading.value = true
  currencyError.value = null
  try {
    await apiFetch(`/characters/${publicId.value}/currency`, {
      method: 'PATCH',
      body: payload
    })
    toast.add({ title: 'Currency updated!', color: 'success' })
    isCurrencyModalOpen.value = false
    await refreshCharacter()
  } catch (error: unknown) {
    const err = error as { statusCode?: number; data?: { message?: string } }
    if (err.statusCode === 422) {
      currencyError.value = err.data?.message || 'Insufficient funds'
    } else {
      logger.error('Failed to update currency:', error)
      currencyError.value = 'Failed to update currency'
    }
  } finally {
    isCurrencyLoading.value = false
  }
}

function handleCurrencyClick() {
  if (!isPlayMode.value) return
  isCurrencyModalOpen.value = true
}

function handleClearCurrencyError() {
  currencyError.value = null
}

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Inventory` : 'Inventory'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <div class="grid lg:grid-cols-[1fr_280px] gap-6">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="character">
      <!-- Unified Page Header (back button, play mode, portrait, tabs) -->
      <CharacterPageHeader
        ref="pageHeaderRef"
        :character="character"
        :is-spellcaster="isSpellcaster"
        :back-to="`/characters/${publicId}`"
        back-label="Back to Character"
        @updated="refreshCharacter"
      />

      <!-- Inventory Content -->
      <div
        data-testid="inventory-layout"
        class="grid lg:grid-cols-[1fr_280px] gap-6 mt-6"
      >
        <!-- Left Column: Item List -->
        <div class="space-y-4">
          <!-- Item List (includes its own search) -->
          <CharacterInventoryItemList
            data-testid="item-list"
            :items="equipment"
            :editable="isPlayMode"
            @equip="handleEquip"
            @unequip="handleUnequip"
            @sell="handleSell"
            @drop="handleDrop"
            @edit-qty="handleEditQty"
          />

          <!-- Action Buttons (only visible in play mode) -->
          <div
            v-if="isPlayMode"
            class="flex gap-3"
          >
            <UButton
              data-testid="add-loot-btn"
              icon="i-heroicons-plus"
              @click="isAddLootOpen = true"
            >
              Add Loot
            </UButton>
            <UButton
              data-testid="shop-btn"
              variant="outline"
              icon="i-heroicons-shopping-cart"
              @click="isShopOpen = true"
            >
              Shop
            </UButton>
          </div>
        </div>

        <!-- Right Column: Sidebar (sticky on desktop) -->
        <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <!-- Equipment Status -->
          <CharacterInventoryEquipmentStatus
            :equipment="equipment"
            @item-click="handleItemClick"
          />

          <!-- Currency Display -->
          <CharacterSheetStatCurrency
            :currency="currency"
            :editable="isPlayMode"
            @click="handleCurrencyClick"
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

    <!-- Add Loot Modal -->
    <CharacterInventoryAddLootModal
      v-model:open="isAddLootOpen"
      :loading="isAddingItem"
      @add="handleAddLoot"
    />

    <!-- Shop Modal -->
    <CharacterInventoryShopModal
      v-model:open="isShopOpen"
      :currency="currency"
      :loading="isPurchasing"
      @purchase="handlePurchase"
    />

    <!-- Currency Edit Modal -->
    <CharacterSheetCurrencyEditModal
      data-testid="currency-edit-modal"
      :open="isCurrencyModalOpen"
      :currency="currency"
      :loading="isCurrencyLoading"
      :error="currencyError"
      @update:open="isCurrencyModalOpen = $event"
      @apply="handleCurrencyUpdate"
      @clear-error="handleClearCurrencyError"
    />
  </div>
</template>

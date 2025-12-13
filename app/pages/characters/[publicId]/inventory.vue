<!-- app/pages/characters/[publicId]/inventory.vue -->
<script setup lang="ts">
/**
 * Inventory Management Page
 *
 * Full inventory UI with item actions, equipment status sidebar,
 * add loot/shop modals, and optional encumbrance tracking.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { CharacterEquipment, CharacterCurrency } from '~/types/character'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const toast = useToast()

// Modal state
const isAddLootOpen = ref(false)
const isShopOpen = ref(false)
const isAddingItem = ref(false)
const isPurchasing = ref(false)

// Play mode toggle (synced with localStorage)
const isPlayMode = ref(false)
const playModeKey = computed(() => `play-mode-${publicId.value}`)

onMounted(() => {
  const saved = localStorage.getItem(playModeKey.value)
  if (saved === 'true') {
    isPlayMode.value = true
  }
})

watch(isPlayMode, (newValue) => {
  localStorage.setItem(playModeKey.value, String(newValue))
})

// Fetch character data for page context (includes currency)
const { apiFetch } = useApi()
const { data: characterData, pending: characterPending, refresh: refreshCharacter } = await useAsyncData(
  `inventory-character-${publicId.value}`,
  () => apiFetch<{ data: { id: number, name: string, public_id: string, currency: CharacterCurrency } }>(`/characters/${publicId.value}`)
)

// Fetch equipment data
const { data: equipmentData, pending: equipmentPending, refresh: refreshEquipment } = await useAsyncData(
  `inventory-equipment-${publicId.value}`,
  () => apiFetch<{ data: CharacterEquipment[] }>(`/characters/${publicId.value}/equipment`)
)

// Fetch stats for carrying capacity
const { data: statsData, pending: statsPending } = await useAsyncData(
  `inventory-stats-${publicId.value}`,
  () => apiFetch<{ data: { carrying_capacity?: number, push_drag_lift?: number, spellcasting?: unknown } }>(
    `/characters/${publicId.value}/stats`
  )
)

const loading = computed(() => characterPending.value || equipmentPending.value || statsPending.value)
const currency = computed(() => characterData.value?.data?.currency ?? null)
const character = computed(() => characterData.value?.data ?? null)
const equipment = computed(() => equipmentData.value?.data ?? [])
const stats = computed(() => statsData.value?.data ?? null)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)

// Calculate total weight of all equipment (rounded to 2 decimal places)
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
  // TODO: Scroll to item in list
  const element = document.querySelector(`[data-item-id="${itemId}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Item action handlers (Phase 5 will add the API calls)
function handleEquip(itemId: number, slot: string) {
  toast.add({ title: `Equip to ${slot} - Coming soon!`, color: 'info' })
  // TODO: Call useInventoryActions.equipItem(itemId, slot)
}

function handleUnequip(itemId: number) {
  toast.add({ title: 'Unequip - Coming soon!', color: 'info' })
  // TODO: Call useInventoryActions.unequipItem(itemId)
}

function handleSell(itemId: number) {
  toast.add({ title: 'Sell - Coming soon!', color: 'info' })
  // TODO: Open sell modal
}

function handleDrop(itemId: number) {
  toast.add({ title: 'Drop - Coming soon!', color: 'info' })
  // TODO: Call useInventoryActions.dropItem(itemId)
}

function handleEditQty(itemId: number) {
  toast.add({ title: 'Edit quantity - Coming soon!', color: 'info' })
  // TODO: Open quantity edit modal
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
    // TODO: Phase 5 will add the actual API call
    // await apiFetch(`/characters/${publicId.value}/equipment`, {
    //   method: 'POST',
    //   body: payload
    // })

    const itemName = payload.custom_name || payload.item_slug?.split(':')[1] || 'item'
    toast.add({
      title: 'Item Added!',
      description: `Added ${payload.quantity}x ${itemName} to inventory`,
      color: 'success'
    })

    isAddLootOpen.value = false
    await refreshEquipment()
  } catch (error) {
    toast.add({
      title: 'Failed to add item',
      color: 'error'
    })
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
    // TODO: Phase 5 will add the actual API call
    // await apiFetch(`/characters/${publicId.value}/equipment/purchase`, {
    //   method: 'POST',
    //   body: payload
    // })

    const itemName = payload.item_slug.split(':')[1] || 'item'
    const goldCost = (payload.total_cost_cp / 100).toFixed(2)
    toast.add({
      title: 'Purchase Complete!',
      description: `Bought ${payload.quantity}x ${itemName} for ${goldCost} gp`,
      color: 'success'
    })

    isShopOpen.value = false
    await Promise.all([refreshEquipment(), refreshCharacter()])
  } catch (error) {
    toast.add({
      title: 'Purchase failed',
      color: 'error'
    })
  } finally {
    isPurchasing.value = false
  }
}

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Inventory` : 'Inventory'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Back Link -->
    <div class="mb-4">
      <UButton
        :to="`/characters/${publicId}`"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        Back to Character
      </UButton>
    </div>

    <!-- Tab Navigation -->
    <CharacterTabNavigation
      data-testid="tab-navigation"
      :public-id="publicId"
      :is-spellcaster="isSpellcaster"
    />

    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-12 w-full" />
      <div class="grid lg:grid-cols-[1fr_280px] gap-6">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>
    </div>

    <!-- Main Content -->
    <div
      v-else
      data-testid="inventory-layout"
      class="grid lg:grid-cols-[1fr_280px] gap-6"
    >
      <!-- Left Column: Item List -->
      <div class="space-y-4">
        <!-- Header with title and play mode toggle -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ character?.name }}'s Inventory
          </h1>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Play Mode</span>
            <USwitch
              v-model="isPlayMode"
              data-testid="play-mode-toggle"
              color="primary"
            />
          </div>
        </div>

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

        <!-- Currency -->
        <CharacterSheetCurrencyCard
          data-testid="currency-card"
          :currency="currency"
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
  </div>
</template>

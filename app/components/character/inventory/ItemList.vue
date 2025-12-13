<!-- app/components/character/inventory/ItemList.vue -->
<script setup lang="ts">
/**
 * Item List Component
 *
 * Renders a searchable, filterable list of inventory items using ItemRow components.
 * Items are rendered in the order provided (backend handles sorting).
 *
 * Features:
 * - Search filtering by item name
 * - Item count display
 * - Empty states for no items and no search matches
 * - Event forwarding from ItemRow to parent
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { CharacterEquipment } from '~/types/character'

interface Props {
  items: CharacterEquipment[]
  editable: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'equip': [itemId: number, slot: string]
  'unequip': [itemId: number]
  'sell': [itemId: number]
  'drop': [itemId: number]
  'edit-qty': [itemId: number]
}>()

// Search state
const searchQuery = ref('')

// Get the display name for an item (for search matching)
function getItemName(equipment: CharacterEquipment): string {
  if (equipment.custom_name) return equipment.custom_name
  const item = equipment.item as { name?: string } | null
  return item?.name ?? ''
}

// Filter items by search query
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.items

  const query = searchQuery.value.toLowerCase().trim()
  return props.items.filter(item => {
    const name = getItemName(item).toLowerCase()
    return name.includes(query)
  })
})

// Determine which empty state to show
const showEmptyState = computed(() => props.items.length === 0)
const showEmptySearch = computed(() =>
  props.items.length > 0 && filteredItems.value.length === 0
)

// Item count display
const itemCountText = computed(() => {
  const total = props.items.length
  const filtered = filteredItems.value.length

  if (searchQuery.value.trim()) {
    return `${filtered} of ${total}`
  }

  return `${total} item${total === 1 ? '' : 's'}`
})

// Event handlers - forward from ItemRow
function handleEquip(itemId: number, slot: string) {
  emit('equip', itemId, slot)
}

function handleUnequip(itemId: number) {
  emit('unequip', itemId)
}

function handleSell(itemId: number) {
  emit('sell', itemId)
}

function handleDrop(itemId: number) {
  emit('drop', itemId)
}

function handleEditQty(itemId: number) {
  emit('edit-qty', itemId)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="flex items-center gap-3">
      <UInput
        v-model="searchQuery"
        data-testid="item-search"
        placeholder="Search items..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {{ itemCountText }}
      </span>
    </div>

    <!-- Empty State: No items at all -->
    <div
      v-if="showEmptyState"
      data-testid="empty-state"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center"
    >
      <UIcon
        name="i-heroicons-cube"
        class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
      />
      <p class="text-gray-500 dark:text-gray-400">
        No items in inventory
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
        Add items using the buttons below
      </p>
    </div>

    <!-- Empty State: No search matches -->
    <div
      v-else-if="showEmptySearch"
      data-testid="empty-search"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
      />
      <p class="text-gray-500 dark:text-gray-400">
        No items match "{{ searchQuery }}"
      </p>
      <UButton
        variant="ghost"
        size="sm"
        class="mt-2"
        @click="searchQuery = ''"
      >
        Clear search
      </UButton>
    </div>

    <!-- Item List -->
    <div
      v-else
      class="space-y-2"
    >
      <CharacterInventoryItemRow
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :editable="editable"
        @equip="handleEquip"
        @unequip="handleUnequip"
        @sell="handleSell"
        @drop="handleDrop"
        @edit-qty="handleEditQty"
      />
    </div>
  </div>
</template>

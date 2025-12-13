<!-- app/components/character/inventory/ItemRow.vue -->
<script setup lang="ts">
/**
 * Item Row Component
 *
 * Expandable row displaying a single inventory item with:
 * - Item name and quantity
 * - Equipped location badge
 * - Expandable details (description, weight, stats)
 * - Action menu (when editable)
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { CharacterEquipment } from '~/types/character'

interface Props {
  item: CharacterEquipment
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

const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// Item data accessors - handle loosely typed item field
const itemData = computed(() => props.item.item as {
  name?: string
  description?: string
  weight?: string
  item_type?: string
  armor_class?: number
  damage?: string
  properties?: string[]
} | null)

const displayName = computed(() => {
  if (props.item.custom_name) return props.item.custom_name
  return itemData.value?.name ?? 'Unknown Item'
})

const description = computed(() => {
  if (props.item.custom_description) return props.item.custom_description
  return itemData.value?.description ?? ''
})

const weight = computed(() => {
  const raw = itemData.value?.weight
  if (!raw) return null
  const num = parseFloat(raw)
  return isNaN(num) ? null : num
})

// Location badge text for equipped items
const locationBadge = computed(() => {
  if (!props.item.equipped) return null
  switch (props.item.location) {
    case 'main_hand': return 'Main Hand'
    case 'off_hand': return 'Off Hand'
    case 'worn': return 'Worn'
    case 'attuned': return 'Attuned'
    default: return null
  }
})

// Icon based on item type
const itemIcon = computed(() => {
  const itemType = itemData.value?.item_type?.toLowerCase() ?? ''
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
})

// Dropdown menu items for quick actions (NuxtUI 4 uses onSelect instead of click)
const actionMenuItems = computed(() => {
  const items = []

  if (props.item.equipped) {
    items.push({
      label: 'Unequip',
      icon: 'i-heroicons-arrow-down-tray',
      onSelect: () => emit('unequip', props.item.id)
    })
  }

  items.push({
    label: 'Edit Qty',
    icon: 'i-heroicons-pencil',
    onSelect: () => emit('edit-qty', props.item.id)
  })

  items.push({
    label: 'Sell',
    icon: 'i-heroicons-currency-dollar',
    onSelect: () => emit('sell', props.item.id)
  })

  items.push({
    label: 'Drop',
    icon: 'i-heroicons-trash',
    onSelect: () => emit('drop', props.item.id)
  })

  return [items]
})
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <!-- Row Header (always visible) -->
    <div
      data-testid="item-row"
      class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      @click="toggleExpand"
    >
      <UIcon
        :name="itemIcon"
        class="w-5 h-5 text-gray-400 flex-shrink-0"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900 dark:text-white truncate">
            {{ displayName }}
          </span>
          <UBadge
            v-if="locationBadge"
            color="primary"
            variant="subtle"
            size="xs"
          >
            {{ locationBadge }}
          </UBadge>
        </div>
      </div>

      <span
        v-if="item.quantity > 1"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        ×{{ item.quantity }}
      </span>

      <!-- Action Menu (dropdown) -->
      <UDropdownMenu
        v-if="editable"
        :items="actionMenuItems"
      >
        <UButton
          data-testid="item-actions"
          variant="ghost"
          icon="i-heroicons-ellipsis-vertical"
          size="xs"
          @click.stop
        />
      </UDropdownMenu>

      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-5 h-5 text-gray-400"
      />
    </div>

    <!-- Expanded Details -->
    <div
      v-if="isExpanded"
      data-testid="item-details"
      class="px-3 pb-3 pt-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
    >
      <p
        v-if="description"
        class="text-sm text-gray-600 dark:text-gray-300 mt-3"
      >
        {{ description }}
      </p>

      <!-- Stats row -->
      <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
        <span v-if="weight">
          Weight: {{ weight }} lb{{ weight !== 1 ? 's' : '' }}
        </span>
        <span v-if="itemData?.damage">
          Damage: {{ itemData.damage }}
        </span>
        <span v-if="itemData?.armor_class">
          AC: {{ itemData.armor_class }}
        </span>
      </div>

      <!-- Action Buttons (when expanded and editable) -->
      <div
        v-if="editable"
        class="flex flex-wrap gap-2 mt-4"
      >
        <UButton
          v-if="item.equipped"
          data-testid="action-unequip"
          size="xs"
          variant="outline"
          @click.stop="emit('unequip', item.id)"
        >
          Unequip
        </UButton>
        <UButton
          v-if="!item.equipped"
          data-testid="action-equip"
          size="xs"
          variant="outline"
          @click.stop="emit('equip', item.id, 'main_hand')"
        >
          Equip
        </UButton>
        <UButton
          data-testid="action-edit-qty"
          size="xs"
          variant="outline"
          @click.stop="emit('edit-qty', item.id)"
        >
          Edit Qty
        </UButton>
        <UButton
          data-testid="action-sell"
          size="xs"
          variant="outline"
          @click.stop="emit('sell', item.id)"
        >
          Sell
        </UButton>
        <UButton
          data-testid="action-drop"
          size="xs"
          variant="outline"
          color="error"
          @click.stop="emit('drop', item.id)"
        >
          Drop
        </UButton>
      </div>
    </div>
  </div>
</template>

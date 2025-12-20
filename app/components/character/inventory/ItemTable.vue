<!-- app/components/character/inventory/ItemTable.vue -->
<script setup lang="ts">
/**
 * Item Table Component
 *
 * Dense grouped table displaying inventory items with inline actions.
 * Items are grouped by type (Weapons, Armor, Consumables, Gear, Miscellaneous).
 * Groups are collapsible and empty groups are hidden.
 *
 * Features:
 * - Equipped items highlighted with left border accent
 * - Inline equip/unequip toggle (equippable items only)
 * - Inline quantity buttons (stackable items only)
 * - Overflow menu for Sell, Drop, Edit Qty
 * - Click row to open detail modal
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-redesign.md
 */

import type { CharacterEquipment } from '~/types/character'
import type { EquipmentSlot } from '~/utils/equipmentSlots'
import {
  getSlotsFromBackend,
  getDefaultSlotFromBackend,
  needsSlotPickerFromBackend,
  guessSlotFromName
} from '~/utils/equipmentSlots'
import { getEquipmentDisplayName, getLocationDisplayText } from '~/utils/inventory'

interface Props {
  items: CharacterEquipment[]
  editable: boolean
  searchQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: ''
})

const emit = defineEmits<{
  'item-click': [item: CharacterEquipment]
  'equip': [itemId: number, slot: string]
  'unequip': [itemId: number]
  'increment-qty': [itemId: number]
  'decrement-qty': [itemId: number]
  'sell': [itemId: number]
  'drop': [itemId: number]
  'edit-qty': [itemId: number]
  'equip-with-picker': [itemId: number, validSlots: EquipmentSlot[], suggestedSlot: EquipmentSlot | null]
  'attune': [itemId: number]
  'break-attune': [itemId: number]
}>()

// Group display order
const GROUP_ORDER = ['Weapons', 'Armor', 'Consumables', 'Gear', 'Miscellaneous'] as const
type ItemGroup = typeof GROUP_ORDER[number]

// Collapsed state for each group (all expanded by default)
// Using object instead of Set for better Vue reactivity
const collapsedGroups = ref<Record<string, boolean>>({})

function toggleGroup(group: string) {
  collapsedGroups.value[group] = !collapsedGroups.value[group]
}

function isGroupCollapsed(group: string): boolean {
  return collapsedGroups.value[group] ?? false
}

// Frontend fallback mapping if backend doesn't provide group field
const ITEM_TYPE_TO_GROUP: Record<string, ItemGroup> = {
  // Weapons
  'Weapon': 'Weapons',
  'Melee Weapon': 'Weapons',
  'Ranged Weapon': 'Weapons',
  'Ammunition': 'Weapons',
  // Armor
  'Light Armor': 'Armor',
  'Medium Armor': 'Armor',
  'Heavy Armor': 'Armor',
  'Shield': 'Armor',
  // Consumables
  'Potion': 'Consumables',
  'Scroll': 'Consumables',
  // Gear
  'Adventuring Gear': 'Gear',
  'Equipment': 'Gear',
  'Tool': 'Gear'
}

// Alias for template usage
const getItemName = getEquipmentDisplayName

// Get item type from item data
function getItemType(equipment: CharacterEquipment): string | null {
  return equipment.item?.item_type ?? null
}

// Get equipment_slot from backend (Issue #589)
// Check both item relation and top-level for flexibility
function getEquipmentSlot(equipment: CharacterEquipment): string | null {
  // Check nested in item relation first
  if (equipment.item?.equipment_slot) return equipment.item.equipment_slot

  // Also check top-level (in case API returns it there)
  return (equipment as { equipment_slot?: string | null }).equipment_slot ?? null
}

// Get the group for an item (backend provides group field directly)
function getItemGroup(equipment: CharacterEquipment): ItemGroup {
  // Backend now provides group field directly on equipment
  const backendGroup = (equipment as { group?: string }).group
  if (backendGroup && GROUP_ORDER.includes(backendGroup as ItemGroup)) {
    return backendGroup as ItemGroup
  }

  // Fallback for legacy data or edge cases
  const itemType = getItemType(equipment)
  if (itemType) {
    const mapped = ITEM_TYPE_TO_GROUP[itemType]
    if (mapped) {
      return mapped
    }
  }

  return 'Miscellaneous'
}

// Check if item requires attunement
function requiresAttunement(equipment: CharacterEquipment): boolean {
  return equipment.item?.requires_attunement === true
}

// Check if item is currently attuned
function isAttuned(equipment: CharacterEquipment): boolean {
  return equipment.is_attuned === true
}

// Check if item can be attuned (requires attunement but not currently attuned)
function canAttune(equipment: CharacterEquipment): boolean {
  return requiresAttunement(equipment) && !isAttuned(equipment)
}

// Check if item is equippable (requires equipment_slot from backend)
// Backend issue: https://github.com/dfox288/ledger-of-heroes/issues/598
function isEquippable(equipment: CharacterEquipment): boolean {
  return !!getEquipmentSlot(equipment)
}

// Check if item is a weapon (needs hand selector)
function isWeapon(equipment: CharacterEquipment): boolean {
  const equipmentSlot = getEquipmentSlot(equipment)
  if (!equipmentSlot) return false

  const upper = equipmentSlot.toUpperCase()
  return upper === 'WEAPON' || upper === 'MAIN_HAND' || upper === 'HAND'
}

// Get equip dropdown items for weapons (hand selector)
function getEquipMenuItems(item: CharacterEquipment) {
  return [[
    {
      label: 'Main Hand',
      icon: 'i-heroicons-hand-raised',
      onSelect: () => emit('equip', item.id, 'main_hand')
    },
    {
      label: 'Off-Hand',
      icon: 'i-heroicons-hand-raised',
      onSelect: () => emit('equip', item.id, 'off_hand')
    }
  ]]
}

// Get equip/unequip button label
// Note: Attunement is now a separate action, so we always use Equip/Unequip
function getEquipLabel(_equipment: CharacterEquipment): string {
  return 'Equip'
}

function getUnequipLabel(_equipment: CharacterEquipment): string {
  return 'Unequip'
}

// Get icon for item type
function getItemIcon(equipment: CharacterEquipment): string {
  const itemType = getItemType(equipment)?.toLowerCase() ?? ''
  if (itemType.includes('weapon') || itemType.includes('melee') || itemType.includes('ranged')) {
    return 'i-heroicons-bolt'
  }
  if (itemType.includes('armor') || itemType.includes('shield')) {
    return 'i-heroicons-shield-check'
  }
  if (itemType.includes('potion')) {
    return 'i-heroicons-beaker'
  }
  if (itemType.includes('scroll')) {
    return 'i-heroicons-document-text'
  }
  return 'i-heroicons-cube'
}

// Get location display text (wrapper to check equipped status)
function getLocationText(equipment: CharacterEquipment): string | null {
  if (!equipment.equipped) return null
  return getLocationDisplayText(equipment.location)
}

// Filter items by search query
const filteredItems = computed(() => {
  if (!props.searchQuery.trim()) return props.items

  const query = props.searchQuery.toLowerCase().trim()
  return props.items.filter((item) => {
    const name = getItemName(item).toLowerCase()
    return name.includes(query)
  })
})

// Group filtered items
const groupedItems = computed(() => {
  const groups: Record<ItemGroup, CharacterEquipment[]> = {
    Weapons: [],
    Armor: [],
    Consumables: [],
    Gear: [],
    Miscellaneous: []
  }

  for (const item of filteredItems.value) {
    const group = getItemGroup(item)
    groups[group].push(item)
  }

  return groups
})

// Get non-empty groups in order
const visibleGroups = computed(() => {
  return GROUP_ORDER.filter(group => groupedItems.value[group].length > 0)
})

// Overflow menu items for an item
function getMenuItems(item: CharacterEquipment) {
  const items = []

  // Break attunement option for attuned items
  if (isAttuned(item)) {
    items.push({
      label: 'Break Attunement',
      icon: 'i-heroicons-x-circle',
      onSelect: () => emit('break-attune', item.id)
    })
  }

  // Standard menu items
  items.push(
    {
      label: 'Edit Qty',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => emit('edit-qty', item.id)
    },
    {
      label: 'Sell',
      icon: 'i-heroicons-currency-dollar',
      onSelect: () => emit('sell', item.id)
    },
    {
      label: 'Drop',
      icon: 'i-heroicons-trash',
      onSelect: () => emit('drop', item.id)
    }
  )

  return [items]
}

// Handle equip with smart slot selection (uses backend equipment_slot)
function handleEquip(item: CharacterEquipment) {
  const equipmentSlot = getEquipmentSlot(item)
  if (!equipmentSlot) return // Not equippable

  const itemName = item.custom_name || item.item?.name || ''

  // Check if we need slot picker (rings, weapons)
  if (needsSlotPickerFromBackend(equipmentSlot)) {
    const validSlots = getSlotsFromBackend(equipmentSlot)
    const suggestedSlot = guessSlotFromName(itemName)
    emit('equip-with-picker', item.id, validSlots, suggestedSlot)
    return
  }

  // Auto-equip to default slot
  const defaultSlot = getDefaultSlotFromBackend(equipmentSlot)
  if (defaultSlot) {
    emit('equip', item.id, defaultSlot)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Empty state when no items match search -->
    <div
      v-if="filteredItems.length === 0 && items.length > 0"
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
    </div>

    <!-- Empty state when no items at all -->
    <div
      v-else-if="items.length === 0"
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
        Add items using the buttons above
      </p>
    </div>

    <!-- Grouped item table -->
    <template v-else>
      <div
        v-for="group in visibleGroups"
        :key="group"
        class="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <!-- Group header (collapsible) -->
        <button
          :data-testid="`group-header-${group.toLowerCase()}`"
          class="flex items-center gap-2 w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
          @click="toggleGroup(group)"
        >
          <UIcon
            :name="isGroupCollapsed(group) ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-down'"
            class="w-4 h-4 text-gray-500"
          />
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {{ group }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            ({{ groupedItems[group].length }})
          </span>
        </button>

        <!-- Items in group -->
        <div
          v-show="!isGroupCollapsed(group)"
          class="divide-y divide-gray-100 dark:divide-gray-800"
        >
          <div
            v-for="item in groupedItems[group]"
            :key="item.id"
            :data-item-id="item.id"
            :data-testid="`item-row-${item.id}`"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'border-l-3 border-primary bg-primary-50 dark:bg-primary-900/40': item.equipped }"
            @click="emit('item-click', item)"
          >
            <!-- Quantity -->
            <span
              v-if="item.quantity > 1"
              class="text-sm font-medium text-gray-600 dark:text-gray-400 w-8 text-right"
            >
              {{ item.quantity }}×
            </span>
            <span
              v-else
              class="w-8"
            />

            <!-- Icon -->
            <UIcon
              :name="getItemIcon(item)"
              class="w-5 h-5 text-gray-400 flex-shrink-0"
            />

            <!-- Name -->
            <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ getItemName(item) }}
            </span>

            <!-- Location badge -->
            <UBadge
              v-if="getLocationText(item)"
              color="primary"
              variant="subtle"
              size="sm"
            >
              {{ getLocationText(item) }}
            </UBadge>
            <span
              v-else
              class="w-16"
            />

            <!-- Attunement badge -->
            <UBadge
              v-if="isAttuned(item)"
              :data-testid="`attuned-badge-${item.id}`"
              color="spell"
              variant="subtle"
              size="sm"
            >
              Attuned
            </UBadge>

            <!-- Actions (only in edit mode) -->
            <div
              v-if="editable"
              class="flex items-center gap-1"
              @click.stop
            >
              <!-- Unequip button (for equipped items) -->
              <UButton
                v-if="isEquippable(item) && item.equipped"
                data-testid="action-unequip"
                size="xs"
                variant="ghost"
                color="primary"
                @click="emit('unequip', item.id)"
              >
                {{ getUnequipLabel(item) }}
              </UButton>

              <!-- Equip dropdown for weapons (hand selector) -->
              <UDropdownMenu
                v-else-if="isWeapon(item)"
                :items="getEquipMenuItems(item)"
              >
                <UButton
                  data-testid="action-equip"
                  size="xs"
                  variant="ghost"
                  trailing-icon="i-heroicons-chevron-down"
                >
                  Equip
                </UButton>
              </UDropdownMenu>

              <!-- Direct equip button for non-weapons (armor, shield, rings, wondrous) -->
              <UButton
                v-else-if="isEquippable(item)"
                data-testid="action-equip"
                size="xs"
                variant="ghost"
                @click="handleEquip(item)"
              >
                {{ getEquipLabel(item) }}
              </UButton>

              <!-- Attune button for items that can be attuned (equipped or not) -->
              <UButton
                v-if="canAttune(item)"
                data-testid="action-attune"
                size="xs"
                variant="ghost"
                color="spell"
                @click="emit('attune', item.id)"
              >
                Attune
              </UButton>

              <!-- Quantity buttons -->
              <template v-if="item.quantity > 1">
                <UButton
                  data-testid="action-decrement"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-minus"
                  @click="emit('decrement-qty', item.id)"
                />
                <UButton
                  data-testid="action-increment"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-plus"
                  @click="emit('increment-qty', item.id)"
                />
              </template>

              <!-- Overflow menu -->
              <UDropdownMenu :items="getMenuItems(item)">
                <UButton
                  data-testid="action-menu"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-vertical"
                />
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.border-l-3 {
  border-left-width: 3px;
}
</style>

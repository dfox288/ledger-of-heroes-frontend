<!-- app/components/character/inventory/EquipmentPaperdoll.vue -->
<script setup lang="ts">
/**
 * Equipment Paperdoll
 *
 * Visual display of all 12 equipment slots arranged around a character silhouette.
 * Click equipped item → scroll to it in item table.
 */

import type { CharacterEquipment } from '~/types/character'
import { ALL_SLOTS, SLOT_LABELS, type EquipmentSlot } from '~/utils/equipmentSlots'

interface Props {
  equipment: CharacterEquipment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [itemId: number]
}>()

// Get equipped item for a slot
function getEquippedItem(slot: EquipmentSlot): CharacterEquipment | undefined {
  return props.equipment.find(e => e.equipped && e.location === slot)
}

// Get display name for an item
function getItemName(equipment: CharacterEquipment): string {
  if (equipment.custom_name) return equipment.custom_name
  const item = equipment.item as { name?: string } | null
  return item?.name ?? 'Unknown'
}

// Handle click on equipped item
function handleItemClick(item: CharacterEquipment | undefined) {
  if (item) {
    emit('item-click', item.id)
  }
}

// Slot positions for grid layout (row, col)
const slotPositions: Record<EquipmentSlot, { row: number, col: number }> = {
  head: { row: 1, col: 2 },
  neck: { row: 2, col: 2 },
  main_hand: { row: 3, col: 1 },
  armor: { row: 3, col: 2 },
  off_hand: { row: 3, col: 3 },
  cloak: { row: 4, col: 2 },
  clothes: { row: 5, col: 2 },
  hands: { row: 6, col: 1 },
  belt: { row: 6, col: 2 },
  ring_1: { row: 6, col: 3 },
  feet: { row: 7, col: 2 },
  ring_2: { row: 7, col: 3 }
}
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
      Equipment
    </h3>

    <!-- Paperdoll Grid -->
    <div class="grid grid-cols-3 gap-2">
      <template
        v-for="slot in ALL_SLOTS"
        :key="slot"
      >
        <div
          :data-testid="`slot-${slot}`"
          :style="{
            gridRow: slotPositions[slot].row,
            gridColumn: slotPositions[slot].col
          }"
          class="bg-gray-100 dark:bg-gray-700 rounded p-2 min-h-[60px] flex flex-col justify-center"
        >
          <!-- Slot label -->
          <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {{ SLOT_LABELS[slot] }}
          </span>

          <!-- Equipped item or empty -->
          <button
            v-if="getEquippedItem(slot)"
            class="text-xs font-medium text-gray-900 dark:text-white hover:text-primary transition-colors text-left truncate"
            @click="handleItemClick(getEquippedItem(slot))"
          >
            {{ getItemName(getEquippedItem(slot)!) }}
          </button>
          <span
            v-else
            class="text-xs text-gray-400 dark:text-gray-500 italic"
          >
            Empty
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

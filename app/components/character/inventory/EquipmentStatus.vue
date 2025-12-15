<!-- app/components/character/inventory/EquipmentStatus.vue -->
<script setup lang="ts">
/**
 * Equipment Status Sidebar
 *
 * Read-only display of currently equipped items:
 * - Equipment Paperdoll: Visual display of all 12 equipment slots
 * - Attuned: Attuned items with slot counter
 *
 * Clicking an item emits 'item-click' to scroll to it in the item list.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 * @see Issue #649 - Display attunement slots counter
 */

import type { CharacterEquipment, AttunementSlots } from '~/types/character'

interface Props {
  equipment: CharacterEquipment[]
  /** Attunement slot data from character - supports class features that increase max */
  attunement?: AttunementSlots
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [itemId: number]
}>()

// Attuned items: filter by is_attuned boolean (can be in any slot)
const attunedItems = computed(() =>
  props.equipment.filter(e => e.is_attuned === true)
)

// Get attunement slot values (fallback to defaults if not provided)
const attunementUsed = computed(() => props.attunement?.used ?? attunedItems.value.length)
const attunementMax = computed(() => props.attunement?.max ?? 3)
// Uses >= to show warning when at capacity OR over-attuned (e.g., 4/3 from data inconsistency)
const isAtMax = computed(() => attunementUsed.value >= attunementMax.value)

// Helper function
function getItemName(equipment: CharacterEquipment): string {
  if (equipment.custom_name) return equipment.custom_name
  const item = equipment.item as { name?: string } | null
  return item?.name ?? 'Unknown'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Equipment Paperdoll -->
    <CharacterInventoryEquipmentPaperdoll
      :equipment="equipment"
      @item-click="emit('item-click', $event)"
    />

    <!-- Attuned Section -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="w-full text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>Attuned</span>
        <span
          data-testid="attunement-counter"
          :class="[
            'text-sm font-medium',
            isAtMax ? 'text-warning' : 'text-gray-400 dark:text-gray-500'
          ]"
        >
          {{ attunementUsed }}/{{ attunementMax }}
        </span>
      </h3>
      <!-- Attuned items list -->
      <div
        v-if="attunedItems.length > 0"
        class="space-y-2"
      >
        <button
          v-for="item in attunedItems"
          :key="item.id"
          :data-testid="`attuned-item-${item.id}`"
          class="block w-full text-left text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
          @click="emit('item-click', item.id)"
        >
          {{ getItemName(item) }}
        </button>
      </div>
      <!-- Empty state -->
      <span
        v-else
        data-testid="attuned-empty"
        class="text-sm text-gray-400 dark:text-gray-500 italic"
      >
        None
      </span>
    </div>
  </div>
</template>

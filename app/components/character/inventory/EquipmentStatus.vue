<!-- app/components/character/inventory/EquipmentStatus.vue -->
<script setup lang="ts">
/**
 * Equipment Status Sidebar
 *
 * Read-only display of currently equipped items:
 * - Wielded: Main Hand / Off Hand
 * - Armor: Worn armor with AC
 * - Attuned: Up to 3 attuned items
 *
 * Clicking an item emits 'item-click' to scroll to it in the item list.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-tab-design-v2.md
 */

import type { CharacterEquipment } from '~/types/character'

interface Props {
  equipment: CharacterEquipment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [itemId: number]
}>()

// Filter equipped items by location
const mainHand = computed(() =>
  props.equipment.find(e => e.equipped && e.location === 'main_hand')
)

const offHand = computed(() =>
  props.equipment.find(e => e.equipped && e.location === 'off_hand')
)

const wornArmor = computed(() =>
  props.equipment.find(e => e.equipped && e.location === 'worn')
)

const attunedItems = computed(() =>
  props.equipment.filter(e => e.equipped && e.location === 'attuned')
)

// Check if main hand is two-handed
const isTwoHanded = computed(() => {
  if (!mainHand.value) return false
  const item = mainHand.value.item as { properties?: string[] } | null
  return item?.properties?.includes('Two-Handed') ?? false
})

// Helper functions
function getItemName(equipment: CharacterEquipment): string {
  if (equipment.custom_name) return equipment.custom_name
  const item = equipment.item as { name?: string } | null
  return item?.name ?? 'Unknown'
}

function getArmorClass(equipment: CharacterEquipment): number | null {
  const item = equipment.item as { armor_class?: number } | null
  return item?.armor_class ?? null
}
</script>

<template>
  <div class="space-y-4">
    <!-- Wielded Section -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Wielded
      </h3>
      <div class="space-y-2">
        <!-- Main Hand -->
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500 dark:text-gray-400">Main Hand</span>
          <button
            v-if="mainHand"
            data-testid="main-hand-item"
            class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors text-right"
            @click="emit('item-click', mainHand.id)"
          >
            {{ getItemName(mainHand) }}
          </button>
          <span
            v-else
            class="text-sm text-gray-400 dark:text-gray-500 italic"
          >
            Empty
          </span>
        </div>

        <!-- Off Hand -->
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500 dark:text-gray-400">Off Hand</span>
          <button
            v-if="offHand"
            data-testid="off-hand-item"
            class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors text-right"
            @click="emit('item-click', offHand.id)"
          >
            {{ getItemName(offHand) }}
          </button>
          <span
            v-else-if="isTwoHanded"
            class="text-sm text-gray-400 dark:text-gray-500 italic"
          >
            (two-handed)
          </span>
          <span
            v-else
            class="text-sm text-gray-400 dark:text-gray-500 italic"
          >
            Empty
          </span>
        </div>
      </div>
    </div>

    <!-- Armor Section -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Armor
      </h3>
      <div
        v-if="wornArmor"
        class="flex justify-between items-center"
      >
        <button
          data-testid="armor-item"
          class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
          @click="emit('item-click', wornArmor.id)"
        >
          {{ getItemName(wornArmor) }}
        </button>
        <span
          v-if="getArmorClass(wornArmor)"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          AC {{ getArmorClass(wornArmor) }}
        </span>
      </div>
      <span
        v-else
        class="text-sm text-gray-400 dark:text-gray-500 italic"
      >
        No armor
      </span>
    </div>

    <!-- Attuned Section -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Attuned
        <span class="text-gray-400 dark:text-gray-500">({{ attunedItems.length }}/3)</span>
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

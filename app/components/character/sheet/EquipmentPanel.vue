<!-- app/components/character/sheet/EquipmentPanel.vue -->
<script setup lang="ts">
import type { CharacterEquipment } from '~/types/character'

const props = defineProps<{
  equipment: CharacterEquipment[]
  carryingCapacity?: number | null
  pushDragLift?: number | null
}>()

const showCapacities = computed(() => {
  return (props.carryingCapacity !== null && props.carryingCapacity !== undefined)
    || (props.pushDragLift !== null && props.pushDragLift !== undefined)
})

/**
 * Get display name for an equipment item
 * Handles custom_description which may be JSON with a description field
 */
function getItemDisplayName(item: CharacterEquipment): string {
  // First priority: custom name
  if (item.custom_name) {
    return item.custom_name
  }

  // Second priority: linked item name (cast from generic object type)
  const itemData = item.item as { name?: string } | null
  if (itemData?.name) {
    return itemData.name
  }

  // Third priority: parse custom_description (may be JSON)
  if (item.custom_description) {
    try {
      const parsed = JSON.parse(item.custom_description)
      if (typeof parsed === 'object' && parsed.description) {
        return parsed.description
      }
    } catch {
      // Not JSON, use as-is
      return item.custom_description
    }
  }

  return 'Unknown item'
}
</script>

<template>
  <div>
    <div
      v-if="equipment.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No equipment yet
    </div>

    <div v-else>
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="item in equipment"
          :key="item.id"
          class="py-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon
              v-if="item.equipped"
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-success-500"
            />
            <UIcon
              v-else
              name="i-heroicons-minus-circle"
              class="w-5 h-5 text-gray-400"
            />
            <span class="text-gray-900 dark:text-white">
              {{ getItemDisplayName(item) }}
            </span>
          </div>
          <span
            v-if="item.quantity > 1"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            ×{{ item.quantity }}
          </span>
        </li>
      </ul>

      <!-- Carrying Capacities Section -->
      <div
        v-if="showCapacities"
        class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2"
      >
        <div
          v-if="carryingCapacity !== null && carryingCapacity !== undefined"
          class="flex justify-between text-sm"
        >
          <span class="text-gray-600 dark:text-gray-400">Carrying Capacity:</span>
          <span class="text-gray-900 dark:text-white font-medium">{{ carryingCapacity }} lbs</span>
        </div>
        <div
          v-if="pushDragLift !== null && pushDragLift !== undefined"
          class="flex justify-between text-sm"
        >
          <span class="text-gray-600 dark:text-gray-400">Push/Drag/Lift:</span>
          <span class="text-gray-900 dark:text-white font-medium">{{ pushDragLift }} lbs</span>
        </div>
      </div>
    </div>
  </div>
</template>

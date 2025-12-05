<!-- app/components/character/sheet/EquipmentPanel.vue -->
<script setup lang="ts">
import type { CharacterEquipment } from '~/types/character'

defineProps<{
  equipment: CharacterEquipment[]
}>()
</script>

<template>
  <div>
    <div
      v-if="equipment.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No equipment yet
    </div>

    <ul
      v-else
      class="divide-y divide-gray-200 dark:divide-gray-700"
    >
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
            {{ item.item?.name ?? item.description ?? 'Unknown item' }}
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
  </div>
</template>

<!-- app/components/character/wizard/review/ReviewEquipment.vue -->
<script setup lang="ts">
/**
 * Equipment card - displays character's equipment list
 */

import type { CharacterEquipment } from '~/types/character'

defineProps<{
  equipment: CharacterEquipment[] | null
}>()
</script>

<template>
  <UCard :ui="{ body: 'p-4' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-shopping-bag"
          class="w-5 h-5 text-primary"
        />
        <span class="font-semibold text-gray-900 dark:text-white">Equipment</span>
      </div>
    </template>

    <div
      v-if="equipment && equipment.length > 0"
      class="space-y-2"
    >
      <div
        v-for="item in equipment"
        :key="item.id"
        class="flex items-center gap-2 text-sm"
      >
        <UIcon
          name="i-heroicons-cube"
          class="w-4 h-4 text-gray-400 flex-shrink-0"
        />
        <span class="text-gray-700 dark:text-gray-300">
          {{ item.custom_name || item.item?.name || item.custom_description || 'Unknown item' }}
        </span>
        <span
          v-if="item.quantity > 1"
          class="text-gray-500"
        >
          (×{{ item.quantity }})
        </span>
      </div>
    </div>
    <div
      v-else
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      No equipment selected yet.
    </div>
  </UCard>
</template>

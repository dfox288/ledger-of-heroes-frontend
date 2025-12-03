<script setup lang="ts">
import type { components } from '~/types/api/generated'

type EntityItemResource = components['schemas']['EntityItemResource']

interface Props {
  groupName: string
  items: EntityItemResource[]
  selectedId: number | null  // Changed from selectedItemId - uses pivot record ID
}

defineProps<Props>()

const emit = defineEmits<{
  select: [id: number]  // Emit the pivot record ID, not item_id
}>()

function handleSelect(id: number) {
  emit('select', id)
}

/**
 * Get display name for equipment item
 * Uses item name if available, otherwise falls back to description
 */
function getItemDisplayName(item: EntityItemResource): string {
  if (item.item?.name) {
    return item.item.name
  }
  // For compound choices (martial weapon + shield, etc.)
  if (item.description) {
    return item.description
  }
  return 'Unknown item'
}
</script>

<template>
  <div class="space-y-2">
    <h4 class="font-medium text-gray-700 dark:text-gray-300">
      {{ groupName }}
    </h4>

    <div class="space-y-2">
      <button
        v-for="item in items"
        :key="item.id"
        :data-test="`option-${item.id}`"
        type="button"
        class="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
        :class="[
          selectedId === item.id
            ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
        ]"
        @click="handleSelect(item.id)"
      >
        <!-- Radio indicator -->
        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          :class="[
            selectedId === item.id
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-400'
          ]"
        >
          <div
            v-if="selectedId === item.id"
            class="w-2 h-2 rounded-full bg-white"
          />
        </div>

        <!-- Item info -->
        <div>
          <span class="font-medium text-gray-900 dark:text-white">
            {{ getItemDisplayName(item) }}
          </span>
          <span
            v-if="item.quantity > 1 && item.item?.name"
            class="text-gray-500 ml-1"
          >
            (×{{ item.quantity }})
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

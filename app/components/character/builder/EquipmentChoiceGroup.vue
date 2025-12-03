<script setup lang="ts">
import type { components } from '~/types/api/generated'

type EntityItemResource = components['schemas']['EntityItemResource']

interface Props {
  groupName: string
  items: EntityItemResource[]
  selectedItemId: number | null
}

defineProps<Props>()

const emit = defineEmits<{
  select: [itemId: number]
}>()

function handleSelect(itemId: number | null) {
  if (itemId) {
    emit('select', itemId)
  }
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
        :data-test="`option-${item.item_id}`"
        type="button"
        class="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
        :class="[
          selectedItemId === item.item_id
            ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
        ]"
        @click="handleSelect(item.item_id)"
      >
        <!-- Radio indicator -->
        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          :class="[
            selectedItemId === item.item_id
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-400'
          ]"
        >
          <div
            v-if="selectedItemId === item.item_id"
            class="w-2 h-2 rounded-full bg-white"
          />
        </div>

        <!-- Item info -->
        <div>
          <span class="font-medium text-gray-900 dark:text-white">
            {{ item.item?.name }}
          </span>
          <span
            v-if="item.quantity > 1"
            class="text-gray-500 ml-1"
          >
            (×{{ item.quantity }})
          </span>
          <p
            v-if="item.description"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            {{ item.description }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>

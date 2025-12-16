<script setup lang="ts">
/**
 * Equipment Slot Picker Modal
 *
 * Shown when equipping items with multiple valid slots (wondrous items, rings).
 * Pre-selects suggested slot based on item name pattern matching.
 */

import { SLOT_LABELS, type EquipmentSlot } from '~/utils/equipmentSlots'

interface Props {
  itemName: string
  validSlots: EquipmentSlot[]
  suggestedSlot?: EquipmentSlot | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  suggestedSlot: null,
  loading: false
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [slot: EquipmentSlot]
}>()

// Selected slot (defaults to suggested or first valid)
const selectedSlot = ref<EquipmentSlot>(
  props.suggestedSlot ?? props.validSlots[0]!
)

// Reset selection when modal opens with new item
watch(open, (isOpen) => {
  if (isOpen) {
    selectedSlot.value = props.suggestedSlot ?? props.validSlots[0]!
  }
})

function handleCancel() {
  open.value = false
}

function handleEquip() {
  emit('select', selectedSlot.value)
}
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-hand-raised"
          class="w-5 h-5"
        />
        <span>Equip: {{ itemName }}</span>
      </div>
    </template>

    <template #body>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Where do you want to equip this?
      </p>

      <div class="space-y-2">
        <label
          v-for="slot in validSlots"
          :key="slot"
          :data-testid="`slot-option-${slot}`"
          class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
          :class="[
            selectedSlot === slot
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          <input
            v-model="selectedSlot"
            type="radio"
            name="equipment-slot"
            :value="slot"
            class="text-primary focus:ring-primary"
          >
          <span class="font-medium text-gray-900 dark:text-white">
            {{ SLOT_LABELS[slot] }}
          </span>
        </label>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          data-testid="cancel-btn"
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="equip-btn"
          color="primary"
          :loading="loading"
          @click="handleEquip"
        >
          Equip
        </UButton>
      </div>
    </template>
  </UModal>
</template>

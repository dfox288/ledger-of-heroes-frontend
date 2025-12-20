<!-- app/components/character/inventory/EditQuantityModal.vue -->
<script setup lang="ts">
/**
 * Edit Quantity Modal
 *
 * Simple modal for changing the quantity of an inventory item.
 * Shows item name and allows setting a new quantity.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-redesign.md
 */

import type { CharacterEquipment } from '~/types/character'
import { getEquipmentDisplayName, getEquipmentIcon } from '~/utils/inventory'

interface Props {
  item: CharacterEquipment | null
  loading?: boolean
}

interface EditQuantityPayload {
  equipment_id: number
  quantity: number
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  'update-quantity': [payload: EditQuantityPayload]
}>()

// Form state
const newQuantity = ref(1)

// Get item name from equipment (uses shared utility)
const itemName = computed(() => {
  if (!props.item) return ''
  return getEquipmentDisplayName(props.item)
})

// Current quantity
const currentQuantity = computed(() => props.item?.quantity ?? 1)

// Validation
const canSave = computed((): boolean => {
  if (props.loading) return false
  if (!props.item) return false
  if (newQuantity.value < 1) return false
  if (newQuantity.value === currentQuantity.value) return false
  return true
})

// Handle save
function handleSave() {
  if (!canSave.value || !props.item) return

  const payload: EditQuantityPayload = {
    equipment_id: props.item.id,
    quantity: newQuantity.value
  }

  emit('update-quantity', payload)
}

// Handle cancel
function handleCancel() {
  open.value = false
}

// Reset state when modal opens
watch(open, (isOpen) => {
  if (isOpen && props.item) {
    newQuantity.value = props.item.quantity
  }
})

// Update quantity when item changes
watch(() => props.item, (item) => {
  if (item) {
    newQuantity.value = item.quantity
  }
})

// Get item type icon (uses shared utility)
const itemIcon = computed(() => getEquipmentIcon(props.item))
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Quantity
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Item Display -->
        <div
          v-if="item"
          data-testid="edit-qty-item"
          class="space-y-4"
        >
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <UIcon
              :name="itemIcon"
              class="w-5 h-5 text-gray-500"
            />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ itemName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Current quantity: {{ currentQuantity }}
              </p>
            </div>
          </div>

          <!-- Quantity Input -->
          <UFormField
            label="New Quantity"
            class="w-full"
          >
            <UInput
              v-model.number="newQuantity"
              data-testid="quantity-input"
              type="number"
              :min="1"
              size="lg"
              :ui="{ root: 'w-full' }"
            />
          </UFormField>

          <!-- Quick adjust buttons -->
          <div class="flex items-center justify-center gap-2">
            <UButton
              size="sm"
              variant="outline"
              :disabled="newQuantity <= 1"
              @click="newQuantity = Math.max(1, newQuantity - 10)"
            >
              -10
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              :disabled="newQuantity <= 1"
              @click="newQuantity = Math.max(1, newQuantity - 1)"
            >
              -1
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              @click="newQuantity = newQuantity + 1"
            >
              +1
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              @click="newQuantity = newQuantity + 10"
            >
              +10
            </UButton>
          </div>

          <!-- Change indicator -->
          <div
            v-if="newQuantity !== currentQuantity"
            class="text-center text-sm"
          >
            <span class="text-gray-500">{{ currentQuantity }}</span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-4 h-4 mx-2 text-gray-400 inline"
            />
            <span
              :class="newQuantity > currentQuantity ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'"
            >
              {{ newQuantity }}
            </span>
            <span class="text-gray-400 ml-1">
              ({{ newQuantity > currentQuantity ? '+' : '' }}{{ newQuantity - currentQuantity }})
            </span>
          </div>
        </div>

        <!-- No item selected state -->
        <div
          v-else
          class="text-center py-8 text-gray-500"
        >
          No item selected
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="save-btn"
          color="primary"
          :disabled="!canSave"
          :loading="loading"
          @click="handleSave"
        >
          Save
        </UButton>
      </div>
    </template>
  </UModal>
</template>

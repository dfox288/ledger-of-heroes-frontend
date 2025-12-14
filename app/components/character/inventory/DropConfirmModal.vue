<!-- app/components/character/inventory/DropConfirmModal.vue -->
<script setup lang="ts">
/**
 * Drop Item Confirmation Modal
 *
 * Confirmation dialog before dropping (permanently deleting) an item.
 * Warns user this action cannot be undone.
 */

defineProps<{
  open: boolean
  itemName: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

function handleCancel() {
  emit('update:open', false)
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-trash"
          class="w-5 h-5 text-error-500"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Drop Item?
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to drop <strong class="text-gray-900 dark:text-white">{{ itemName }}</strong>?
        </p>

        <div class="flex items-center gap-2 p-3 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-5 h-5 text-error-500 flex-shrink-0"
          />
          <p class="text-sm text-error-700 dark:text-error-300">
            This action <strong>cannot be undone</strong>. The item will be permanently removed from your inventory.
          </p>
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
          data-testid="confirm-btn"
          color="error"
          :loading="loading"
          :disabled="loading"
          @click="handleConfirm"
        >
          {{ loading ? 'Dropping...' : 'Drop Item' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

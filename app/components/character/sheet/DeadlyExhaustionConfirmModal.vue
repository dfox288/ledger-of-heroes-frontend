<!-- app/components/character/sheet/DeadlyExhaustionConfirmModal.vue -->
<script setup lang="ts">
/**
 * Deadly Exhaustion Confirmation Modal
 *
 * Warns the player before incrementing exhaustion to level 6 (death).
 * Requires explicit confirmation since this is an irreversible action.
 */

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
}>()

function handleCancel() {
  open.value = false
}

function handleConfirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-5 h-5 text-red-500"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Deadly Exhaustion Warning
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          You are about to increase exhaustion to <strong class="text-red-600 dark:text-red-400">level 6</strong>.
        </p>

        <div class="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p class="text-sm text-red-700 dark:text-red-300 font-medium">
            Level 6 exhaustion results in death.
          </p>
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">
            This action cannot be undone through normal means.
          </p>
        </div>

        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to continue?
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="confirm-btn"
          color="error"
          @click="handleConfirm"
        >
          Confirm Death
        </UButton>
      </div>
    </template>
  </UModal>
</template>

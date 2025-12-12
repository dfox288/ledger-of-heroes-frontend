<!-- app/components/character/sheet/LongRestConfirmModal.vue -->
<script setup lang="ts">
/**
 * Long Rest Confirmation Modal
 *
 * Simple confirmation dialog before taking a long rest.
 * Shows what will be restored and warns about the action.
 *
 * @see #534 - Rest Actions
 */

defineProps<{
  open: boolean
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
  emit('update:open', false)
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
          name="i-heroicons-moon"
          class="w-5 h-5 text-primary-500"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Take a Long Rest?
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          A long rest takes 8 hours. The following will be restored:
        </p>

        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-success-500"
            />
            HP restored to maximum
          </li>
          <li class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-success-500"
            />
            All spell slots recovered
          </li>
          <li class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-success-500"
            />
            Half of max hit dice recovered
          </li>
          <li class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-success-500"
            />
            Death saves cleared
          </li>
        </ul>
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
          color="primary"
          @click="handleConfirm"
        >
          Take Rest
        </UButton>
      </div>
    </template>
  </UModal>
</template>

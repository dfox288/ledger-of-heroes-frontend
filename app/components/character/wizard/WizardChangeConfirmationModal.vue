<!-- app/components/character/wizard/WizardChangeConfirmationModal.vue -->
<!--
  Reusable confirmation modal content for wizard changes.
  Can be used directly (wraps its own UModal) or just the content slot can be extracted.
-->
<script setup lang="ts">
interface Props {
  /** The modal title */
  title: string
  /** The description message */
  message: string
  /** Confirm button text. Defaults to 'Continue' */
  confirmText?: string
  /** Cancel button text. Defaults to 'Cancel' */
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Continue',
  cancelText: 'Cancel'
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleCancel() {
  emit('cancel')
  open.value = false
}

function handleConfirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div
        data-testid="wizard-confirmation-modal"
        class="p-6"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            data-testid="confirmation-icon-container"
            class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
          >
            <UIcon
              data-testid="confirmation-warning-icon"
              name="i-heroicons-exclamation-triangle"
              class="w-5 h-5 text-amber-600 dark:text-amber-400"
            />
          </div>
          <h3
            data-testid="confirmation-title"
            class="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {{ title }}
          </h3>
        </div>

        <p
          data-testid="confirmation-message"
          class="text-gray-600 dark:text-gray-400 mb-6"
        >
          {{ message }}
        </p>

        <div class="flex justify-end gap-3">
          <UButton
            data-testid="confirmation-cancel-btn"
            variant="outline"
            @click="handleCancel"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            data-testid="confirmation-confirm-btn"
            color="primary"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

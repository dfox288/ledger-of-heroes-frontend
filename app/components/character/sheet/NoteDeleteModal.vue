<!-- app/components/character/sheet/NoteDeleteModal.vue -->
<script setup lang="ts">
/**
 * Delete Note Confirmation Modal
 *
 * Confirmation dialog before permanently deleting a note.
 * Warns user this action cannot be undone.
 */
import type { CharacterNote } from '~/types/character'

defineProps<{
  open: boolean
  note: CharacterNote | null
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
          Delete Note?
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this note?
        </p>

        <!-- Note preview -->
        <div
          v-if="note"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <p
            v-if="note.title"
            class="font-medium text-gray-900 dark:text-white mb-1"
          >
            {{ note.title }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {{ note.content }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ note.category_label }}
          </p>
        </div>

        <!-- Warning box -->
        <div class="flex items-center gap-2 p-3 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-5 h-5 text-error-500 flex-shrink-0"
          />
          <p class="text-sm text-error-700 dark:text-error-300">
            This action <strong>cannot be undone</strong>.
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
          {{ loading ? 'Deleting...' : 'Delete Note' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

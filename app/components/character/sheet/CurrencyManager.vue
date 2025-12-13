<!-- app/components/character/sheet/CurrencyManager.vue -->
<script setup lang="ts">
/**
 * Currency Manager Component
 *
 * Self-contained component for managing character currency.
 * Wraps StatCurrency display + CurrencyEditModal.
 * Reads from and writes to characterPlayState store.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import type { CurrencyDelta } from './CurrencyEditModal.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  editable?: boolean
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

// Modal state
const modalOpen = ref(false)
const error = ref<string | null>(null)

/**
 * Open the edit modal
 */
function openModal() {
  if (!props.editable) return
  modalOpen.value = true
}

/**
 * Handle currency update from modal
 */
async function handleUpdate(payload: CurrencyDelta) {
  error.value = null

  try {
    await store.updateCurrency(payload)
    modalOpen.value = false
    toast.add({
      title: 'Currency updated',
      color: 'success'
    })
  } catch (err: unknown) {
    const apiError = err as { statusCode?: number, data?: { message?: string } }

    if (apiError.statusCode === 422) {
      // Validation error - show in modal
      error.value = apiError.data?.message || 'Insufficient funds'
    } else {
      // Other error - show toast
      toast.add({
        title: 'Failed to update currency',
        color: 'error'
      })
    }
  }
}

/**
 * Clear error when modal reopens
 */
function handleClearError() {
  error.value = null
}

// Clear error when modal opens fresh
watch(modalOpen, (isOpen) => {
  if (isOpen) {
    error.value = null
  }
})
</script>

<template>
  <div>
    <!-- Currency Display -->
    <CharacterSheetStatCurrency
      :currency="store.currency"
      :editable="editable"
      @click="openModal"
    />

    <!-- Edit Modal -->
    <CharacterSheetCurrencyEditModal
      v-model:open="modalOpen"
      :currency="store.currency"
      :loading="store.isUpdatingCurrency"
      :error="error"
      @apply="handleUpdate"
      @clear-error="handleClearError"
    />
  </div>
</template>

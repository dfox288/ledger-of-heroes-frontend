<!-- app/components/character/sheet/CurrencyManager.vue -->
<script setup lang="ts">
/**
 * Currency Manager Component
 *
 * Self-contained component for managing character currency.
 * Wraps StatCurrency display + CurrencyEditModal.
 * Reads from and writes to characterPlayState store.
 *
 * Accepts optional initial currency props for SSR hydration - the store
 * may not be initialized during server render, causing hydration mismatch.
 *
 * @see Issue #584 - Character sheet component refactor
 * @see Issue #623 - Hydration fixes
 */
import type { CurrencyDelta } from './CurrencyEditModal.vue'
import type { CharacterCurrency } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  editable?: boolean
  /** Initial currency for SSR (optional, falls back to store) */
  initialCurrency?: CharacterCurrency
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

/**
 * Currency for display - uses store if initialized, falls back to props for SSR
 */
const displayCurrency = computed(() => {
  if (store.characterId !== null) {
    return store.currency
  }
  if (props.initialCurrency) {
    return props.initialCurrency
  }
  return store.currency
})

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
    <!-- Currency Display (uses display computed for SSR compatibility) -->
    <CharacterSheetStatCurrency
      :currency="displayCurrency"
      :editable="editable"
      @click="openModal"
    />

    <!-- Edit Modal -->
    <CharacterSheetCurrencyEditModal
      v-model:open="modalOpen"
      :currency="displayCurrency"
      :loading="store.isUpdatingCurrency"
      :error="error"
      @apply="handleUpdate"
      @clear-error="handleClearError"
    />
  </div>
</template>

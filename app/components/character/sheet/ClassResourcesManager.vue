<!-- app/components/character/sheet/ClassResourcesManager.vue -->
<script setup lang="ts">
/**
 * Class Resources Manager Component
 *
 * Thin wrapper that delegates to characterPlayState store.
 * Store handles optimistic updates with rollback on error.
 *
 * @see Issue #632 - Class resources
 * @see Issue #696 - Store consolidation
 */
import { storeToRefs } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

defineProps<{
  editable?: boolean
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

const { counters, isDead } = storeToRefs(store)

const isDisabled = computed(() => isDead.value)

/**
 * Check if a counter has a pending update
 */
function isPending(slug: string): boolean {
  return store.isUpdatingCounter(slug)
}

/**
 * Spend a counter use (decrement)
 */
async function handleSpend(slug: string) {
  try {
    await store.useCounter(slug)
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: err.data?.message || 'Failed to update counter',
      color: 'error'
    })
  }
}

/**
 * Restore a counter use (increment)
 */
async function handleRestore(slug: string) {
  try {
    await store.restoreCounter(slug)
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: err.data?.message || 'Failed to update counter',
      color: 'error'
    })
  }
}

// Expose isPending for child components
defineExpose({ isPending })
</script>

<template>
  <CharacterSheetClassResources
    :counters="counters"
    :editable="editable"
    :disabled="isDisabled"
    @spend="handleSpend"
    @restore="handleRestore"
  />
</template>

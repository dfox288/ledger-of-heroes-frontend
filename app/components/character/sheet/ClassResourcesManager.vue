<!-- app/components/character/sheet/ClassResourcesManager.vue -->
<script setup lang="ts">
/**
 * Class Resources Manager Component
 *
 * Handles API calls for spending/restoring class resources.
 * Uses optimistic updates with rollback on error.
 *
 * @see Issue #632
 */
import type { Counter } from '~/types/character'

const props = defineProps<{
  counters: Counter[]
  characterId: number
  editable?: boolean
  isDead?: boolean
}>()

const { apiFetch } = useApi()
const toast = useToast()

// Local reactive copy for optimistic updates
const localCounters = ref<Counter[]>([...props.counters])

// Track pending API requests to prevent race conditions
const pendingUpdates = ref<Set<string>>(new Set())

// Sync when props change (deep copy to avoid mutation issues)
watch(() => props.counters, (newCounters) => {
  localCounters.value = newCounters.map(c => ({ ...c }))
}, { deep: true })

const isDisabled = computed(() => props.isDead)

/**
 * Check if a counter has a pending update
 */
function isPending(slug: string): boolean {
  return pendingUpdates.value.has(slug)
}

/**
 * Spend a counter use (decrement)
 */
async function handleSpend(slug: string) {
  const counter = localCounters.value.find(c => c.slug === slug)
  if (!counter || counter.current <= 0) return
  if (pendingUpdates.value.has(slug)) return // Prevent race condition

  pendingUpdates.value.add(slug)

  // Optimistic update
  counter.current--

  try {
    await apiFetch(`/characters/${props.characterId}/counters/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: { action: 'use' }
    })
  } catch (error: unknown) {
    // Rollback
    counter.current++
    const err = error as { data?: { message?: string } }
    toast.add({
      title: err.data?.message || 'Failed to update counter',
      color: 'error'
    })
  } finally {
    pendingUpdates.value.delete(slug)
  }
}

/**
 * Restore a counter use (increment)
 */
async function handleRestore(slug: string) {
  const counter = localCounters.value.find(c => c.slug === slug)
  if (!counter || counter.current >= counter.max) return
  if (pendingUpdates.value.has(slug)) return // Prevent race condition

  pendingUpdates.value.add(slug)

  // Optimistic update
  counter.current++

  try {
    await apiFetch(`/characters/${props.characterId}/counters/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: { action: 'restore' }
    })
  } catch (error: unknown) {
    // Rollback
    counter.current--
    const err = error as { data?: { message?: string } }
    toast.add({
      title: err.data?.message || 'Failed to update counter',
      color: 'error'
    })
  } finally {
    pendingUpdates.value.delete(slug)
  }
}

// Expose isPending for child components
defineExpose({ isPending })
</script>

<template>
  <CharacterSheetClassResources
    :counters="localCounters"
    :editable="editable"
    :disabled="isDisabled"
    @spend="handleSpend"
    @restore="handleRestore"
  />
</template>

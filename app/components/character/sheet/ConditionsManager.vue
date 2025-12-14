<!-- app/components/character/sheet/ConditionsManager.vue -->
<script setup lang="ts">
/**
 * Conditions Manager Component
 *
 * Self-contained component for managing character conditions.
 * Uses characterPlayState store for all condition operations.
 * Wraps Conditions display + DeadlyExhaustionConfirmModal.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { storeToRefs } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

defineProps<{
  editable?: boolean
}>()

const store = useCharacterPlayStateStore()
const { conditions, isDead, isUpdatingConditions } = storeToRefs(store)
const toast = useToast()

// ===========================================================================
// STATE
// ===========================================================================

/** Deadly exhaustion confirmation modal state */
const showDeadlyExhaustionModal = ref(false)

/** Pending deadly exhaustion data for confirmation */
const pendingDeadlyExhaustion = ref<{
  slug: string
  currentLevel: number
  targetLevel: number
  source: string | null
  duration: string | null
} | null>(null)

// ===========================================================================
// HANDLERS
// ===========================================================================

/**
 * Handle remove condition
 * Uses store action for optimistic update
 */
async function handleRemove(conditionSlug: string) {
  const success = await store.removeCondition(conditionSlug)
  if (success) {
    toast.add({ title: 'Condition removed', color: 'success' })
  } else {
    toast.add({ title: 'Failed to remove condition', color: 'error' })
  }
}

/**
 * Handle exhaustion level update
 * Uses store action
 */
async function handleUpdateLevel(payload: {
  slug: string
  level: number
  source: string | null
  duration: string | null
}) {
  const success = await store.updateExhaustionLevel(payload)
  if (success) {
    toast.add({ title: 'Exhaustion updated', color: 'success' })
  } else {
    toast.add({ title: 'Failed to update exhaustion', color: 'error' })
  }
}

/**
 * Handle deadly exhaustion confirmation request
 * Shows confirmation modal before allowing level 6
 */
function handleDeadlyExhaustionConfirm(payload: {
  slug: string
  currentLevel: number
  targetLevel: number
  source: string | null
  duration: string | null
}) {
  pendingDeadlyExhaustion.value = payload
  showDeadlyExhaustionModal.value = true
}

/**
 * Handle confirmed deadly exhaustion
 * Called when user confirms level 6 in the modal
 */
async function handleDeadlyExhaustionConfirmed() {
  if (!pendingDeadlyExhaustion.value) return

  await handleUpdateLevel({
    slug: pendingDeadlyExhaustion.value.slug,
    level: pendingDeadlyExhaustion.value.targetLevel,
    source: pendingDeadlyExhaustion.value.source,
    duration: pendingDeadlyExhaustion.value.duration
  })

  pendingDeadlyExhaustion.value = null
  showDeadlyExhaustionModal.value = false
}
</script>

<template>
  <div>
    <!-- Conditions Display -->
    <CharacterSheetConditions
      :conditions="conditions"
      :editable="editable && !isUpdatingConditions"
      :is-dead="isDead"
      @remove="handleRemove"
      @update-level="handleUpdateLevel"
      @confirm-deadly-exhaustion="handleDeadlyExhaustionConfirm"
    />

    <!-- Deadly Exhaustion Confirmation Modal -->
    <CharacterSheetDeadlyExhaustionConfirmModal
      v-model:open="showDeadlyExhaustionModal"
      @confirm="handleDeadlyExhaustionConfirmed"
    />
  </div>
</template>

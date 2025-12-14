<!-- app/components/character/sheet/ConditionsManager.vue -->
<script setup lang="ts">
/**
 * Conditions Manager Component
 *
 * Self-contained component for managing character conditions.
 * Wraps Conditions display + DeadlyExhaustionConfirmModal.
 * Handles API calls and emits refresh event for the page to update data.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import type { CharacterCondition } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  conditions: CharacterCondition[]
  characterId: number
  editable?: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const store = useCharacterPlayStateStore()
const { apiFetch } = useApi()
const toast = useToast()

// ===========================================================================
// STATE
// ===========================================================================

/** Prevents race conditions from rapid condition updates */
const isUpdating = ref(false)

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
 * DELETEs condition from backend
 */
async function handleRemove(conditionSlug: string) {
  if (isUpdating.value) return

  isUpdating.value = true

  try {
    await apiFetch(`/characters/${props.characterId}/conditions/${conditionSlug}`, {
      method: 'DELETE'
    })
    emit('refresh')
    toast.add({
      title: 'Condition removed',
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to remove condition:', err)
    toast.add({
      title: 'Failed to remove condition',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

/**
 * Handle exhaustion level update
 * POSTs updated level to backend (upsert behavior)
 * Preserves source and duration from the original condition
 */
async function handleUpdateLevel(payload: {
  slug: string
  level: number
  source: string | null
  duration: string | null
}) {
  if (isUpdating.value) return

  isUpdating.value = true

  try {
    await apiFetch(`/characters/${props.characterId}/conditions`, {
      method: 'POST',
      body: {
        condition: payload.slug,
        level: payload.level,
        source: payload.source ?? '',
        duration: payload.duration ?? ''
      }
    })
    emit('refresh')
    toast.add({
      title: 'Exhaustion updated',
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to update exhaustion level:', err)
    toast.add({
      title: 'Failed to update exhaustion',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

/**
 * Handle deadly exhaustion confirmation request
 * Shows confirmation modal before allowing level 6
 * Preserves source and duration for when confirmation is accepted
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
 * Passes through source and duration from pending data
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
      :editable="editable"
      :is-dead="store.isDead"
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

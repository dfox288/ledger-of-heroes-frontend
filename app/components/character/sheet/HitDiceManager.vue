<!-- app/components/character/sheet/HitDiceManager.vue -->
<script setup lang="ts">
/**
 * Hit Dice Manager Component
 *
 * Self-contained component for managing hit dice and rest actions.
 * Wraps HitDice display + LongRestConfirmModal.
 * Handles API calls and emits refresh events for the page to update data.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  hitDice: { die: string, total: number, current: number }[]
  characterId: number
  editable?: boolean
}>()

const emit = defineEmits<{
  'refresh-hit-dice': []
  'refresh-short-rest': []
  'refresh-long-rest': []
}>()

const store = useCharacterPlayStateStore()
const { apiFetch } = useApi()
const toast = useToast()

// ===========================================================================
// STATE
// ===========================================================================

/** Prevents race conditions from rapid rest/spend actions */
const isResting = ref(false)

/** Long rest confirmation modal state */
const showLongRestModal = ref(false)

// ===========================================================================
// API RESPONSE TYPES
// ===========================================================================

interface ShortRestResponse {
  data: {
    pact_magic_reset: boolean
    features_reset: string[]
  }
}

interface LongRestResponse {
  data: {
    hp_restored: number
    hit_dice_recovered: number
    spell_slots_reset: boolean
    death_saves_cleared: boolean
    features_reset: string[]
  }
}

// ===========================================================================
// HANDLERS
// ===========================================================================

/**
 * Handle spending a hit die
 * Just marks the die as spent - player rolls physical dice
 */
async function handleSpend({ dieType }: { dieType: string }) {
  if (isResting.value) return

  isResting.value = true

  try {
    await apiFetch(`/characters/${props.characterId}/hit-dice/spend`, {
      method: 'POST',
      body: { die_type: dieType, quantity: 1 }
    })
    emit('refresh-hit-dice')
  } catch (err) {
    logger.error('Failed to spend hit die:', err)
    toast.add({
      title: 'Failed to spend hit die',
      color: 'error'
    })
  } finally {
    isResting.value = false
  }
}

/**
 * Handle short rest
 * Resets short-rest features (Action Surge, pact slots, etc.)
 */
async function handleShortRest() {
  if (isResting.value) return

  isResting.value = true

  try {
    const response = await apiFetch<ShortRestResponse>(`/characters/${props.characterId}/short-rest`, {
      method: 'POST'
    })
    emit('refresh-short-rest')

    // Build toast message
    const resetCount = response.data.features_reset.length
    const message = resetCount > 0
      ? `${resetCount} feature${resetCount > 1 ? 's' : ''} reset`
      : 'Short rest complete'
    toast.add({
      title: message,
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to take short rest:', err)
    toast.add({
      title: 'Failed to take short rest',
      color: 'error'
    })
  } finally {
    isResting.value = false
  }
}

/**
 * Handle long rest (after confirmation)
 * Restores HP, spell slots, hit dice, clears death saves
 */
async function handleLongRest() {
  if (isResting.value) return

  isResting.value = true

  try {
    const response = await apiFetch<LongRestResponse>(`/characters/${props.characterId}/long-rest`, {
      method: 'POST'
    })
    emit('refresh-long-rest')
    showLongRestModal.value = false

    // Build toast message
    const parts: string[] = []
    if (response.data.hp_restored > 0) parts.push(`${response.data.hp_restored} HP restored`)
    if (response.data.hit_dice_recovered > 0) parts.push(`${response.data.hit_dice_recovered} hit dice recovered`)
    if (response.data.spell_slots_reset) parts.push('spell slots reset')

    toast.add({
      title: 'Long rest complete',
      description: parts.join(', ') || undefined,
      color: 'success'
    })
  } catch (err) {
    logger.error('Failed to take long rest:', err)
    showLongRestModal.value = false
    toast.add({
      title: 'Failed to take long rest',
      color: 'error'
    })
  } finally {
    isResting.value = false
  }
}

/**
 * Open long rest confirmation modal
 */
function openLongRestModal() {
  showLongRestModal.value = true
}
</script>

<template>
  <div>
    <!-- Hit Dice Display -->
    <CharacterSheetHitDice
      :hit-dice="hitDice"
      :editable="editable"
      :disabled="isResting"
      :is-dead="store.isDead"
      @spend="handleSpend"
      @short-rest="handleShortRest"
      @long-rest="openLongRestModal"
    />

    <!-- Long Rest Confirmation Modal -->
    <CharacterSheetLongRestConfirmModal
      v-model:open="showLongRestModal"
      @confirm="handleLongRest"
    />
  </div>
</template>

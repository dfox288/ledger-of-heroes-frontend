<!-- app/components/character/sheet/DeathSavesManager.vue -->
<script setup lang="ts">
/**
 * Death Saves Manager Component
 *
 * Self-contained component for managing death saving throws.
 * Wraps DeathSaves display component.
 * Derives editability from store state (HP must be 0, not dead).
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  editable?: boolean
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

/**
 * Derived editability
 * Death saves can only be edited when:
 * - Parent says editable (play mode + alive)
 * - Character is at exactly 0 HP (D&D rule)
 * - Character is not dead
 */
const canEdit = computed(() => {
  return props.editable === true
    && store.hitPoints.current === 0
    && !store.isDead
})

/**
 * Handle death save update
 */
async function handleUpdate(field: 'successes' | 'failures', value: number) {
  try {
    await store.updateDeathSaves(field, value)
  } catch {
    toast.add({
      title: 'Failed to save',
      description: 'Could not update death saves',
      color: 'error'
    })
  }
}
</script>

<template>
  <CharacterSheetDeathSaves
    :successes="store.deathSaves.successes"
    :failures="store.deathSaves.failures"
    :editable="canEdit"
    :is-dead="store.isDead"
    @update:successes="handleUpdate('successes', $event)"
    @update:failures="handleUpdate('failures', $event)"
  />
</template>

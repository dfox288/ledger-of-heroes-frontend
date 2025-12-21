<!-- app/components/character/sheet/DeathSavesManager.vue -->
<script setup lang="ts">
/**
 * Death Saves Manager Component
 *
 * Self-contained component for managing death saving throws.
 * Wraps DeathSaves display component.
 * Derives editability from store state (HP must be 0, not dead).
 *
 * Accepts optional initial props for SSR hydration - the store
 * may not be initialized during server render.
 *
 * @see Issue #584 - Character sheet component refactor
 * @see Issue #623 - Hydration fixes
 */
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import { useSSRFallback } from '~/composables/useSSRFallback'

interface InitialDeathSaves {
  successes: number
  failures: number
}

const props = defineProps<{
  editable?: boolean
  /** Initial death saves for SSR (optional, falls back to store) */
  initialDeathSaves?: InitialDeathSaves
  /** Initial isDead for SSR (optional, falls back to store) */
  initialIsDead?: boolean
  /** Initial HP current for SSR (for canEdit computation) */
  initialHpCurrent?: number | null
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

/** Check if store is initialized (characterId set) */
const isStoreReady = computed(() => store.characterId !== null)

/** Death saves for display - uses store if initialized, falls back to props */
const displayDeathSaves = useSSRFallback(
  computed(() => store.deathSaves),
  props.initialDeathSaves,
  isStoreReady
)

/** isDead for display - uses store if initialized, falls back to props */
const displayIsDead = useSSRFallback(
  computed(() => store.isDead),
  props.initialIsDead,
  isStoreReady
)

/** HP current for canEdit - uses store if initialized, falls back to props */
const displayHpCurrent = useSSRFallback(
  computed(() => store.hitPoints.current),
  props.initialHpCurrent ?? 0,
  isStoreReady
)

/**
 * Derived editability
 * Death saves can only be edited when:
 * - Parent says editable (play mode + alive)
 * - Character is at exactly 0 HP (D&D rule)
 * - Character is not dead
 */
const canEdit = computed(() => {
  return props.editable === true
    && displayHpCurrent.value === 0
    && !displayIsDead.value
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
    :successes="displayDeathSaves.successes"
    :failures="displayDeathSaves.failures"
    :editable="canEdit"
    :is-dead="displayIsDead"
    @update:successes="handleUpdate('successes', $event)"
    @update:failures="handleUpdate('failures', $event)"
  />
</template>

<!-- app/components/character/sheet/HitPointsManager.vue -->
<script setup lang="ts">
/**
 * Hit Points Manager Component
 *
 * Self-contained component for managing character HP.
 * Wraps StatHitPoints display + HpEditModal + TempHpModal.
 * Reads from and writes to characterPlayState store.
 *
 * Accepts optional initial HP props for SSR hydration - the store
 * may not be initialized during server render, causing hydration mismatch.
 *
 * @see Issue #584 - Character sheet component refactor
 * @see Issue #623 - Hydration fixes
 */
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

interface InitialHitPoints {
  current: number | null
  max: number | null
  temporary?: number | null
}

const props = defineProps<{
  editable?: boolean
  /** Initial HP for SSR (optional, falls back to store) */
  initialHitPoints?: InitialHitPoints
  /** Initial isDead for SSR (optional, falls back to store) */
  initialIsDead?: boolean
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

/**
 * HP values for display - uses store if initialized, falls back to props for SSR
 * Once store is initialized (characterId set), store values take precedence
 */
const displayHitPoints = computed(() => {
  // If store has been initialized, use store values for reactivity
  if (store.characterId !== null) {
    return store.hitPoints
  }
  // During SSR or before store init, use props
  if (props.initialHitPoints) {
    return {
      current: props.initialHitPoints.current ?? 0,
      max: props.initialHitPoints.max ?? 0,
      temporary: props.initialHitPoints.temporary ?? 0
    }
  }
  // Fallback to store (will be zeros during SSR)
  return store.hitPoints
})

/**
 * isDead for display - uses store if initialized, falls back to props for SSR
 */
const displayIsDead = computed(() => {
  if (store.characterId !== null) {
    return store.isDead
  }
  return props.initialIsDead ?? false
})

// Modal states
const hpModalOpen = ref(false)
const tempHpModalOpen = ref(false)

/**
 * Open the HP edit modal
 */
function openHpModal() {
  if (!props.editable) return
  hpModalOpen.value = true
}

/**
 * Open the temp HP modal
 */
function openTempHpModal() {
  if (!props.editable) return
  tempHpModalOpen.value = true
}

/**
 * Handle HP change from HpEditModal
 */
async function handleHpChange(delta: number) {
  try {
    await store.updateHp(delta)
    hpModalOpen.value = false
  } catch {
    toast.add({
      title: 'Failed to update HP',
      color: 'error'
    })
  }
}

/**
 * Handle temp HP set from TempHpModal
 */
async function handleTempHpSet(value: number) {
  try {
    await store.setTempHp(value)
    tempHpModalOpen.value = false
  } catch {
    toast.add({
      title: 'Failed to set temp HP',
      color: 'error'
    })
  }
}

/**
 * Handle temp HP clear from TempHpModal
 */
async function handleTempHpClear() {
  try {
    await store.clearTempHp()
    tempHpModalOpen.value = false
  } catch {
    toast.add({
      title: 'Failed to clear temp HP',
      color: 'error'
    })
  }
}
</script>

<template>
  <div>
    <!-- HP Display (uses display computed for SSR compatibility) -->
    <CharacterSheetStatHitPoints
      :hit-points="displayHitPoints"
      :editable="editable"
      :is-dead="displayIsDead"
      :death-save-failures="store.deathSaves.failures"
      :death-save-successes="store.deathSaves.successes"
      @hp-click="openHpModal"
      @temp-hp-click="openTempHpModal"
    />

    <!-- HP Edit Modal -->
    <CharacterSheetHpEditModal
      v-model:open="hpModalOpen"
      :current-hp="store.hitPoints.current"
      :max-hp="store.hitPoints.max"
      :temp-hp="store.hitPoints.temporary"
      @apply="handleHpChange"
    />

    <!-- Temp HP Modal -->
    <CharacterSheetTempHpModal
      v-model:open="tempHpModalOpen"
      :current-temp-hp="store.hitPoints.temporary"
      @apply="handleTempHpSet"
      @clear="handleTempHpClear"
    />
  </div>
</template>

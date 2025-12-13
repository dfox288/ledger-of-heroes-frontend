<!-- app/components/character/sheet/HitPointsManager.vue -->
<script setup lang="ts">
/**
 * Hit Points Manager Component
 *
 * Self-contained component for managing character HP.
 * Wraps StatHitPoints display + HpEditModal + TempHpModal.
 * Reads from and writes to characterPlayState store.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  editable?: boolean
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

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
    <!-- HP Display -->
    <CharacterSheetStatHitPoints
      :hit-points="store.hitPoints"
      :editable="editable"
      :is-dead="store.isDead"
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

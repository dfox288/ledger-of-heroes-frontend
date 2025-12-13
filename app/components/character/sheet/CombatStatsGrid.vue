<!-- app/components/character/sheet/CombatStatsGrid.vue -->
<script setup lang="ts">
/**
 * Combat Stats Grid
 *
 * Displays the 6-cell grid of combat stats: HP, AC, Initiative, Speed, Prof Bonus, Currency.
 * Now composed of individual stat components for reusability.
 */

import type { Character, CharacterStats, CharacterCurrency } from '~/types/character'
import type { CurrencyDelta } from '~/components/character/sheet/CurrencyEditModal.vue'

const props = defineProps<{
  character: Character
  stats: CharacterStats
  currency?: CharacterCurrency | null
  editable?: boolean
  /** Live death save failures count (for "DEAD" state display) */
  deathSaveFailures?: number
  /** Live death save successes count (for "STABILIZED" state display) */
  deathSaveSuccesses?: number
  /** Loading state for currency API call (passed to modal) */
  currencyLoading?: boolean
  /** Control currency modal open state from parent (v-model pattern) */
  currencyModalOpen?: boolean
  /** Error message to display in currency modal */
  currencyError?: string | null
}>()

const emit = defineEmits<{
  'hp-change': [delta: number]
  'temp-hp-set': [value: number]
  'temp-hp-clear': []
  'currency-apply': [payload: CurrencyDelta]
  'update:currencyModalOpen': [value: boolean]
  'clear-currency-error': []
}>()

// =========================================================================
// Modal State
// =========================================================================

const isHpModalOpen = ref(false)
const isTempHpModalOpen = ref(false)

/**
 * Currency modal state - supports both internal control and v-model from parent
 * Uses internal ref when parent doesn't provide currencyModalOpen prop
 */
const internalCurrencyModalOpen = ref(false)
const isCurrencyModalOpen = computed({
  get: () => props.currencyModalOpen ?? internalCurrencyModalOpen.value,
  set: (value: boolean) => {
    internalCurrencyModalOpen.value = value
    emit('update:currencyModalOpen', value)
  }
})

// =========================================================================
// Derived Props for StatHitPoints
// =========================================================================

/**
 * Compute isDead for StatHitPoints component
 * Uses character.is_dead if available, otherwise null to trigger fallback
 */
const computedIsDead = computed(() => {
  if (props.character.is_dead === true || props.character.is_dead === false) {
    return props.character.is_dead
  }
  return null // Let StatHitPoints use fallback calculation
})

/**
 * Compute death save failures for StatHitPoints
 */
const computedDeathSaveFailures = computed(() => {
  return props.deathSaveFailures ?? props.character.death_save_failures ?? 0
})

/**
 * Compute death save successes for StatHitPoints
 */
const computedDeathSaveSuccesses = computed(() => {
  return props.deathSaveSuccesses ?? props.character.death_save_successes ?? 0
})

// =========================================================================
// Event Handlers from Stat Components
// =========================================================================

function handleHpClick() {
  isHpModalOpen.value = true
}

function handleTempHpClick() {
  isTempHpModalOpen.value = true
}

function handleCurrencyClick() {
  isCurrencyModalOpen.value = true
}

// =========================================================================
// Modal Event Handlers
// =========================================================================

function handleHpChange(delta: number) {
  emit('hp-change', delta)
  isHpModalOpen.value = false
}

function handleTempHpSet(value: number) {
  emit('temp-hp-set', value)
  isTempHpModalOpen.value = false
}

function handleTempHpClear() {
  emit('temp-hp-clear')
  isTempHpModalOpen.value = false
}

function handleCurrencyApply(payload: CurrencyDelta) {
  emit('currency-apply', payload)
  // Note: Do NOT close modal here - parent controls close on success/failure
}
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <!-- Row 1: HP, AC, Initiative -->
    <CharacterSheetStatHitPoints
      :hit-points="stats.hit_points"
      :editable="editable"
      :is-dead="computedIsDead"
      :death-save-failures="computedDeathSaveFailures"
      :death-save-successes="computedDeathSaveSuccesses"
      @hp-click="handleHpClick"
      @temp-hp-click="handleTempHpClick"
    />

    <CharacterSheetStatArmorClass
      :armor-class="stats.armor_class"
      :character="character"
    />

    <CharacterSheetStatInitiative
      :bonus="stats.initiative_bonus"
    />

    <!-- Row 2: Speed, Proficiency, Currency -->
    <CharacterSheetStatSpeed
      :speed="character.speed"
      :speeds="character.speeds"
    />

    <CharacterSheetStatProficiencyBonus
      :bonus="character.proficiency_bonus"
    />

    <CharacterSheetStatCurrency
      :currency="currency ?? null"
      :editable="editable"
      @click="handleCurrencyClick"
    />
  </div>

  <!-- HP Edit Modal -->
  <CharacterSheetHpEditModal
    v-model:open="isHpModalOpen"
    :current-hp="stats.hit_points?.current ?? 0"
    :max-hp="stats.hit_points?.max ?? 0"
    :temp-hp="stats.hit_points?.temporary ?? 0"
    @apply="handleHpChange"
  />

  <!-- Temp HP Modal -->
  <CharacterSheetTempHpModal
    v-model:open="isTempHpModalOpen"
    :current-temp-hp="stats.hit_points?.temporary ?? 0"
    @apply="handleTempHpSet"
    @clear="handleTempHpClear"
  />

  <!-- Currency Edit Modal -->
  <CharacterSheetCurrencyEditModal
    v-model:open="isCurrencyModalOpen"
    :currency="currency ?? null"
    :loading="currencyLoading"
    :error="currencyError"
    @apply="handleCurrencyApply"
    @clear-error="emit('clear-currency-error')"
  />
</template>

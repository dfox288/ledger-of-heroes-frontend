<!-- app/components/character/sheet/StatHitPoints.vue -->
<script setup lang="ts">
/**
 * Hit Points Stat Display
 *
 * Displays HP with death state awareness (dying, dead, stabilized).
 * Emits click events for parent to open HP/Temp HP modals.
 *
 * @see Issue #544 - is_dead flag support
 */

interface HitPoints {
  current: number | null
  max: number | null
  temporary?: number | null
}

const props = defineProps<{
  hitPoints: HitPoints | null
  editable?: boolean
  /** Backend's authoritative is_dead flag (null/undefined = use fallback) */
  isDead?: boolean | null
  /** Live death save failures count */
  deathSaveFailures?: number
  /** Live death save successes count */
  deathSaveSuccesses?: number
}>()

const emit = defineEmits<{
  'hp-click': []
  'temp-hp-click': []
}>()

/**
 * Check if character is at 0 HP (dying/making death saves)
 */
const isAtZeroHp = computed(() => {
  return (props.hitPoints?.current ?? 0) === 0
})

/**
 * Check if character is dead
 *
 * Uses the backend's is_dead flag which is the authoritative source.
 * Falls back to death save calculation if is_dead is not available.
 */
const isDead = computed(() => {
  // Use backend flag if explicitly provided (true or false)
  if (props.isDead === true || props.isDead === false) {
    return props.isDead
  }
  // Fallback: derive from death saves (legacy behavior)
  const failures = props.deathSaveFailures ?? 0
  return isAtZeroHp.value && failures >= 3
})

/**
 * Check if character is stabilized (3 successful death saves)
 */
const isStabilized = computed(() => {
  const successes = props.deathSaveSuccesses ?? 0
  return isAtZeroHp.value && successes >= 3 && !isDead.value
})

/**
 * HP cell status label
 */
const statusLabel = computed(() => {
  if (isDead.value) return 'DEAD'
  if (isStabilized.value) return 'STABLE'
  if (isAtZeroHp.value) return 'DYING'
  return 'HP'
})

function handleCellClick() {
  if (!props.editable) return
  emit('hp-click')
}

function handleTempHpClick(event: Event) {
  event.stopPropagation()
  emit('temp-hp-click')
}
</script>

<template>
  <div
    data-testid="hp-cell"
    :class="[
      'rounded-lg p-4 text-center transition-colors',
      isDead
        ? 'bg-gray-900 dark:bg-black ring-2 ring-gray-700'
        : isStabilized
          ? 'bg-info-100 dark:bg-info-900/40 ring-2 ring-info-500'
          : isAtZeroHp
            ? 'bg-error-100 dark:bg-error-900/40 ring-2 ring-error-500'
            : 'bg-gray-50 dark:bg-gray-800',
      editable && !isAtZeroHp ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : '',
      editable && isAtZeroHp && !isStabilized ? 'cursor-pointer hover:bg-error-200 dark:hover:bg-error-900/60' : '',
      editable && isStabilized ? 'cursor-pointer hover:bg-info-200 dark:hover:bg-info-900/60' : ''
    ]"
    @click="handleCellClick"
  >
    <!-- Status Label -->
    <div
      :class="[
        'text-xs font-semibold uppercase tracking-wider mb-1',
        isDead
          ? 'text-gray-400 dark:text-gray-500'
          : isStabilized
            ? 'text-info-700 dark:text-info-300'
            : isAtZeroHp
              ? 'text-error-700 dark:text-error-300'
              : 'text-gray-500 dark:text-gray-400'
      ]"
    >
      {{ statusLabel }}
    </div>

    <!-- HP Value -->
    <div
      :class="[
        'text-2xl font-bold',
        isDead
          ? 'text-gray-500 dark:text-gray-600'
          : isStabilized
            ? 'text-info-700 dark:text-info-300'
            : isAtZeroHp
              ? 'text-error-700 dark:text-error-300'
              : 'text-gray-900 dark:text-white'
      ]"
    >
      {{ hitPoints?.current ?? '—' }}
      <span :class="isDead ? 'text-gray-600' : isStabilized ? 'text-info-400' : isAtZeroHp ? 'text-error-400' : 'text-gray-400'">/</span>
      {{ hitPoints?.max ?? '—' }}
    </div>

    <!-- Temporary HP -->
    <div
      v-if="hitPoints?.temporary && hitPoints.temporary > 0"
      class="text-sm text-success-600 dark:text-success-400"
    >
      +{{ hitPoints.temporary }} temp
    </div>

    <!-- Add Temp HP button (only when editable and conscious) -->
    <UButton
      v-if="editable && !isAtZeroHp"
      data-testid="add-temp-hp-btn"
      size="xs"
      variant="link"
      color="primary"
      class="mt-1"
      @click="handleTempHpClick"
    >
      + Add Temp HP
    </UButton>
  </div>
</template>

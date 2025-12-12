<!-- app/components/character/sheet/DeathSaves.vue -->
<script setup lang="ts">
/**
 * Death Saves Visual Tracker
 *
 * Displays death save successes and failures as filled/empty circles.
 * Compact design fits in the sidebar (~200px width).
 *
 * When editable=true (play mode):
 * - Circles are clickable to increment/decrement
 * - Reset button clears all saves
 * - Visual badges show Stabilized (3 successes) or Dead (3 failures)
 */

const props = defineProps<{
  successes: number // 0-3
  failures: number // 0-3
  editable?: boolean // Enable play mode interactions
}>()

const emit = defineEmits<{
  'update:successes': [value: number]
  'update:failures': [value: number]
}>()

/** D&D 5e death save threshold - 3 successes to stabilize, 3 failures to die */
const DEATH_SAVE_MAX = 3

/**
 * Handle click on a success circle
 * If circle is filled (i <= successes), decrement to i-1
 * If circle is empty (i > successes), increment to i
 */
function handleSuccessClick(circleIndex: number) {
  if (!props.editable) return

  const isFilled = circleIndex <= props.successes
  if (isFilled) {
    // Clicking filled circle decrements (set to one less than clicked)
    emit('update:successes', circleIndex - 1)
  } else {
    // Clicking empty circle increments (set to clicked index)
    emit('update:successes', circleIndex)
  }
}

/**
 * Handle click on a failure circle
 * Same logic as success circles
 */
function handleFailureClick(circleIndex: number) {
  if (!props.editable) return

  const isFilled = circleIndex <= props.failures
  if (isFilled) {
    emit('update:failures', circleIndex - 1)
  } else {
    emit('update:failures', circleIndex)
  }
}

/**
 * Check if character is stabilized (3 successes)
 */
const isStabilized = computed(() => props.successes >= DEATH_SAVE_MAX)

/**
 * Check if character is dead (3 failures)
 */
const isDead = computed(() => props.failures >= DEATH_SAVE_MAX)
</script>

<template>
  <div class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <!-- Title with status badge -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Death Saves
      </h3>
      <!-- Stabilized Badge -->
      <UBadge
        v-if="isStabilized"
        data-testid="stabilized-badge"
        color="success"
        variant="solid"
        size="md"
      >
        Stabilized
      </UBadge>
      <!-- Dead Badge -->
      <UBadge
        v-else-if="isDead"
        data-testid="dead-badge"
        color="error"
        variant="solid"
        size="md"
      >
        Dead
      </UBadge>
    </div>

    <!-- Successes Row -->
    <div class="space-y-1">
      <div class="text-xs text-gray-600 dark:text-gray-400">
        Successes
      </div>
      <div class="flex gap-2">
        <!-- 3 circles for successes -->
        <UIcon
          v-for="i in 3"
          :key="`success-${i}`"
          :name="i <= successes ? 'i-heroicons-check-circle-solid' : 'i-heroicons-check-circle'"
          :class="[
            i <= successes ? 'text-green-600 dark:text-green-500' : 'text-gray-300 dark:text-gray-600',
            editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          ]"
          class="w-6 h-6"
          :data-testid="i <= successes ? `success-filled-${i}` : `success-empty-${i}`"
          @click="handleSuccessClick(i)"
        />
      </div>
    </div>

    <!-- Failures Row -->
    <div class="space-y-1">
      <div class="text-xs text-gray-600 dark:text-gray-400">
        Failures
      </div>
      <div class="flex gap-2">
        <!-- 3 circles for failures -->
        <UIcon
          v-for="i in 3"
          :key="`failure-${i}`"
          :name="i <= failures ? 'i-heroicons-x-circle-solid' : 'i-heroicons-x-circle'"
          :class="[
            i <= failures ? 'text-red-600 dark:text-red-500' : 'text-gray-300 dark:text-gray-600',
            editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          ]"
          class="w-6 h-6"
          :data-testid="i <= failures ? `failure-filled-${i}` : `failure-empty-${i}`"
          @click="handleFailureClick(i)"
        />
      </div>
    </div>
  </div>
</template>

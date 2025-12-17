<!-- app/components/character/sheet/ClassResourceCounter.vue -->
<script setup lang="ts">
import type { Counter } from '~/types/character'

/**
 * Threshold for switching between icon and numeric display modes.
 * Counters with max <= this value show clickable icons.
 * Counters with max > this value show +/- buttons.
 */
const ICON_MODE_THRESHOLD = 6

const props = defineProps<{
  counter: Counter
  editable?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  spend: [id: number]
  restore: [id: number]
}>()

const isInteractive = computed(() => props.editable && !props.disabled)

/** Display mode: 'icon' for small pools, 'numeric' for larger pools */
const displayMode = computed(() =>
  props.counter.max <= ICON_MODE_THRESHOLD ? 'icon' : 'numeric'
)

/** Whether to show the reset badge (hide for unlimited counters) */
const resetLabel = computed(() => {
  if (props.counter.unlimited) return null
  if (props.counter.reset_on === 'short_rest') return 'Short'
  if (props.counter.reset_on === 'long_rest') return 'Long'
  return null
})

/** Whether the counter can be spent (respects unlimited flag) */
const canSpend = computed(() => {
  if (!isInteractive.value) return false
  if (props.counter.unlimited) return true
  return props.counter.current > 0
})

/** Whether the counter can be restored */
const canRestore = computed(() => {
  if (!isInteractive.value) return false
  if (props.counter.unlimited) return false // Can't restore unlimited
  return props.counter.current < props.counter.max
})

function handleSpend() {
  if (!canSpend.value) return
  emit('spend', props.counter.id)
}

function handleRestore() {
  if (!canRestore.value) return
  emit('restore', props.counter.id)
}
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-700 dark:text-gray-300 font-medium">
        {{ counter.name }}
      </span>
      <div class="flex items-center gap-2">
        <UBadge
          v-if="resetLabel"
          data-testid="reset-badge"
          color="neutral"
          variant="subtle"
          size="md"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-3 h-3 mr-0.5"
          />
          {{ resetLabel }}
        </UBadge>
        <span class="text-gray-500 dark:text-gray-400">
          {{ counter.current }}/{{ counter.max }}
        </span>
      </div>
    </div>

    <!-- Icon Mode (max <= threshold) -->
    <div
      v-if="displayMode === 'icon'"
      class="flex gap-1 flex-wrap"
    >
      <UIcon
        v-for="i in counter.current"
        :key="`filled-${i}`"
        name="i-heroicons-bolt-solid"
        :class="[
          'w-5 h-5 text-primary-600 dark:text-primary-500',
          canSpend ? 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded' : ''
        ]"
        :tabindex="canSpend ? 0 : -1"
        role="button"
        :aria-label="`Spend 1 ${counter.name}`"
        data-testid="counter-icon-filled"
        @click="handleSpend"
        @keydown.enter="handleSpend"
        @keydown.space.prevent="handleSpend"
      />
      <UIcon
        v-for="i in (counter.max - counter.current)"
        :key="`empty-${i}`"
        name="i-heroicons-bolt"
        class="w-5 h-5 text-gray-300 dark:text-gray-600"
        data-testid="counter-icon-empty"
      />
    </div>

    <!-- Numeric Mode (max > threshold) -->
    <div
      v-else
      class="flex items-center gap-2"
    >
      <UButton
        data-testid="counter-decrement"
        icon="i-heroicons-minus"
        color="neutral"
        variant="soft"
        size="xs"
        :aria-label="`Spend 1 ${counter.name}`"
        :disabled="!canSpend"
        @click="handleSpend"
      />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-12 text-center">
        {{ counter.current }} / {{ counter.max }}
      </span>
      <UButton
        data-testid="counter-increment"
        icon="i-heroicons-plus"
        color="neutral"
        variant="soft"
        size="xs"
        :aria-label="`Restore 1 ${counter.name}`"
        :disabled="!canRestore"
        @click="handleRestore"
      />
    </div>
  </div>
</template>

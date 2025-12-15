<!-- app/components/character/sheet/ClassResourceCounter.vue -->
<script setup lang="ts">
import type { Counter } from '~/types/character'

const props = defineProps<{
  counter: Counter
  editable?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  spend: [slug: string]
  restore: [slug: string]
}>()

const isInteractive = computed(() => props.editable && !props.disabled)

const resetLabel = computed(() => {
  if (props.counter.reset_on === 'short_rest') return 'Short'
  if (props.counter.reset_on === 'long_rest') return 'Long'
  return null
})

function handleIconClick() {
  if (!isInteractive.value) return
  if (props.counter.current <= 0) return
  emit('spend', props.counter.slug)
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

    <!-- Icon Mode (max <= 6) -->
    <div
      v-if="counter.max <= 6"
      class="flex gap-1 flex-wrap"
    >
      <UIcon
        v-for="i in counter.current"
        :key="`filled-${i}`"
        name="i-heroicons-bolt-solid"
        :class="[
          'w-5 h-5 text-primary-600 dark:text-primary-500',
          isInteractive ? 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded' : ''
        ]"
        :tabindex="isInteractive ? 0 : -1"
        role="button"
        :aria-label="`Spend 1 ${counter.name}`"
        data-testid="counter-icon-filled"
        @click="handleIconClick"
        @keydown.enter="handleIconClick"
        @keydown.space.prevent="handleIconClick"
      />
      <UIcon
        v-for="i in (counter.max - counter.current)"
        :key="`empty-${i}`"
        name="i-heroicons-bolt"
        class="w-5 h-5 text-gray-300 dark:text-gray-600"
        data-testid="counter-icon-empty"
      />
    </div>

    <!-- Numeric Mode (max > 6) -->
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
        :disabled="!editable || disabled || counter.current <= 0"
        @click="$emit('spend', counter.slug)"
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
        :disabled="!editable || disabled || counter.current >= counter.max"
        @click="$emit('restore', counter.slug)"
      />
    </div>
  </div>
</template>

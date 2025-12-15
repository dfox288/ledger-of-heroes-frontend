<!-- app/components/character/sheet/ClassResourceCounter.vue -->
<script setup lang="ts">
import type { Counter } from '~/types/character'

defineProps<{
  counter: Counter
  editable?: boolean
  disabled?: boolean
}>()

defineEmits<{
  spend: [slug: string]
  restore: [slug: string]
}>()
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-700 dark:text-gray-300 font-medium">
        {{ counter.name }}
      </span>
      <span class="text-gray-500 dark:text-gray-400">
        {{ counter.current }}/{{ counter.max }}
      </span>
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
        class="w-5 h-5 text-primary-600 dark:text-primary-500"
        data-testid="counter-icon-filled"
      />
      <UIcon
        v-for="i in (counter.max - counter.current)"
        :key="`empty-${i}`"
        name="i-heroicons-bolt"
        class="w-5 h-5 text-gray-300 dark:text-gray-600"
        data-testid="counter-icon-empty"
      />
    </div>
  </div>
</template>

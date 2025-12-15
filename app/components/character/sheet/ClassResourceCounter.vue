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
  </div>
</template>

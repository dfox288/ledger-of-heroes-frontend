<!-- app/components/dm-screen/DeathSavesCompact.vue -->
<script setup lang="ts">
interface Props {
  successes: number
  failures: number
}

const props = defineProps<Props>()

const showComponent = computed(() => props.successes > 0 || props.failures > 0)
const isStabilized = computed(() => props.successes >= 3)
const isDead = computed(() => props.failures >= 3)
</script>

<template>
  <div
    v-if="showComponent"
    data-testid="death-saves-container"
    class="flex items-center gap-2 text-xs"
  >
    <!-- Stabilized state -->
    <template v-if="isStabilized">
      <UIcon
        name="i-heroicons-heart-solid"
        class="w-4 h-4 text-emerald-500"
      />
      <span class="text-emerald-600 dark:text-emerald-400 font-medium">Stabilized</span>
    </template>

    <!-- Dead state -->
    <template v-else-if="isDead">
      <UIcon
        name="i-heroicons-x-circle-solid"
        class="w-4 h-4 text-rose-500"
      />
      <span class="text-rose-600 dark:text-rose-400 font-medium">Dead</span>
    </template>

    <!-- In progress -->
    <template v-else>
      <!-- Successes -->
      <span class="flex items-center gap-0.5">
        <span class="text-neutral-500 mr-0.5">S</span>
        <span
          v-for="i in 3"
          :key="`s-${i}`"
          class="w-2.5 h-2.5 rounded-full border"
          :class="i <= successes
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-neutral-300 dark:border-neutral-600'"
          :data-testid="i <= successes ? `success-filled-${i}` : `success-empty-${i}`"
        />
      </span>

      <!-- Failures -->
      <span class="flex items-center gap-0.5">
        <span class="text-neutral-500 mr-0.5">F</span>
        <span
          v-for="i in 3"
          :key="`f-${i}`"
          class="w-2.5 h-2.5 rounded-full border"
          :class="i <= failures
            ? 'bg-rose-500 border-rose-500'
            : 'border-neutral-300 dark:border-neutral-600'"
          :data-testid="i <= failures ? `failure-filled-${i}` : `failure-empty-${i}`"
        />
      </span>
    </template>
  </div>
</template>

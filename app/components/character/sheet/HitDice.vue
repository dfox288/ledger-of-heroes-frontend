<!-- app/components/character/sheet/HitDice.vue -->
<script setup lang="ts">
/**
 * Hit Dice Counter
 *
 * Displays hit dice by die type as filled/empty circles.
 * Supports multiclass characters with multiple die types.
 * Compact design fits in the sidebar (~200px width).
 */

defineProps<{
  hitDice: { die: string, total: number, current: number }[]
}>()
</script>

<template>
  <div class="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <!-- Title -->
    <div class="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
      Hit Dice
    </div>

    <!-- Die Type Rows -->
    <div
      v-for="dice in hitDice"
      :key="dice.die"
      class="space-y-1"
      :data-testid="`dice-row-${dice.die}`"
    >
      <!-- Die Type Label -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-700 dark:text-gray-300 font-medium">
          {{ dice.die }}
        </span>
        <span class="text-gray-500 dark:text-gray-400">
          {{ dice.current }}/{{ dice.total }}
        </span>
      </div>

      <!-- Dice Circles -->
      <div class="flex gap-1 flex-wrap">
        <!-- Current (filled) dice -->
        <UIcon
          v-for="i in dice.current"
          :key="`${dice.die}-filled-${i}`"
          name="i-heroicons-circle-stack-solid"
          class="w-5 h-5 text-primary-600 dark:text-primary-500"
          :data-testid="`dice-${dice.die}-filled`"
        />
        <!-- Used (empty) dice -->
        <UIcon
          v-for="i in (dice.total - dice.current)"
          :key="`${dice.die}-empty-${i}`"
          name="i-heroicons-circle-stack"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          :data-testid="`dice-${dice.die}-empty`"
        />
      </div>
    </div>
  </div>
</template>

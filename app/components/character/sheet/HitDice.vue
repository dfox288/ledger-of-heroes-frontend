<!-- app/components/character/sheet/HitDice.vue -->
<script setup lang="ts">
/**
 * Hit Dice Counter with Rest Actions
 *
 * Displays hit dice by die type as filled/empty dice icons.
 * Supports multiclass characters with multiple die types.
 * Compact design fits in the sidebar (~200px width).
 *
 * When editable (play mode):
 * - Filled dice are clickable to spend (player rolls physical dice)
 * - Rest buttons appear at bottom for short/long rest actions
 *
 * @see #534 - Rest Actions
 */

const props = defineProps<{
  hitDice: { die: string, total: number, current: number }[]
  editable?: boolean
}>()

const emit = defineEmits<{
  'spend': [{ dieType: string }]
  'short-rest': []
  'long-rest': []
}>()

/**
 * Handle clicking a filled die - spend it
 */
function handleDieClick(dieType: string, isFilled: boolean) {
  if (!props.editable || !isFilled) return
  emit('spend', { dieType })
}
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

      <!-- Dice Icons -->
      <div class="flex gap-1 flex-wrap">
        <!-- Current (filled) dice - clickable when editable -->
        <UIcon
          v-for="i in dice.current"
          :key="`${dice.die}-filled-${i}`"
          name="i-game-icons-perspective-dice-six"
          :class="[
            'w-5 h-5 text-primary-600 dark:text-primary-500',
            editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          ]"
          :data-testid="`dice-${dice.die}-filled`"
          @click="handleDieClick(dice.die, true)"
        />
        <!-- Used (empty) dice - not clickable -->
        <UIcon
          v-for="i in (dice.total - dice.current)"
          :key="`${dice.die}-empty-${i}`"
          name="i-game-icons-perspective-dice-six"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          :data-testid="`dice-${dice.die}-empty`"
          @click="handleDieClick(dice.die, false)"
        />
      </div>
    </div>

    <!-- Rest Actions (play mode only) -->
    <template v-if="editable">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
        <div class="flex gap-2">
          <UButton
            data-testid="short-rest-btn"
            color="neutral"
            variant="soft"
            size="xs"
            class="flex-1"
            @click="emit('short-rest')"
          >
            <UIcon
              name="i-heroicons-sun"
              class="w-4 h-4 mr-1"
            />
            Short
          </UButton>
          <UButton
            data-testid="long-rest-btn"
            color="neutral"
            variant="soft"
            size="xs"
            class="flex-1"
            @click="emit('long-rest')"
          >
            <UIcon
              name="i-heroicons-moon"
              class="w-4 h-4 mr-1"
            />
            Long
          </UButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Modifier, EntityChoice } from '~/types'

interface Props {
  modifiers: Modifier[]
  choices?: EntityChoice[]
}

const props = withDefaults(defineProps<Props>(), {
  choices: () => []
})

/**
 * Filter only ability score modifiers that have an ability_score defined
 * (fixed bonuses, not choices)
 */
const abilityScoreModifiers = computed(() => {
  return props.modifiers.filter(m => m.ability_score)
})

/**
 * Format modifier value with plus sign
 */
function formatValue(value: string): string {
  // Value is already stored as just the number (e.g., "2", "1")
  return `+${value}`
}

/**
 * Get display text for an ability modifier
 */
function getAbilityDisplay(modifier: Modifier): string {
  return modifier.ability_score?.code || ''
}

/**
 * Check if we should show the card
 * Show if there are ability score modifiers OR ability score choices
 */
const shouldShow = computed(() =>
  abilityScoreModifiers.value.length > 0 || props.choices.length > 0
)
</script>

<template>
  <UCard v-if="shouldShow">
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-arrow-trending-up"
              class="w-6 h-6 text-primary-600 dark:text-primary-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ability Score Increases
          </h3>
        </div>
      </div>

      <!-- Ability Score Boxes -->
      <div class="flex flex-wrap gap-3">
        <!-- Fixed modifiers -->
        <div
          v-for="modifier in abilityScoreModifiers"
          :key="modifier.id"
          data-testid="ability-box"
          class="flex flex-col items-center justify-center p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 min-w-[100px]"
        >
          <!-- Ability Code -->
          <div class="text-lg font-bold text-primary-700 dark:text-primary-300 mb-1">
            {{ getAbilityDisplay(modifier) }}
          </div>

          <!-- Value -->
          <div class="text-2xl font-extrabold text-primary-900 dark:text-primary-100">
            {{ formatValue(modifier.value) }}
          </div>

          <!-- Condition (if any) -->
          <div
            v-if="modifier.condition"
            class="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center"
          >
            {{ modifier.condition }}
          </div>
        </div>

        <!-- Choice boxes -->
        <div
          v-for="choice in choices"
          :key="`choice-${choice.id}`"
          data-testid="ability-choice-box"
          class="flex flex-col items-center justify-center p-4 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 border-dashed min-w-[100px]"
        >
          <!-- "Your choice" label -->
          <div class="text-lg font-bold text-info-700 dark:text-info-300 mb-1">
            Your choice
          </div>

          <!-- Value from constraints -->
          <div class="text-2xl font-extrabold text-info-900 dark:text-info-100">
            {{ (choice.constraints as unknown as Record<string, string> | null)?.value || '+1' }}
          </div>

          <!-- Quantity and constraint info -->
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
            <template v-if="choice.quantity > 1">
              Choose {{ choice.quantity }}
              <template v-if="choice.constraint">
                ({{ choice.constraint }})
              </template>
            </template>
            <template v-else>
              Choose 1
            </template>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

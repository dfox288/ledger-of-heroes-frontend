<script setup lang="ts">
import type { Modifier } from '~/types'

interface Props {
  modifiers: Modifier[]
}

const props = defineProps<Props>()

/**
 * Filter only ability score modifiers that have an ability_score defined
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
 * If it's a choice, show "Your choice" instead of ability code
 */
function getAbilityDisplay(modifier: Modifier): string {
  if (modifier.is_choice) {
    return 'Your choice'
  }
  return modifier.ability_score?.code || ''
}

/**
 * Check if we should show the card
 * Only show if there are ability score modifiers
 */
const shouldShow = computed(() => abilityScoreModifiers.value.length > 0)
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
        <div
          v-for="modifier in abilityScoreModifiers"
          :key="modifier.id"
          data-testid="ability-box"
          class="flex flex-col items-center justify-center p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 min-w-[100px]"
        >
          <!-- Ability Code or "Your choice" -->
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
      </div>
    </div>
  </UCard>
</template>

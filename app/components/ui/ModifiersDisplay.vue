<script setup lang="ts">
import type { AbilityScore, Modifier } from '~/types'

interface Props {
  modifiers?: Modifier[]
}

defineProps<Props>()

/**
 * Check if value is numeric
 */
const isNumeric = (value: string | number): boolean => {
  if (typeof value === 'number') return true
  const parsed = parseInt(value)
  return !isNaN(parsed)
}

/**
 * Format modifier value with + or - sign (for numeric values only)
 */
const formatValue = (value: string | number): string => {
  if (!isNumeric(value)) {
    // Return non-numeric values as-is (e.g., "advantage", "disadvantage")
    return String(value)
  }
  const numValue = typeof value === 'string' ? parseInt(value) : value
  return numValue > 0 ? `+${numValue}` : `${numValue}`
}

/**
 * Generate human-readable choice description
 */
const formatChoiceDescription = (
  count: number | null,
  constraint: string | null,
  category: string
): string => {
  if (!count) return `Choose ${category}`

  const plural = count > 1 ? 's' : ''
  const constraintText = constraint ? `${constraint} ` : ''
  const target = category === 'ability_score'
    ? `ability score${plural}`
    : category

  return `Choose ${count} ${constraintText}${target}`
}
</script>

<template>
  <div
    v-if="modifiers && modifiers.length > 0"
    data-testid="modifiers-container"
    class="p-4 space-y-3"
  >
    <div
      v-for="modifier in modifiers"
      :key="modifier.id"
      data-testid="modifier-item"
      class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
    >
      <!-- Choice Modifier Display -->
      <div
        v-if="modifier.is_choice"
        class="space-y-2"
      >
        <UBadge
          color="info"
          variant="soft"
          size="sm"
        >
          CHOICE
        </UBadge>
        <div class="font-medium text-gray-900 dark:text-gray-100">
          {{ formatChoiceDescription(modifier.choice_count, modifier.choice_constraint, modifier.modifier_category) }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ modifier.value }}
        </div>
      </div>

      <!-- Fixed Modifier Display -->
      <div v-else>
        <div class="font-medium text-gray-900 dark:text-gray-100">
          <!-- Skill Modifier (e.g., Stealth (DEX): disadvantage) -->
          <template v-if="modifier.skill">
            {{ modifier.skill.name }} ({{ modifier.ability_score?.code }}): {{ formatValue(modifier.value) }}
          </template>
          <!-- Ability Score Modifier (e.g., Strength (STR): +2) -->
          <template v-else-if="modifier.ability_score">
            {{ modifier.ability_score.name }} ({{ modifier.ability_score.code }}): {{ formatValue(modifier.value) }}
          </template>
          <!-- Generic Modifier (e.g., speed: +10) -->
          <template v-else>
            {{ modifier.modifier_category }}: {{ formatValue(modifier.value) }}
          </template>
        </div>
        <div
          v-if="modifier.condition"
          class="text-sm text-gray-600 dark:text-gray-400 mt-1"
        >
          {{ modifier.condition }}
        </div>
      </div>
    </div>
  </div>
</template>

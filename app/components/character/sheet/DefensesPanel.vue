<!-- app/components/character/sheet/DefensesPanel.vue -->
<script setup lang="ts">
import type { DamageDefense, ConditionAdvantage, ConditionImmunity } from '~/types/character'

const props = defineProps<{
  damageResistances: DamageDefense[]
  damageImmunities: DamageDefense[]
  damageVulnerabilities: DamageDefense[]
  conditionAdvantages: ConditionAdvantage[]
  conditionImmunities: ConditionImmunity[]
}>()

/**
 * Check if the panel should be displayed
 * Returns true if at least one category has items
 */
const hasDefenses = computed(() => {
  return (
    props.damageResistances.length > 0 ||
    props.damageImmunities.length > 0 ||
    props.damageVulnerabilities.length > 0 ||
    props.conditionAdvantages.length > 0 ||
    props.conditionImmunities.length > 0
  )
})

/**
 * Format damage defense badge text
 * Returns: "Type (Source)" or "Type (Source) - condition text"
 */
function formatDamageDefense(defense: DamageDefense): string {
  const base = `${defense.type} (${defense.source})`
  return defense.condition ? `${base} - ${defense.condition}` : base
}

/**
 * Format condition badge text
 * Returns: "vs Condition (Source)"
 */
function formatConditionAdvantage(advantage: ConditionAdvantage): string {
  return `vs ${advantage.condition} (${advantage.source})`
}

/**
 * Format condition immunity badge text
 * Returns: "Condition (Source)"
 */
function formatConditionImmunity(immunity: ConditionImmunity): string {
  return `${immunity.condition} (${immunity.source})`
}
</script>

<template>
  <div
    v-if="hasDefenses"
    data-testid="defenses-panel"
    class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
  >
    <!-- Resistances -->
    <div v-if="damageResistances.length > 0" class="mb-3 last:mb-0">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Resistances
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(resistance, index) in damageResistances"
          :key="index"
          color="neutral"
          variant="subtle"
          size="md"
          data-testid="resistance-badge"
        >
          {{ formatDamageDefense(resistance) }}
        </UBadge>
      </div>
    </div>

    <!-- Immunities -->
    <div v-if="damageImmunities.length > 0" class="mb-3 last:mb-0">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Immunities
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(immunity, index) in damageImmunities"
          :key="index"
          color="success"
          variant="subtle"
          size="md"
          data-testid="immunity-badge"
        >
          {{ formatDamageDefense(immunity) }}
        </UBadge>
      </div>
    </div>

    <!-- Vulnerabilities -->
    <div v-if="damageVulnerabilities.length > 0" class="mb-3 last:mb-0">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Vulnerabilities
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(vulnerability, index) in damageVulnerabilities"
          :key="index"
          color="error"
          variant="subtle"
          size="md"
          data-testid="vulnerability-badge"
        >
          {{ formatDamageDefense(vulnerability) }}
        </UBadge>
      </div>
    </div>

    <!-- Save Advantages -->
    <div v-if="conditionAdvantages.length > 0" class="mb-3 last:mb-0">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Save Advantages
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(advantage, index) in conditionAdvantages"
          :key="index"
          color="info"
          variant="subtle"
          size="md"
          data-testid="advantage-badge"
        >
          {{ formatConditionAdvantage(advantage) }}
        </UBadge>
      </div>
    </div>

    <!-- Condition Immunities -->
    <div v-if="conditionImmunities.length > 0" class="mb-3 last:mb-0">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Condition Immunities
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(immunity, index) in conditionImmunities"
          :key="index"
          color="success"
          variant="subtle"
          size="md"
          data-testid="condition-immunity-badge"
        >
          {{ formatConditionImmunity(immunity) }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

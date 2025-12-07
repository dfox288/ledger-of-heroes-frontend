<script setup lang="ts">
import type { Modifier } from '~/types'

interface Props {
  resistances: Modifier[]
}

const props = defineProps<Props>()

/**
 * Filter only damage resistance modifiers that have a damage_type defined
 */
const validResistances = computed(() => {
  return props.resistances.filter(r => r.damage_type)
})

/**
 * Format the resistance type (capitalize first letter)
 */
function formatResistanceType(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Get badge text for a resistance
 * Format: "Fire Resistance" or "Poison Immunity"
 */
function getBadgeText(resistance: Modifier): string {
  const damageTypeName = resistance.damage_type?.name || ''
  const resistanceType = formatResistanceType(resistance.value)
  return `${damageTypeName} ${resistanceType}`
}

/**
 * Get condition text if available
 * Format: "(while raging)" or "(saving throws)"
 */
function getConditionText(resistance: Modifier): string | null {
  if (!resistance.condition) return null
  return `(${resistance.condition})`
}

/**
 * Check if we should show the component
 * Only show if there are valid resistances
 */
const shouldShow = computed(() => validResistances.value.length > 0)
</script>

<template>
  <div
    v-if="shouldShow"
    class="space-y-2"
  >
    <!-- Resistances badges with icon -->
    <div class="flex items-center gap-2 flex-wrap">
      <UIcon
        name="i-heroicons-shield-check"
        class="w-5 h-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0"
      />
      <UBadge
        v-for="resistance in validResistances"
        :key="resistance.id"
        data-testid="resistance-badge"
        color="neutral"
        variant="subtle"
        size="md"
      >
        {{ getBadgeText(resistance) }}
        <span
          v-if="resistance.condition"
          class="ml-1 opacity-75"
        >
          {{ getConditionText(resistance) }}
        </span>
      </UBadge>
    </div>
  </div>
</template>

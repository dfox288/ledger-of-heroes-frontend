<script setup lang="ts">
interface ItemSpell {
  id: number
  name: string
  slug: string
  level: number
  charges_cost_min: number
  charges_cost_max: number
  charges_cost_formula: string | null
  usage_limit: string | null
  level_requirement: number | null
}

interface Props {
  spells: ItemSpell[]
}

defineProps<Props>()

/**
 * Format spell level for display (1st, 2nd, 3rd, etc.)
 */
const formatSpellLevel = (level: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const remainder = level % 10
  const suffix = remainder <= 3 && ![11, 12, 13].includes(level % 100)
    ? suffixes[remainder]
    : suffixes[0]
  return `${level}${suffix} level`
}

/**
 * Format charges cost display
 */
const formatChargesCost = (min: number, max: number): string => {
  if (min === max) {
    return min === 1 ? '1 charge' : `${min} charges`
  }
  return `${min}-${max} charges`
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div
      v-for="spell in spells"
      :key="spell.id"
      class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
    >
      <!-- Spell Name & Level -->
      <div class="flex items-baseline justify-between gap-4 mb-2">
        <NuxtLink
          :to="`/spells/${spell.slug}`"
          class="text-lg font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {{ spell.name }}
        </NuxtLink>
        <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {{ formatSpellLevel(spell.level) }}
        </span>
      </div>

      <!-- Charges Cost -->
      <div class="text-sm text-gray-700 dark:text-gray-300">
        <span class="font-medium">Cost:</span>
        {{ formatChargesCost(spell.charges_cost_min, spell.charges_cost_max) }}
        <span
          v-if="spell.charges_cost_formula"
          class="text-gray-600 dark:text-gray-400"
        >
          ({{ spell.charges_cost_formula }})
        </span>
      </div>

      <!-- Optional: Usage Limit -->
      <div
        v-if="spell.usage_limit"
        class="text-sm text-gray-600 dark:text-gray-400 mt-1"
      >
        <span class="font-medium">Limit:</span> {{ spell.usage_limit }}
      </div>

      <!-- Optional: Level Requirement -->
      <div
        v-if="spell.level_requirement"
        class="text-sm text-gray-600 dark:text-gray-400 mt-1"
      >
        <span class="font-medium">Requires character level {{ spell.level_requirement }}</span>
      </div>
    </div>
  </div>
</template>

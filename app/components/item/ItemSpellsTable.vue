<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ItemSpellResource = components['schemas']['ItemSpellResource']

interface Props {
  spellsByChargeCost: Map<string, ItemSpellResource[]>
}

const props = defineProps<Props>()

/**
 * Convert Map to sorted array of entries
 * Sorts "0" (Free) first, then ascending by numeric cost
 */
const sortedGroups = computed(() => {
  return Array.from(props.spellsByChargeCost.entries()).sort((a, b) => {
    const costA = Number.parseInt(a[0], 10)
    const costB = Number.parseInt(b[0], 10)
    return costA - costB
  })
})

/**
 * Format cost for display
 * Shows "Free" for 0/null, otherwise shows the cost number
 */
const formatCost = (cost: string): string => {
  const costNum = Number.parseInt(cost, 10)
  return costNum === 0 ? 'Free' : cost
}

/**
 * Format spell level ordinal (1st, 2nd, 3rd, etc.)
 */
const formatOrdinal = (level: string | number): string => {
  const levelNum = typeof level === 'string' ? Number.parseInt(level, 10) : level
  const suffixes = ['th', 'st', 'nd', 'rd']
  const remainder = levelNum % 10
  const suffix = remainder <= 3 && ![11, 12, 13].includes(levelNum % 100)
    ? suffixes[remainder]
    : suffixes[0]
  return `${levelNum}${suffix}`
}

/**
 * Check if spell is cast at higher level than normal
 * Returns formatted level indicator if yes, null if no
 */
const getHigherLevelIndicator = (spell: ItemSpellResource, chargeCost: string): string | null => {
  const spellLevel = Number.parseInt(spell.level, 10)
  const castLevel = Number.parseInt(chargeCost, 10)

  // Only show level indicator if cast at higher level than base spell level
  if (castLevel > spellLevel && castLevel > 0) {
    return ` (${formatOrdinal(castLevel)})`
  }

  return null
}
</script>

<template>
  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead class="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th
          scope="col"
          class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
        >
          Cost
        </th>
        <th
          scope="col"
          class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          Spells
        </th>
      </tr>
    </thead>
    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      <tr
        v-for="[cost, spells] in sortedGroups"
        :key="cost"
      >
        <!-- Cost column -->
        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
          {{ formatCost(cost) }}
        </td>

        <!-- Spells column -->
        <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
          <template
            v-for="(spell, index) in spells"
            :key="spell.id"
          >
            <NuxtLink
              :to="`/spells/${spell.slug}`"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              {{ spell.name }}
            </NuxtLink>
            <template v-if="getHigherLevelIndicator(spell, cost)">
              <span class="text-gray-600 dark:text-gray-400">{{ getHigherLevelIndicator(spell, cost) }}</span>
            </template>
            <template v-if="index < spells.length - 1">
              ,
            </template>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

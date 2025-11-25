<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ClassFeature = components['schemas']['ClassFeatureResource']
type ClassCounter = components['schemas']['ClassCounterResource']

interface Props {
  features: ClassFeature[]
  counters: ClassCounter[]
  maxLevel?: number
}

interface TableRow {
  level: number
  proficiencyBonus: string
  features: string
  [key: string]: string | number // For dynamic counter columns
}

const props = withDefaults(defineProps<Props>(), {
  maxLevel: 20
})

/**
 * Calculate proficiency bonus for a given level
 * Formula: Math.ceil(level / 4) + 1
 */
const getProficiencyBonus = (level: number): string => {
  const bonus = Math.ceil(level / 4) + 1
  return `+${bonus}`
}

/**
 * Group features by level
 */
const featuresByLevel = computed(() => {
  const grouped = new Map<number, string[]>()

  for (const feature of props.features) {
    const level = feature.level
    const names = grouped.get(level) || []
    names.push(feature.feature_name)
    grouped.set(level, names)
  }

  return grouped
})

/**
 * Get unique counter names to create dynamic columns
 */
const counterNames = computed(() => {
  const names = new Set<string>()
  for (const counter of props.counters) {
    names.add(counter.counter_name)
  }
  return Array.from(names)
})

/**
 * Get counter value at a specific level (find highest entry at or below level)
 */
const getCounterAtLevel = (counterName: string, level: number): number | null => {
  const entries = props.counters
    .filter(c => c.counter_name === counterName && c.level <= level)
    .sort((a, b) => b.level - a.level)

  return entries[0]?.counter_value ?? null
}

/**
 * Format counter value for display (e.g., 1 -> "1d6" for Sneak Attack)
 */
const formatCounterValue = (counterName: string, value: number | null): string => {
  if (value === null) return '—'

  // Sneak Attack uses d6 dice
  if (counterName === 'Sneak Attack') {
    return `${value}d6`
  }

  // Default: just show the number
  return String(value)
}

/**
 * Build dynamic columns array
 */
const columns = computed(() => {
  const cols = [
    { key: 'level', label: 'Level' },
    { key: 'proficiencyBonus', label: 'Prof. Bonus' },
    { key: 'features', label: 'Features' }
  ]

  // Add counter columns
  for (const name of counterNames.value) {
    cols.push({
      key: `counter_${name}`,
      label: name
    })
  }

  return cols
})

/**
 * Build table rows for all levels
 */
const tableRows = computed(() => {
  const rows: TableRow[] = []

  for (let level = 1; level <= props.maxLevel; level++) {
    const row: TableRow = {
      level,
      proficiencyBonus: getProficiencyBonus(level),
      features: featuresByLevel.value.get(level)?.join(', ') || '—'
    }

    // Add counter values
    for (const name of counterNames.value) {
      const value = getCounterAtLevel(name, level)
      row[`counter_${name}`] = formatCounterValue(name, value)
    }

    rows.push(row)
  }

  return rows
})
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Class Progression
      </h3>
    </template>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <caption class="sr-only">
          Class progression from level 1 to 20
        </caption>
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
              :class="{ 'text-center': col.key === 'level' || col.key === 'proficiencyBonus' || col.key.startsWith('counter_') }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableRows"
            :key="row.level"
            class="border-t border-gray-200 dark:border-gray-700"
            :class="{ 'bg-gray-50/50 dark:bg-gray-800/50': (row.level as number) % 2 === 0 }"
          >
            <td class="px-3 py-2 text-center font-medium text-gray-900 dark:text-gray-100">
              {{ row.level }}
            </td>
            <td class="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
              {{ row.proficiencyBonus }}
            </td>
            <td class="px-3 py-2 text-gray-700 dark:text-gray-300">
              {{ row.features }}
            </td>
            <td
              v-for="name in counterNames"
              :key="name"
              class="px-3 py-2 text-center text-gray-700 dark:text-gray-300"
            >
              {{ row[`counter_${name}`] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>

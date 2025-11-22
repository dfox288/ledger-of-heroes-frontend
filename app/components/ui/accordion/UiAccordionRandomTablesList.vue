<script setup lang="ts">
interface RandomTableEntry {
  id: number
  roll_min: number | null
  roll_max: number | null
  result_text: string
  sort_order: number
}

interface RandomTable {
  id: number
  table_name: string
  dice_type: string | null
  description?: string | null
  entries: RandomTableEntry[]
}

interface Props {
  tables: RandomTable[]
  borderColor?: string
}

withDefaults(defineProps<Props>(), {
  borderColor: 'primary-500'
})

/**
 * Format roll range display (e.g., "5" or "3-6")
 */
const formatRollRange = (min: number | null, max: number | null): string => {
  if (min === null || max === null) return ''
  return min === max ? `${min}` : `${min}-${max}`
}

/**
 * Check if a table has any dice rolls (non-null roll_min/roll_max)
 */
const hasRolls = (table: RandomTable): boolean => {
  return table.entries.some(entry => entry.roll_min !== null || entry.roll_max !== null)
}

/**
 * Parse pipe-delimited result_text into columns
 * Example: "Cannith | Alchemist's supplies" => ["Cannith", "Alchemist's supplies"]
 */
const parseColumns = (resultText: string): string[] => {
  return resultText.split('|').map(col => col.trim())
}

/**
 * Get column count for a table (max number of pipe-separated columns)
 */
const getColumnCount = (table: RandomTable): number => {
  if (table.entries.length === 0) return 1
  const maxColumns = Math.max(...table.entries.map(entry => parseColumns(entry.result_text).length))
  return maxColumns
}
</script>

<template>
  <div
    v-if="tables.length > 0"
    class="space-y-6 pl-4"
  >
    <div
      v-for="table in tables"
      :key="table.id"
      class="space-y-2 border-l-4 pl-4"
      :class="`border-${borderColor}`"
    >
      <!-- Table Name and Dice Type -->
      <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">
        {{ table.table_name }}
        <span
          v-if="table.dice_type"
          class="text-sm font-normal text-gray-600 dark:text-gray-400"
        >
          ({{ table.dice_type }})
        </span>
      </h4>

      <!-- Optional Description -->
      <p
        v-if="table.description"
        class="text-sm text-gray-700 dark:text-gray-300"
      >
        {{ table.description }}
      </p>

      <!-- HTML Table -->
      <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <!-- Roll column (only if table has rolls) -->
            <th
              v-if="hasRolls(table)"
              class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 w-24"
            >
              Roll
            </th>
            <!-- Dynamic columns based on pipe-delimited content -->
            <th
              v-for="colIndex in getColumnCount(table)"
              :key="colIndex"
              class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              {{ colIndex === 1 && getColumnCount(table) === 1 ? 'Result' : '' }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <tr
            v-for="entry in table.entries"
            :key="entry.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Roll cell (only if table has rolls) -->
            <td
              v-if="hasRolls(table)"
              class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              {{ formatRollRange(entry.roll_min, entry.roll_max) }}
            </td>
            <!-- Dynamic columns parsed from pipe-delimited result_text -->
            <td
              v-for="(column, colIndex) in parseColumns(entry.result_text)"
              :key="colIndex"
              class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
            >
              {{ column }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

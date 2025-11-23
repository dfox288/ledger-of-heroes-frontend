<script setup lang="ts">
import type { components } from '~/types/api/generated'

type RandomTableResource = components['schemas']['RandomTableResource']

interface Props {
  tables: RandomTableResource[]
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
const hasRolls = (table: RandomTableResource): boolean => {
  if (!table.entries || table.entries.length === 0) return false
  return table.entries.some(entry => entry.roll_min !== null || entry.roll_max !== null)
}

/**
 * Parse pipe-delimited result_text into columns
 */
const parseColumns = (resultText: string | null): string[] => {
  if (!resultText) return ['']
  return resultText.split('|').map(col => col.trim())
}

/**
 * Get column count for a table (max number of pipe-separated columns)
 */
const getColumnCount = (table: RandomTableResource): number => {
  if (!table.entries || table.entries.length === 0) return 1
  const maxColumns = Math.max(...table.entries.map(entry => parseColumns(entry.result_text).length))
  return maxColumns
}

/**
 * Build columns for a specific table
 */
const buildColumns = (table: RandomTableResource) => {
  const cols: Array<{ key: string, label: string, width?: string }> = []

  if (hasRolls(table)) {
    cols.push({ key: 'roll', label: 'Roll', width: 'w-24' })
  }

  const columnCount = getColumnCount(table)
  for (let i = 0; i < columnCount; i++) {
    cols.push({
      key: `col_${i}`,
      label: i === 0 && columnCount === 1 ? 'Result' : ''
    })
  }

  return cols
}

/**
 * Transform table entries to row format
 */
const buildRows = (table: RandomTableResource) => {
  if (!table.entries) return []

  return table.entries.map((entry) => {
    const row: Record<string, unknown> = {}

    if (hasRolls(table)) {
      row.roll = formatRollRange(entry.roll_min, entry.roll_max)
    }

    const columns = parseColumns(entry.result_text)
    columns.forEach((col, index) => {
      row[`col_${index}`] = col
    })

    return row
  })
}
</script>

<template>
  <div
    v-if="tables.length > 0"
    class="p-4 space-y-6"
  >
    <div
      v-for="table in tables"
      :key="table.id"
      class="space-y-2"
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

      <!-- Table Data -->
      <UiAccordionDataTable
        :columns="buildColumns(table)"
        :rows="buildRows(table)"
        :striped="false"
      />
    </div>
  </div>
</template>

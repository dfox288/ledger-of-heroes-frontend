<script setup lang="ts">
interface RandomTableEntry {
  id: number
  roll_min: number
  roll_max: number
  result_text: string
  sort_order: number
}

interface RandomTable {
  id: number
  table_name: string
  dice_type: string
  description?: string | null
  entries: RandomTableEntry[]
}

interface Props {
  tables: RandomTable[]
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  borderColor: 'primary-500'
})

const formatRollRange = (min: number, max: number): string => {
  return min === max ? `${min}` : `${min}-${max}`
}
</script>

<template>
  <div v-if="tables.length > 0" class="space-y-6 pl-4">
    <div v-for="table in tables" :key="table.id" class="space-y-2 border-l-4 pl-4" :class="`border-${borderColor}`">
      <!-- Table Name and Dice Type -->
      <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">
        {{ table.table_name }}
        <span class="text-sm font-normal text-gray-600 dark:text-gray-400">
          ({{ table.dice_type }})
        </span>
      </h4>

      <!-- Optional Description -->
      <p v-if="table.description" class="text-sm text-gray-700 dark:text-gray-300">
        {{ table.description }}
      </p>

      <!-- HTML Table -->
      <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 w-24">
              Roll
            </th>
            <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Result
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <tr
            v-for="entry in table.entries"
            :key="entry.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ formatRollRange(entry.roll_min, entry.roll_max) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
              {{ entry.result_text }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

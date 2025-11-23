<script setup lang="ts">
interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  cellClass?: string
}

interface Props {
  columns: Column[]
  rows: Record<string, any>[]
  mobileLayout?: 'stacked' | 'cards'
  striped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mobileLayout: 'cards',
  striped: true
})

/**
 * Get alignment class for column
 */
const getAlignClass = (align?: string): string => {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}
</script>

<template>
  <div>
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                getAlignClass(column.align),
                column.width
              ]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(row, index) in rows"
            :key="index"
            :class="striped && index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/30' : ''"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
                getAlignClass(column.align),
                column.cellClass
              ]"
            >
              <slot
                :name="`cell-${column.key}`"
                :value="row[column.key]"
                :row="row"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-4">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          class="flex justify-between items-center"
        >
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ column.label }}:
          </span>
          <span class="text-sm text-gray-900 dark:text-gray-100">
            <slot
              :name="`cell-${column.key}`"
              :value="row[column.key]"
              :row="row"
            >
              {{ row[column.key] }}
            </slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

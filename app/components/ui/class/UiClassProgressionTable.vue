<script setup lang="ts">
import type { ClassProgressionTable } from '~/types/api/entities'

interface Props {
  progressionTable: ClassProgressionTable
}

defineProps<Props>()
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
              v-for="col in progressionTable.columns"
              :key="col.key"
              scope="col"
              class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
              :class="{ 'text-center': col.key === 'level' || col.key === 'proficiency_bonus' || col.type === 'integer' || col.type === 'bonus' || col.type === 'dice' }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in progressionTable.rows"
            :key="row.level"
            class="border-t border-gray-200 dark:border-gray-700"
            :class="{ 'bg-gray-50/50 dark:bg-gray-800/50': index % 2 === 1 }"
          >
            <td
              v-for="col in progressionTable.columns"
              :key="col.key"
              class="px-3 py-2"
              :class="{
                'text-center font-medium text-gray-900 dark:text-gray-100': col.key === 'level',
                'text-center text-gray-700 dark:text-gray-300': col.key !== 'level' && col.key !== 'features',
                'text-gray-700 dark:text-gray-300': col.key === 'features'
              }"
            >
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>

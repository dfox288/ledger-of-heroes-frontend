<script setup lang="ts">
import type { ClassCounterResource } from '~/types/api/entities'
import { getResetTimingColor } from '~/utils/badgeColors'

interface Props {
  counters: ClassCounterResource[]
}

const props = defineProps<Props>()

/**
 * Sort counters by level ascending
 */
const sortedCounters = computed(() => {
  if (!props.counters) return []
  return [...props.counters].sort((a, b) => a.level - b.level)
})
</script>

<template>
  <div
    v-if="counters && counters.length > 0"
    class="p-4"
  >
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Level
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Counter
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Value
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reset Timing
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="counter in sortedCounters"
            :key="counter.id"
          >
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {{ counter.level }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ counter.counter_name }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {{ counter.counter_value }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <UBadge
                :color="getResetTimingColor(counter.reset_timing)"
                variant="soft"
                size="sm"
              >
                {{ counter.reset_timing }}
              </UBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Stacked -->
    <div class="md:hidden space-y-4">
      <div
        v-for="counter in sortedCounters"
        :key="counter.id"
        class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2"
      >
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ counter.counter_name }}
          </span>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Level {{ counter.level }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-700 dark:text-gray-300">
            Value: {{ counter.counter_value }}
          </span>
          <UBadge
            :color="getResetTimingColor(counter.reset_timing)"
            variant="soft"
            size="sm"
          >
            {{ counter.reset_timing }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

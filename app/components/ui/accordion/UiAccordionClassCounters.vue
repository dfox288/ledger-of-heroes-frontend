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

/**
 * Column definitions for the table
 */
const columns = [
  { key: 'level', label: 'Level', width: 'w-20' },
  { key: 'counter_name', label: 'Counter' },
  { key: 'counter_value', label: 'Value', width: 'w-24' },
  { key: 'reset_timing', label: 'Reset Timing' }
]
</script>

<template>
  <div
    v-if="counters && counters.length > 0"
    class="p-4"
  >
    <UiAccordionDataTable
      :columns="columns"
      :rows="sortedCounters"
    >
      <template #cell-reset_timing="{ value }">
        <UBadge
          :color="getResetTimingColor(value)"
          variant="soft"
          size="sm"
        >
          {{ value }}
        </UBadge>
      </template>
    </UiAccordionDataTable>
  </div>
</template>

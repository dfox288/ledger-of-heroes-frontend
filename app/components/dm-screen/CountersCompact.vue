<!-- app/components/dm-screen/CountersCompact.vue -->
<script setup lang="ts">
import type { Counter } from '~/types/character'

interface Props {
  counters: Counter[]
}

const props = defineProps<Props>()

// Group counters by reset timing
const groupedCounters = computed(() => {
  const groups: { label: string, counters: Counter[] }[] = []

  const shortRest = props.counters.filter(c => c.reset_on === 'short_rest')
  const longRest = props.counters.filter(c => c.reset_on === 'long_rest')
  const other = props.counters.filter(c => c.reset_on === null)

  if (shortRest.length > 0) {
    groups.push({ label: 'Short Rest', counters: shortRest })
  }
  if (longRest.length > 0) {
    groups.push({ label: 'Long Rest', counters: longRest })
  }
  if (other.length > 0) {
    groups.push({ label: 'Other', counters: other })
  }

  return groups
})

const hasCounters = computed(() => props.counters.length > 0)

// Use pips for counters with 6 or fewer max uses
const usePips = (counter: Counter) => !counter.unlimited && counter.max > 0 && counter.max <= 6

// Get slug for test ID (extract last part of slug)
function getTestId(counter: Counter): string {
  const parts = counter.slug.split(':')
  return (parts[parts.length - 1] ?? counter.slug).toLowerCase()
}

// Determine if counter is depleted (current = 0, max > 0)
function isDepleted(counter: Counter): boolean {
  return !counter.unlimited && counter.max > 0 && counter.current === 0
}
</script>

<template>
  <div
    v-if="hasCounters"
    data-testid="counters-container"
    class="space-y-2"
  >
    <div
      v-for="group in groupedCounters"
      :key="group.label"
    >
      <div class="text-xs text-neutral-400 mb-1">
        {{ group.label }}
      </div>
      <div class="space-y-1">
        <div
          v-for="counter in group.counters"
          :key="counter.id"
          :data-testid="`counter-${getTestId(counter)}`"
          class="flex items-center justify-between text-sm"
          :class="{ 'text-amber-600 dark:text-amber-400': isDepleted(counter) }"
        >
          <span class="font-medium">{{ counter.name }}</span>
          <span class="flex items-center gap-1">
            <!-- Unlimited indicator -->
            <template v-if="counter.unlimited">
              <span class="text-neutral-500">&infin;</span>
            </template>
            <!-- Pip display for small counts -->
            <template v-else-if="usePips(counter)">
              <span class="text-neutral-500 text-xs mr-1">{{ counter.current }}/{{ counter.max }}</span>
              <span class="flex gap-0.5">
                <span
                  v-for="i in counter.max"
                  :key="i"
                  class="w-2 h-2 rounded-full"
                  :class="i <= counter.current
                    ? 'bg-class-500'
                    : 'bg-neutral-300 dark:bg-neutral-600'"
                  :data-testid="i <= counter.current ? `counter-pip-filled-${counter.id}-${i}` : `counter-pip-empty-${counter.id}-${i}`"
                />
              </span>
            </template>
            <!-- Numeric display for large counts -->
            <template v-else>
              <span class="font-mono">{{ counter.current }}/{{ counter.max }}</span>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

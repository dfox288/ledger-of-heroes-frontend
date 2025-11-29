<script setup lang="ts">
import type { CounterFromAPI } from '~/types/api/entities'

interface Props {
  counters: CounterFromAPI[]
}

const props = defineProps<Props>()

/**
 * Parse progression string to extract first and last values
 * Format: "2, 3, 3, 4, 4, 5, ..., Unlimited"
 */
function parseProgressionRange(progression: string): { first: string, last: string } | null {
  if (!progression) return null
  const values = progression.split(',').map(v => v.trim()).filter(v => v)
  if (values.length === 0) return null
  const first = values[0]
  const last = values[values.length - 1]
  if (!first || !last) return null
  return { first, last }
}

/**
 * Process counters for display - new GroupedCounterResource format
 */
const processedCounters = computed(() => {
  return props.counters.map((counter) => {
    const range = parseProgressionRange(counter.progression)

    return {
      name: counter.name,
      resetTiming: counter.reset_timing || 'Unknown',
      startValue: range?.first,
      maxValue: range?.last
    }
  })
})

/**
 * Get reset timing display
 */
function getResetDisplay(resetTiming: string): string {
  return resetTiming
}

/**
 * Get icon for counter type
 */
function getCounterIcon(name: string): string {
  const lowerName = name.toLowerCase()

  if (lowerName.includes('rage')) return 'i-heroicons-fire'
  if (lowerName.includes('ki')) return 'i-heroicons-bolt'
  if (lowerName.includes('sorcery')) return 'i-heroicons-sparkles'
  if (lowerName.includes('superiority')) return 'i-heroicons-cube'
  if (lowerName.includes('channel')) return 'i-heroicons-hand-raised'
  if (lowerName.includes('wild')) return 'i-heroicons-moon'

  return 'i-heroicons-star'
}

/**
 * Get value summary (start -> max)
 */
function getValueSummary(startValue?: string, maxValue?: string): string | null {
  if (!startValue) return null
  if (!maxValue || startValue === maxValue) return startValue

  return `${startValue} → ${maxValue}`
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-class-100 dark:bg-class-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-battery-100"
              class="w-6 h-6 text-class-600 dark:text-class-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Class Resources
          </h3>
        </div>
      </div>

      <!-- Resources List -->
      <div class="space-y-4">
        <div
          v-for="counter in processedCounters"
          :key="counter.name"
          class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
        >
          <div class="flex items-start gap-3">
            <UIcon
              :name="getCounterIcon(counter.name)"
              class="w-5 h-5 text-class-600 dark:text-class-400 mt-0.5 flex-shrink-0"
            />

            <div class="flex-1 space-y-2">
              <!-- Resource Name -->
              <div class="font-semibold text-gray-900 dark:text-gray-100">
                {{ counter.name }}
              </div>

              <!-- Reset Timing -->
              <div class="flex items-center gap-2 text-sm">
                <UBadge
                  color="info"
                  variant="soft"
                  size="md"
                >
                  {{ getResetDisplay(counter.resetTiming) }}
                </UBadge>

                <!-- Value Summary -->
                <span
                  v-if="getValueSummary(counter.startValue, counter.maxValue)"
                  class="text-gray-600 dark:text-gray-400"
                >
                  {{ getValueSummary(counter.startValue, counter.maxValue) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

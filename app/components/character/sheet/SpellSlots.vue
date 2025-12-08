<!-- app/components/character/sheet/SpellSlots.vue -->
<script setup lang="ts">
/**
 * Spell Slots Visual Tracker
 *
 * Displays spell slots per level as visual circles (filled = available, empty = used).
 * Handles warlock pact magic slots separately if present.
 * Only shows levels that have slots.
 */

const props = defineProps<{
  spellSlots: Record<string, number>
  pactSlots?: { count: number, level: number } | null
}>()

/**
 * Convert spell level to ordinal (1st, 2nd, 3rd, etc.)
 */
function ordinal(level: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const value = level % 100
  const v = value - 20
  const suffix = (v >= 0 && v < 10 && suffixes[v]) || suffixes[value] || 'th'
  return level + suffix
}

/**
 * Get sorted list of spell levels that have slots
 */
const sortedLevels = computed(() => {
  return Object.entries(props.spellSlots)
    .filter(([, count]) => count > 0) // Only levels with slots
    .map(([level, count]) => ({ level: Number(level), count }))
    .sort((a, b) => a.level - b.level)
})

/**
 * Check if we have any spell slots to display
 */
const hasStandardSlots = computed(() => sortedLevels.value.length > 0)

/**
 * Check if we have pact slots to display
 */
const hasPactSlots = computed(() => !!props.pactSlots && props.pactSlots.count > 0)
</script>

<template>
  <div class="space-y-4">
    <!-- Standard Spell Slots -->
    <div
      v-if="hasStandardSlots"
      class="space-y-3"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
        Spell Slots
      </h4>

      <div class="space-y-2">
        <div
          v-for="{ level, count } in sortedLevels"
          :key="level"
          class="flex items-center gap-3"
        >
          <!-- Level Label -->
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
            {{ ordinal(level) }}
          </div>

          <!-- Slot Circles -->
          <div class="flex gap-1.5">
            <UIcon
              v-for="i in count"
              :key="`slot-${level}-${i}`"
              name="i-heroicons-circle-stack-solid"
              class="w-5 h-5 text-spell-500 dark:text-spell-400"
              :data-testid="`slot-${level}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Pact Magic Slots (Warlock) -->
    <div
      v-if="hasPactSlots"
      class="space-y-3"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
        Pact Slots
      </h4>

      <div class="flex items-center gap-3">
        <!-- Pact Level Label -->
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ ordinal(pactSlots!.level) }} level
        </div>

        <!-- Pact Slot Circles -->
        <div class="flex gap-1.5">
          <UIcon
            v-for="i in pactSlots!.count"
            :key="`pact-slot-${i}`"
            name="i-heroicons-circle-stack-solid"
            class="w-5 h-5 text-spell-500 dark:text-spell-400"
            data-testid="pact-slot"
          />
        </div>
      </div>
    </div>
  </div>
</template>

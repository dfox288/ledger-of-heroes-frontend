<script setup lang="ts">
/**
 * Spell Slot Indicator
 *
 * Visual indicator for spell slots at a given level.
 * Shows filled/empty circles for slots, grouped by spell level.
 */

interface Props {
  spellSlots: Record<string, number>
  cantripsKnown?: number
}

const props = defineProps<Props>()

/**
 * Format spell slots for display
 */
const formattedSlots = computed(() => {
  const entries = Object.entries(props.spellSlots)
    .filter(([_, count]) => count > 0)
    .map(([level, count]) => ({
      level,
      count,
      // Sort order based on spell level number
      order: parseInt(level.replace(/\D/g, '')) || 0
    }))
    .sort((a, b) => a.order - b.order)

  return entries
})

const hasSlots = computed(() => formattedSlots.value.length > 0)
</script>

<template>
  <div
    v-if="hasSlots || cantripsKnown"
    class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
  >
    <h6 class="text-xs font-semibold text-primary-900 dark:text-primary-100 mb-2">
      Spellcasting
    </h6>

    <!-- Cantrips -->
    <div
      v-if="cantripsKnown && cantripsKnown > 0"
      class="text-xs text-primary-700 dark:text-primary-300 mb-2"
    >
      <span class="font-medium">Cantrips:</span> {{ cantripsKnown }}
    </div>

    <!-- Spell slots by level -->
    <div
      v-if="hasSlots"
      class="space-y-1"
    >
      <div
        v-for="slot in formattedSlots"
        :key="slot.level"
        class="flex items-center gap-2 text-xs"
      >
        <span class="font-medium text-primary-700 dark:text-primary-300 min-w-[2rem]">
          {{ slot.level }}:
        </span>
        <div class="flex gap-0.5">
          <div
            v-for="i in slot.count"
            :key="i"
            class="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"
            :title="`Slot ${i}`"
          />
        </div>
        <span class="text-primary-600 dark:text-primary-400">
          ({{ slot.count }})
        </span>
      </div>
    </div>
  </div>
</template>

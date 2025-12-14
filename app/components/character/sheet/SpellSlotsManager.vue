<!-- app/components/character/sheet/SpellSlotsManager.vue -->
<script setup lang="ts">
/**
 * Interactive Spell Slots Manager
 *
 * Displays spell slots as clickable crystal icons.
 * Filled = available (click to use), Empty = spent (click to restore).
 *
 * @see Issue #616 - Spell slot tracking
 */
import { storeToRefs } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  characterId: number
  editable: boolean
}>()

const store = useCharacterPlayStateStore()
const { spellSlots, isUpdatingSpellSlot } = storeToRefs(store)

/**
 * Convert spell level to ordinal (1st, 2nd, 3rd, etc.)
 * Note: Level 0 = cantrips, which don't use spell slots.
 * Backend should never send level 0 in slot data.
 */
function ordinal(level: number): string {
  // Cantrips (level 0) don't have slots - this shouldn't happen,
  // but handle gracefully just in case
  if (level === 0) return 'Ctrp'

  const suffixes = ['th', 'st', 'nd', 'rd']
  const value = level % 100
  const v = value - 20
  const suffix = (v >= 0 && v < 10 && suffixes[v]) || suffixes[value] || 'th'
  return level + suffix
}

/**
 * Check if interactions are disabled (not editable or updating)
 */
const isDisabled = computed(() => !props.editable || isUpdatingSpellSlot.value)

/**
 * Get sorted list of spell levels that have slots
 * Filters out level 0 (cantrips) which don't use spell slots
 */
const sortedLevels = computed(() => {
  const levels: Array<{ level: number, total: number, spent: number, available: number }> = []

  for (const [level, slot] of spellSlots.value) {
    // Skip level 0 (cantrips don't use spell slots)
    if (level === 0) continue
    if (slot.total > 0) {
      levels.push({
        level,
        total: slot.total,
        spent: slot.spent,
        available: slot.total - slot.spent
      })
    }
  }

  return levels.sort((a, b) => a.level - b.level)
})

/**
 * Handle click on available slot (use it)
 */
async function handleUseSlot(level: number) {
  if (isDisabled.value) return
  try {
    await store.useSpellSlot(level)
  } catch {
    // Toast handled by store or parent
  }
}

/**
 * Handle click on spent slot (restore it)
 */
async function handleRestoreSlot(level: number) {
  if (isDisabled.value) return
  try {
    await store.restoreSpellSlot(level)
  } catch {
    // Toast handled by store or parent
  }
}
</script>

<template>
  <div
    v-if="sortedLevels.length > 0"
    class="space-y-4"
  >
    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
      Spell Slots
    </h4>

    <div class="space-y-2">
      <div
        v-for="{ level, spent, available } in sortedLevels"
        :key="level"
        class="flex items-center gap-3"
      >
        <!-- Level Label -->
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
          {{ ordinal(level) }}
        </div>

        <!-- Slot Crystals -->
        <div class="flex gap-1.5">
          <!-- Available slots (filled) -->
          <button
            v-for="i in available"
            :key="`available-${level}-${i}`"
            :data-testid="`slot-${level}-available`"
            :disabled="isDisabled"
            :class="[
              'w-7 h-7 transition-all',
              !isDisabled ? 'cursor-pointer hover:scale-110' : 'cursor-default opacity-70'
            ]"
            @click="handleUseSlot(level)"
          >
            <UIcon
              name="i-game-icons-crystal-shine"
              class="w-7 h-7 text-spell-500 dark:text-spell-400"
            />
          </button>

          <!-- Spent slots (empty/hollow) -->
          <button
            v-for="i in spent"
            :key="`spent-${level}-${i}`"
            :data-testid="`slot-${level}-spent`"
            :disabled="isDisabled"
            :class="[
              'w-7 h-7 transition-all',
              !isDisabled ? 'cursor-pointer hover:scale-110' : 'cursor-default opacity-70'
            ]"
            @click="handleRestoreSlot(level)"
          >
            <UIcon
              name="i-game-icons-crystal-shine"
              class="w-7 h-7 text-gray-300 dark:text-gray-600"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

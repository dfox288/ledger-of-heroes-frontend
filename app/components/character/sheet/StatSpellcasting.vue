<!-- app/components/character/sheet/StatSpellcasting.vue -->
<script setup lang="ts">
/**
 * Spell Save DC and Attack Bonus Display
 *
 * Shows spellcasting stats for battle page. Handles both single-class
 * and multiclass spellcasters.
 *
 * Single-class: Shows DC / Attack Bonus with ability indicator
 * Multiclass: Shows per-class stats with class name labels
 *
 * @see Issue #766 - Add Spell DC and Attack Bonus to battle page
 */
import type { ClassSpellcastingInfo } from '~/types/character'
import { formatModifier } from '~/utils/formatModifier'

const props = defineProps<{
  spellcasting: Record<string, ClassSpellcastingInfo> | null
}>()

/**
 * Extract class name from slug (e.g., "phb:wizard" -> "Wizard")
 */
function getClassName(slug: string): string {
  const name = slug.split(':')[1] ?? slug
  if (!name) return 'Unknown'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Check if we have any spellcasting data to display
 */
const hasSpellcasting = computed(() => {
  return props.spellcasting !== null && Object.keys(props.spellcasting).length > 0
})

/**
 * Check if multiclass (more than one spellcasting class)
 */
const isMulticlass = computed(() => {
  return props.spellcasting !== null && Object.keys(props.spellcasting).length > 1
})

/**
 * Get spellcasting entries as array for iteration
 */
const spellcastingEntries = computed(() => {
  if (!props.spellcasting) return []
  return Object.entries(props.spellcasting).map(([slug, info]) => ({
    slug,
    className: getClassName(slug),
    ...info
  }))
})
</script>

<template>
  <div
    v-if="hasSpellcasting"
    data-testid="stat-spellcasting"
    class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
  >
    <!-- Header -->
    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
      {{ isMulticlass ? 'Spellcasting' : 'Spell DC / Attack' }}
    </div>

    <!-- Single Class Display -->
    <div
      v-if="!isMulticlass && spellcastingEntries[0]"
      class="text-center"
    >
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ spellcastingEntries[0].spell_save_dc }} / {{ formatModifier(spellcastingEntries[0].spell_attack_bonus) }}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {{ spellcastingEntries[0].ability }}
      </div>
    </div>

    <!-- Multiclass Display -->
    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="entry in spellcastingEntries"
        :key="entry.slug"
        class="flex items-center justify-between"
      >
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ entry.className }}
        </span>
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ entry.spell_save_dc }} / {{ formatModifier(entry.spell_attack_bonus) }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ entry.ability }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

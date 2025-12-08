<!-- app/components/character/sheet/SpellsByLevel.vue -->
<script setup lang="ts">
import type { CharacterSpell } from '~/types/character'

const props = defineProps<{
  spells: CharacterSpell[]
}>()

/**
 * Convert spell level to ordinal format (1st, 2nd, 3rd, etc.)
 */
function getOrdinalLevel(level: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const value = level % 100
  const suffix = suffixes[(value - 20) % 10] ?? suffixes[value] ?? suffixes[0]
  return level + (suffix ?? 'th')
}

/**
 * Group spells by level with counts and sorted lists
 */
const spellsByLevel = computed(() => {
  // Filter out dangling spell references (sourcebook removed)
  const validSpells = props.spells.filter(s => s.spell !== null)

  // Group by level
  const groups = validSpells.reduce((acc, spell) => {
    const level = spell.spell!.level
    if (!acc[level]) {
      acc[level] = []
    }
    acc[level].push(spell)
    return acc
  }, {} as Record<number, CharacterSpell[]>)

  // Convert to array and sort
  return Object.entries(groups)
    .map(([level, spells]) => {
      // Sort spells: prepared first (alphabetically), then unprepared (alphabetically)
      const sortedSpells = [...spells].sort((a, b) => {
        // Primary sort: prepared status (prepared first)
        if (a.is_prepared !== b.is_prepared) {
          return a.is_prepared ? -1 : 1
        }
        // Secondary sort: alphabetical by name
        return a.spell!.name.localeCompare(b.spell!.name)
      })

      const preparedCount = spells.filter(s => s.is_prepared).length
      const totalCount = spells.length

      return {
        level: parseInt(level),
        spells: sortedSpells,
        totalCount,
        preparedCount
      }
    })
    .sort((a, b) => a.level - b.level) // Sort levels ascending
})
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="group in spellsByLevel"
      :key="group.level"
      class="space-y-2"
    >
      <!-- Level Header -->
      <div class="flex items-center gap-2">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ getOrdinalLevel(group.level) }} Level
        </h4>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ group.totalCount }} {{ group.totalCount === 1 ? 'spell' : 'spells' }} &bull; {{ group.preparedCount }} prepared
        </span>
      </div>

      <!-- Spells Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          v-for="spell in group.spells"
          :key="spell.id"
          class="flex items-center gap-2"
        >
          <UIcon
            :name="spell.is_prepared ? 'i-heroicons-check-circle' : 'i-heroicons-circle'"
            :class="spell.is_prepared ? 'text-success-500' : 'text-gray-400 dark:text-gray-500'"
            class="w-4 h-4 flex-shrink-0"
          />
          <span
            :class="spell.is_prepared ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
            class="text-sm"
          >
            {{ spell.spell!.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

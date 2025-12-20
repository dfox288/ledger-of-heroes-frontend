<!-- app/components/character/sheet/SpellsByLevel.vue -->
<script setup lang="ts">
/**
 * Spells grouped by level
 *
 * Displays character spells organized by spell level with SpellCard
 * components that support preparation toggling.
 *
 * @see Issue #556 - Spells Tab
 * @see Issue #616 - Spell preparation toggle
 * @see Issue #778 - Extract spell grouping logic to composable
 */
import type { CharacterSpell } from '~/types/character'
import { groupSpellsByLevel, getSortedLevels } from '~/composables/useSpellGrouping'

const props = defineProps<{
  spells: CharacterSpell[]
  characterId?: number
  editable?: boolean
  atPrepLimit?: boolean
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
 * Filter out dangling spell references
 */
const validSpells = computed(() => props.spells.filter(s => s.spell !== null))

/**
 * Group spells by level with counts and sorted lists.
 * Uses the shared groupSpellsByLevel composable, then applies
 * component-specific sorting (prepared first).
 */
const spellsByLevel = computed(() => {
  // Use shared grouping logic
  const grouped = groupSpellsByLevel(validSpells.value)
  const levels = getSortedLevels(grouped)

  // Convert to array with component-specific sorting and counts
  return levels.map((level) => {
    const spells = grouped[level]!

    // Sort: prepared first (alphabetically), then unprepared (alphabetically)
    const sortedSpells = [...spells].sort((a, b) => {
      if (a.is_prepared !== b.is_prepared) {
        return a.is_prepared ? -1 : 1
      }
      return a.spell!.name.localeCompare(b.spell!.name)
    })

    return {
      level,
      spells: sortedSpells,
      totalCount: spells.length,
      preparedCount: spells.filter(s => s.is_prepared).length
    }
  })
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
          {{ group.level === 0 ? 'Cantrips' : `${getOrdinalLevel(group.level)} Level` }}
        </h4>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ group.totalCount }} {{ group.totalCount === 1 ? (group.level === 0 ? 'cantrip' : 'spell') : (group.level === 0 ? 'cantrips' : 'spells') }}
          <template v-if="group.level > 0">&bull; {{ group.preparedCount }} prepared</template>
        </span>
      </div>

      <!-- Spells Grid using SpellCard -->
      <div class="grid grid-cols-1 gap-2">
        <CharacterSheetSpellCard
          v-for="spell in group.spells"
          :key="spell.id"
          :spell="spell"
          :character-id="characterId"
          :editable="editable"
          :at-prep-limit="atPrepLimit"
        />
      </div>
    </div>
  </div>
</template>

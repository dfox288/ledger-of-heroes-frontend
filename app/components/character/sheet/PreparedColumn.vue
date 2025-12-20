<!-- app/components/character/sheet/PreparedColumn.vue -->
<script setup lang="ts">
/**
 * Prepared column (right side) - currently prepared spells
 *
 * Shows all spells the wizard has prepared for today, grouped by level.
 * Includes always-prepared spells (domain/subclass features).
 *
 * Parent (SpellbookView) provides the reactive prepared count.
 *
 * @see Issue #680 - Wizard Spellbook Phase 2
 * @see Issue #719 - Preparation count reactivity fix
 */
import type { CharacterSpell } from '~/types/character'
import { useSpellGrouping } from '~/composables/useSpellGrouping'

const props = defineProps<{
  spells: CharacterSpell[]
  preparedCount: number
  preparationLimit: number
}>()

const emit = defineEmits<{
  toggle: [spell: CharacterSpell]
}>()

// Only show prepared spells (including always-prepared)
const preparedSpells = computed(() =>
  props.spells.filter(s => (s.is_prepared || s.is_always_prepared) && s.spell !== null)
)

// At limit?
const atLimit = computed(() => props.preparedCount >= props.preparationLimit)

// Group by level (using extracted composable - Issue #778)
const { spellsByLevel, sortedLevels } = useSpellGrouping(preparedSpells)

function formatLevel(level: number): string {
  if (level === 0) return 'Cantrips'
  const suffixes = ['th', 'st', 'nd', 'rd']
  const suffix = suffixes[(level - 20) % 10] ?? suffixes[level] ?? suffixes[0]
  return `${level}${suffix} Level`
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header with counter -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Prepared Today
      </h3>
      <div
        data-testid="prep-counter"
        :class="[
          'text-lg font-medium px-3 py-1 rounded-lg',
          atLimit
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        ]"
      >
        {{ preparedCount }} / {{ preparationLimit }}
      </div>
    </div>

    <!-- Spell list -->
    <div class="flex-1 overflow-y-auto space-y-4">
      <template v-if="preparedSpells.length > 0">
        <div
          v-for="level in sortedLevels"
          :key="level"
          class="space-y-2"
        >
          <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {{ formatLevel(level) }}
          </h4>
          <CharacterSheetSpellbookCard
            v-for="spell in spellsByLevel[level]"
            :key="spell.id"
            :spell="spell"
            column="prepared"
            @toggle="emit('toggle', $event)"
          />
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-else
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-book-open"
          class="w-8 h-8 mx-auto mb-2"
        />
        <p>No spells prepared</p>
        <p class="text-sm mt-1">
          Click spells in your spellbook to prepare them
        </p>
      </div>
    </div>
  </div>
</template>

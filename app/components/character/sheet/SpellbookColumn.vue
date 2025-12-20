<!-- app/components/character/sheet/SpellbookColumn.vue -->
<script setup lang="ts">
/**
 * Spellbook column (left side) - unprepared spells with filters
 *
 * Shows all spells in the wizard's spellbook that are NOT currently prepared.
 * Includes search and filter controls.
 *
 * @see Issue #680 - Wizard Spellbook Phase 2
 */
import type { CharacterSpell } from '~/types/character'
import { useSpellGrouping } from '~/composables/useSpellGrouping'

const props = defineProps<{
  spells: CharacterSpell[]
  atPrepLimit: boolean
}>()

const emit = defineEmits<{
  toggle: [spell: CharacterSpell]
}>()

// Filter state (local, not persisted)
const searchQuery = ref('')
const selectedSchool = ref<string | null>(null)
const selectedLevel = ref<number | null>(null)
const concentrationOnly = ref(false)
const ritualOnly = ref(false)

// Only show unprepared spells (not including always-prepared)
const unpreparedSpells = computed(() =>
  props.spells.filter(s => !s.is_prepared && !s.is_always_prepared && s.spell !== null)
)

// Apply filters
const filteredSpells = computed(() => {
  let result = unpreparedSpells.value

  // Search by name
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s => s.spell!.name.toLowerCase().includes(query))
  }

  // Filter by school
  if (selectedSchool.value) {
    result = result.filter(s => s.spell!.school === selectedSchool.value)
  }

  // Filter by level
  if (selectedLevel.value !== null) {
    result = result.filter(s => s.spell!.level === selectedLevel.value)
  }

  // Concentration only
  if (concentrationOnly.value) {
    result = result.filter(s => s.spell!.concentration)
  }

  // Ritual only
  if (ritualOnly.value) {
    result = result.filter(s => s.spell!.ritual)
  }

  return result
})

// Group by level (using extracted composable - Issue #778)
const { spellsByLevel, sortedLevels } = useSpellGrouping(filteredSpells)

function formatLevel(level: number): string {
  if (level === 0) return 'Cantrips'
  const suffixes = ['th', 'st', 'nd', 'rd']
  const suffix = suffixes[(level - 20) % 10] ?? suffixes[level] ?? suffixes[0]
  return `${level}${suffix} Level`
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Spellbook
        <span class="text-sm font-normal text-gray-500">
          ({{ unpreparedSpells.length }} spells)
        </span>
      </h3>
    </div>

    <!-- Filters -->
    <CharacterSheetSpellbookFilters
      v-model:search-query="searchQuery"
      v-model:selected-school="selectedSchool"
      v-model:selected-level="selectedLevel"
      v-model:concentration-only="concentrationOnly"
      v-model:ritual-only="ritualOnly"
      class="mb-4"
    />

    <!-- Spell list -->
    <div class="flex-1 overflow-y-auto space-y-4">
      <template v-if="filteredSpells.length > 0">
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
            column="spellbook"
            :at-prep-limit="atPrepLimit"
            @toggle="emit('toggle', $event)"
          />
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-else
        data-testid="empty-state"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="w-8 h-8 mx-auto mb-2"
        />
        <p>No matching spells</p>
        <p class="text-sm mt-1">
          Try adjusting your filters
        </p>
      </div>
    </div>
  </div>
</template>

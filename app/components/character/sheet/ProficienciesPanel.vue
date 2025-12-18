<!-- app/components/character/sheet/ProficienciesPanel.vue -->
<script setup lang="ts">
/**
 * Proficiencies Panel - Card Display
 *
 * Shows character proficiencies (weapons, armor, tools) grouped by category.
 * Displays as a card matching other sheet components.
 * Conditionally renders only when proficiencies exist.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import type { CharacterProficiency } from '~/types/character'

const props = defineProps<{
  proficiencies: CharacterProficiency[]
}>()

// Filter to only non-skill proficiencies (tools, weapons, armor)
const typeProficiencies = computed(() =>
  props.proficiencies.filter(p => p.proficiency_type)
)

// Check if panel should render
const hasProficiencies = computed(() => typeProficiencies.value.length > 0)

// Group by category
const proficienciesByCategory = computed(() => {
  const grouped: Record<string, CharacterProficiency[]> = {}
  for (const prof of typeProficiencies.value) {
    const category = prof.proficiency_type?.category ?? 'other'
    if (!grouped[category]) grouped[category] = []
    grouped[category].push(prof)
  }
  return grouped
})
</script>

<template>
  <div
    v-if="hasProficiencies"
    class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
  >
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Proficiencies
    </h3>
    <div class="space-y-3">
      <div
        v-for="(profs, category) in proficienciesByCategory"
        :key="category"
      >
        <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {{ category }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="prof in profs"
            :key="prof.id ?? prof.proficiency_type_slug"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ prof.proficiency_type?.name }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

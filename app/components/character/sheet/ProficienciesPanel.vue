<!-- app/components/character/sheet/ProficienciesPanel.vue -->
<script setup lang="ts">
import type { CharacterProficiency } from '~/types/character'

const props = defineProps<{
  proficiencies: CharacterProficiency[]
}>()

// Filter to only non-skill proficiencies (tools, weapons, armor)
const typeProficiencies = computed(() =>
  props.proficiencies.filter(p => p.proficiency_type)
)

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
  <div class="space-y-4">
    <div
      v-if="typeProficiencies.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No proficiencies yet
    </div>

    <template v-else>
      <div
        v-for="(profs, category) in proficienciesByCategory"
        :key="category"
      >
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {{ category }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="prof in profs"
            :key="prof.id"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ prof.proficiency_type?.name }}
          </UBadge>
        </div>
      </div>
    </template>
  </div>
</template>

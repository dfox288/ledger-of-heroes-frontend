<script setup lang="ts">
import type { EntityPrerequisiteResource } from '~/types/api/entities'

interface Props {
  prerequisites: EntityPrerequisiteResource[]
}

defineProps<Props>()

/**
 * Format prerequisite for display
 */
const formatPrerequisite = (prereq: EntityPrerequisiteResource): string => {
  // Custom description takes precedence
  if (prereq.description) {
    return prereq.description
  }

  // Ability score prerequisite
  if (prereq.ability_score) {
    return `${prereq.ability_score.name} ${prereq.minimum_value} or higher`
  }

  // Race prerequisite
  if (prereq.race) {
    return `Must be a ${prereq.race.name}`
  }

  // Skill prerequisite
  if (prereq.skill) {
    return `Proficient in ${prereq.skill.name}`
  }

  // Proficiency type prerequisite
  if (prereq.proficiency_type) {
    return `Proficient with ${prereq.proficiency_type.name}`
  }

  // Fallback
  return prereq.prerequisite_type || 'Unknown prerequisite'
}
</script>

<template>
  <div
    v-if="prerequisites && prerequisites.length > 0"
    class="p-4"
  >
    <ul class="space-y-2">
      <li
        v-for="prereq in prerequisites"
        :key="prereq.id"
        class="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
      >
        <span class="text-gray-400 dark:text-gray-600">•</span>
        <span>{{ formatPrerequisite(prereq) }}</span>
      </li>
    </ul>
  </div>
</template>

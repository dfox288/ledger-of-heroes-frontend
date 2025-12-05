<!-- app/components/character/sheet/SkillsList.vue -->
<script setup lang="ts">
import type { CharacterSkill } from '~/types/character'

defineProps<{
  skills: CharacterSkill[]
}>()

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Skills
    </h3>
    <div class="space-y-1">
      <div
        v-for="skill in skills"
        :key="skill.id"
        class="flex items-center gap-2 py-1"
      >
        <!-- Proficiency/Expertise indicator -->
        <div
          role="img"
          :aria-label="skill.expertise ? 'Expertise' : (skill.proficient ? 'Proficient' : 'Not proficient')"
          class="w-3 h-3 rounded-full border-2 flex-shrink-0"
          :class="{
            'bg-primary-500 border-primary-500': skill.expertise,
            'bg-success-500 border-success-500': skill.proficient && !skill.expertise,
            'border-gray-400 dark:border-gray-500': !skill.proficient
          }"
          :data-test="skill.expertise ? 'expertise' : (skill.proficient ? 'proficient' : 'not-proficient')"
        />
        <!-- Modifier -->
        <span class="text-sm font-bold text-gray-900 dark:text-white w-8">
          {{ formatModifier(skill.modifier) }}
        </span>
        <!-- Skill name -->
        <span class="text-sm text-gray-700 dark:text-gray-300 flex-1">
          {{ skill.name }}
        </span>
        <!-- Ability code -->
        <span class="text-xs text-gray-400 dark:text-gray-500 uppercase">
          {{ skill.ability_code }}
        </span>
      </div>
    </div>
  </div>
</template>

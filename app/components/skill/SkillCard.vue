<script setup lang="ts">
interface Skill {
  id: number
  name: string
  ability_score?: {
    id: number
    code: string
    name: string
  } | null
}

interface Props {
  skill: Skill
}

defineProps<Props>()
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
    <div class="space-y-3">
      <!-- Skill Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ skill.name }}
      </h3>

      <!-- Ability Score (if present) -->
      <div v-if="skill.ability_score" class="space-y-2">
        <div class="flex items-center gap-2">
          <UBadge color="info" variant="solid" size="md">
            {{ skill.ability_score.code }}
          </UBadge>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ skill.ability_score.name }}
        </p>
      </div>

      <!-- Category Badge -->
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="soft" size="xs">
          Skill
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

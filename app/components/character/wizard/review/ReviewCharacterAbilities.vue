<!-- app/components/character/wizard/review/ReviewCharacterAbilities.vue -->
<script setup lang="ts">
/**
 * Ability scores card - displays all 6 ability scores with modifiers
 */

interface AbilityScore {
  code: string
  name: string
  score: number
  modifier: number
  formattedModifier: string
}

defineProps<{
  abilityScores: AbilityScore[] | null
}>()
</script>

<template>
  <UCard :ui="{ body: 'p-4' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-chart-bar"
          class="w-5 h-5 text-primary"
        />
        <span class="font-semibold text-gray-900 dark:text-white">Ability Scores</span>
      </div>
    </template>

    <div
      v-if="abilityScores"
      class="space-y-3"
    >
      <div
        v-for="ability in abilityScores"
        :key="ability.code"
        class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
      >
        <span class="font-medium text-gray-900 dark:text-white">
          {{ ability.name }}
        </span>
        <div class="text-right">
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ ability.score }}
          </span>
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
            ({{ ability.formattedModifier }})
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

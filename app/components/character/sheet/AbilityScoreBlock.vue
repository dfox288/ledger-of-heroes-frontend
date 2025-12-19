<!-- app/components/character/sheet/AbilityScoreBlock.vue -->
<script setup lang="ts">
import type { CharacterStats, AbilityScoreCode } from '~/types/character'
import { formatModifier } from '~/utils/formatModifier'

defineProps<{
  stats: CharacterStats
}>()

const abilities: AbilityScoreCode[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Abilities
    </h3>
    <div class="space-y-1">
      <div
        v-for="ability in abilities"
        :key="ability"
        class="flex items-center justify-between"
      >
        <span class="text-xs font-bold text-gray-500 dark:text-gray-400 w-10">
          {{ ability }}
        </span>
        <span class="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
          {{ stats.ability_scores[ability]?.score ?? '—' }}
        </span>
        <span class="text-sm font-semibold text-primary-600 dark:text-primary-400 w-10 text-right tabular-nums">
          {{ formatModifier(stats.ability_scores[ability]?.modifier ?? null) }}
        </span>
      </div>
    </div>
  </div>
</template>

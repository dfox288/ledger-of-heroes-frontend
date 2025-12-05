<!-- app/components/character/sheet/AbilityScoreBlock.vue -->
<script setup lang="ts">
import type { CharacterStats, AbilityScoreCode } from '~/types/character'

defineProps<{
  stats: CharacterStats
}>()

const abilities: { code: AbilityScoreCode, label: string }[] = [
  { code: 'STR', label: 'STR' },
  { code: 'DEX', label: 'DEX' },
  { code: 'CON', label: 'CON' },
  { code: 'INT', label: 'INT' },
  { code: 'WIS', label: 'WIS' },
  { code: 'CHA', label: 'CHA' }
]

/**
 * Format modifier with sign
 */
function formatModifier(mod: number | null): string {
  if (mod === null) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="ability in abilities"
      :key="ability.code"
      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div class="text-sm font-bold text-gray-500 dark:text-gray-400 w-12">
        {{ ability.label }}
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ stats.ability_scores[ability.code]?.score ?? '—' }}
      </div>
      <div class="text-lg font-semibold text-primary-600 dark:text-primary-400 w-12 text-right">
        {{ formatModifier(stats.ability_scores[ability.code]?.modifier ?? null) }}
      </div>
    </div>
  </div>
</template>

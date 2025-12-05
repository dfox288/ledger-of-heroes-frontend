<!-- app/components/character/sheet/CombatStatsGrid.vue -->
<script setup lang="ts">
import type { Character, CharacterStats } from '~/types/character'

defineProps<{
  character: Character
  stats: CharacterStats
}>()

function formatModifier(value: number | null): string {
  if (value === null) return '—'
  return value >= 0 ? `+${value}` : `${value}`
}
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <!-- Row 1: HP, AC, Initiative -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        HP
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ stats.hit_points?.current ?? '—' }}
        <span class="text-lg text-gray-400">/</span>
        {{ stats.hit_points?.max ?? '—' }}
      </div>
      <div
        v-if="stats.hit_points?.temporary && stats.hit_points.temporary > 0"
        class="text-sm text-success-600 dark:text-success-400"
      >
        +{{ stats.hit_points.temporary }} temp
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        AC
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ stats.armor_class ?? '—' }}
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Initiative
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ formatModifier(stats.initiative_bonus) }}
      </div>
    </div>

    <!-- Row 2: Speed, Proficiency, Passive Perception -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Speed
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ character.speed ?? '—' }} <span class="text-sm font-normal">ft</span>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Prof Bonus
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ formatModifier(character.proficiency_bonus) }}
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Passive Perc
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ stats.passive_perception ?? '—' }}
      </div>
    </div>
  </div>
</template>

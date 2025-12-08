<!-- app/components/character/sheet/CombatStatsGrid.vue -->
<script setup lang="ts">
import type { Character, CharacterStats } from '~/types/character'

const props = defineProps<{
  character: Character
  stats: CharacterStats
}>()

function formatModifier(value: number | null): string {
  if (value === null) return '—'
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Get alternate movement speeds (fly, swim, climb) that have values
 * Returns array of { type, speed } for display
 */
const alternateSpeeds = computed(() => {
  if (!props.character.speeds) return []

  const speeds: { type: string, speed: number }[] = []

  if (props.character.speeds.fly) {
    speeds.push({ type: 'fly', speed: props.character.speeds.fly })
  }
  if (props.character.speeds.swim) {
    speeds.push({ type: 'swim', speed: props.character.speeds.swim })
  }
  if (props.character.speeds.climb) {
    speeds.push({ type: 'climb', speed: props.character.speeds.climb })
  }

  return speeds
})
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
      <div
        v-if="alternateSpeeds.length > 0"
        class="text-xs text-gray-500 dark:text-gray-400 mt-1"
      >
        <span
          v-for="(alt, index) in alternateSpeeds"
          :key="alt.type"
        >
          {{ alt.type }} {{ alt.speed }}<span v-if="index < alternateSpeeds.length - 1">, </span>
        </span>
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

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
        Passive
      </div>
      <div class="space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-600 dark:text-gray-400">Perc</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ stats.passive_perception ?? '—' }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-600 dark:text-gray-400">Inv</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ stats.passive_investigation ?? '—' }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-600 dark:text-gray-400">Ins</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            {{ stats.passive_insight ?? '—' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

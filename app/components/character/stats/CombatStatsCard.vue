<!-- app/components/character/stats/CombatStatsCard.vue -->
<script setup lang="ts">
/**
 * Combat stats display card for the character builder.
 *
 * Displays:
 * - Hit Points (HP)
 * - Armor Class (AC)
 * - Initiative modifier
 * - Speed
 * - Proficiency Bonus
 */

interface Props {
  hitPoints: number | string
  armorClass: number
  initiative: string
  speed: number
  proficiencyBonus: string
}

defineProps<Props>()
</script>

<template>
  <UCard
    data-testid="combat-stats-card"
    :ui="{ body: 'p-4' }"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-shield-check"
          class="w-5 h-5 text-primary"
        />
        <span class="font-semibold text-gray-900 dark:text-white">Combat Stats</span>
      </div>
    </template>

    <div class="grid grid-cols-5 gap-4 text-center">
      <!-- Hit Points -->
      <div class="flex flex-col items-center">
        <div
          data-testid="hp-value"
          class="text-2xl font-bold text-red-600 dark:text-red-400"
        >
          {{ hitPoints }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          HP
        </div>
      </div>

      <!-- Armor Class -->
      <div class="flex flex-col items-center">
        <div
          data-testid="ac-value"
          class="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          {{ armorClass }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          AC
        </div>
      </div>

      <!-- Initiative -->
      <div class="flex flex-col items-center">
        <div
          data-testid="init-value"
          class="text-2xl font-bold text-green-600 dark:text-green-400"
        >
          {{ initiative }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Initiative
        </div>
      </div>

      <!-- Speed -->
      <div class="flex flex-col items-center">
        <div
          data-testid="speed-value"
          class="text-2xl font-bold text-amber-600 dark:text-amber-400"
        >
          {{ speed }}
          <span class="text-sm font-normal">ft</span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Speed
        </div>
      </div>

      <!-- Proficiency Bonus -->
      <div class="flex flex-col items-center">
        <div
          data-testid="prof-value"
          class="text-2xl font-bold text-purple-600 dark:text-purple-400"
        >
          {{ proficiencyBonus }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Proficiency
        </div>
      </div>
    </div>
  </UCard>
</template>

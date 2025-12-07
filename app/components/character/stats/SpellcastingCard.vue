<!-- app/components/character/stats/SpellcastingCard.vue -->
<script setup lang="ts">
/**
 * Spellcasting info display card for the character builder.
 *
 * Displays:
 * - Spellcasting ability
 * - Spell save DC
 * - Spell attack bonus
 * - Spell slots by level (optional)
 */

interface Props {
  ability: string
  abilityName: string
  saveDC: number
  attackBonus: number
  formattedAttackBonus: string
  slots?: Record<number, number>
}

const props = defineProps<Props>()

const hasSlots = computed(() =>
  props.slots && Object.keys(props.slots).length > 0
)

function getOrdinal(level: number): string {
  if (level === 1) return '1st'
  if (level === 2) return '2nd'
  if (level === 3) return '3rd'
  return `${level}th`
}
</script>

<template>
  <UCard
    data-testid="spellcasting-card"
    :ui="{ body: 'p-4' }"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-sparkles"
          class="w-5 h-5 text-arcane-500"
        />
        <span class="font-semibold text-gray-900 dark:text-white">Spellcasting</span>
      </div>
    </template>

    <!-- Main stats row -->
    <div class="grid grid-cols-3 gap-4 text-center mb-4">
      <!-- Spellcasting Ability -->
      <div class="flex flex-col items-center">
        <div
          data-testid="ability-value"
          class="text-lg font-bold text-arcane-600 dark:text-arcane-400"
        >
          {{ abilityName }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Ability
        </div>
      </div>

      <!-- Spell Save DC -->
      <div class="flex flex-col items-center">
        <div
          data-testid="save-dc-value"
          class="text-2xl font-bold text-arcane-600 dark:text-arcane-400"
        >
          {{ saveDC }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Save DC
        </div>
      </div>

      <!-- Spell Attack Bonus -->
      <div class="flex flex-col items-center">
        <div
          data-testid="attack-bonus-value"
          class="text-2xl font-bold text-arcane-600 dark:text-arcane-400"
        >
          {{ formattedAttackBonus }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Spell Attack
        </div>
      </div>
    </div>

    <!-- Spell Slots -->
    <div
      v-if="hasSlots"
      data-testid="spell-slots"
      class="pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Spell Slots
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(count, level) in slots"
          :key="level"
          :data-testid="`slot-level-${level}`"
          class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-arcane-50 dark:bg-arcane-900/20"
        >
          <span class="text-xs font-medium text-arcane-700 dark:text-arcane-300">
            {{ getOrdinal(Number(level)) }}
          </span>
          <span class="text-xs font-bold text-arcane-900 dark:text-arcane-100">
            {{ count }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

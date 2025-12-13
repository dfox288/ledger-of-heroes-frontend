<!-- app/components/character/sheet/CombatStatsGrid.vue -->
<script setup lang="ts">
/**
 * Combat Stats Grid
 *
 * Displays the 6-cell grid of combat stats: HP, AC, Initiative, Speed, Prof Bonus, Currency.
 * Uses manager components (HitPointsManager, CurrencyManager) for stateful cells
 * that read from characterPlayState store.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import type { Character, CharacterStats } from '~/types/character'

defineProps<{
  character: Character
  stats: CharacterStats
  editable?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <!-- Row 1: HP (via manager), AC, Initiative -->
    <CharacterSheetHitPointsManager :editable="editable" />

    <CharacterSheetStatArmorClass
      :armor-class="stats.armor_class"
      :character="character"
    />

    <CharacterSheetStatInitiative
      :bonus="stats.initiative_bonus"
    />

    <!-- Row 2: Speed, Proficiency, Currency (via manager) -->
    <CharacterSheetStatSpeed
      :speed="character.speed"
      :speeds="character.speeds"
    />

    <CharacterSheetStatProficiencyBonus
      :bonus="character.proficiency_bonus"
    />

    <CharacterSheetCurrencyManager :editable="editable" />
  </div>
</template>

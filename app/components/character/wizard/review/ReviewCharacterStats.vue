<!-- app/components/character/wizard/review/ReviewCharacterStats.vue -->
<script setup lang="ts">
/**
 * Combat stats section - includes combat stats, saving throws, and spellcasting cards
 */

import type { SavingThrowDisplay, SpellcastingDisplay } from '~/composables/useCharacterStats'

defineProps<{
  hitPoints: number | null
  armorClass: number | null
  initiative: string | null
  speed: number
  proficiencyBonus: string | null
  savingThrows: SavingThrowDisplay[] | null
  isSpellcaster: boolean
  spellcasting: SpellcastingDisplay | null
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Combat Stats Card -->
    <CharacterStatsCombatStatsCard
      :hit-points="hitPoints ?? '-'"
      :armor-class="armorClass ?? 10"
      :initiative="initiative ?? '+0'"
      :speed="speed"
      :proficiency-bonus="proficiencyBonus ?? '+2'"
    />

    <!-- Saving Throws Card -->
    <CharacterStatsSavingThrowsCard
      v-if="savingThrows"
      :saving-throws="savingThrows"
    />

    <!-- Spellcasting Card (conditional) -->
    <CharacterStatsSpellcastingCard
      v-if="isSpellcaster && spellcasting"
      :ability="spellcasting.ability"
      :ability-name="spellcasting.abilityName"
      :save-d-c="spellcasting.saveDC"
      :attack-bonus="spellcasting.attackBonus"
      :formatted-attack-bonus="spellcasting.formattedAttackBonus"
    />
  </div>
</template>

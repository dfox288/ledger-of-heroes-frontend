<!-- app/components/character/wizard/StepReview.vue -->
<script setup lang="ts">
/**
 * Final review step - shows complete character summary before finishing
 *
 * Displays:
 * - Character name and identity (race/class/background)
 * - Ability scores
 * - Combat stats (HP, AC, Initiative, Speed, Proficiency)
 * - Saving throws
 * - Spellcasting (if spellcaster)
 * - Proficiencies
 * - Languages
 * - Equipment
 * - Spells (if spellcaster)
 */

import { useCharacterWizardStore } from '~/stores/characterWizard'

const store = useCharacterWizardStore()

// Fetch character stats
const {
  hitPoints,
  armorClass,
  initiative,
  proficiencyBonus,
  savingThrows,
  spellcasting,
  abilityScores,
  isSpellcaster,
} = useCharacterStats(computed(() => store.characterId))

// Speed comes from race, not stats endpoint
// For now, use the most common default (30 ft)
// TODO: Fetch from character/race data when available
const speed = computed(() => store.selections.race?.speed ?? 30)

// Character identity
const characterName = computed(() => store.selections.name || 'Unnamed Character')
const race = computed(() => store.selections.race?.name || 'Unknown')
const characterClass = computed(() => store.selections.class?.name || 'Unknown')
const background = computed(() => store.selections.background?.name || 'Unknown')
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header: Character Name and Identity -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ characterName }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ race }} · {{ characterClass }} · {{ background }}
        </p>
      </div>
      <UButton
        variant="ghost"
        label="Edit Details"
        icon="i-heroicons-pencil-square"
      />
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Ability Scores -->
      <div class="lg:col-span-1">
        <UCard :ui="{ body: 'p-4' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-primary" />
              <span class="font-semibold text-gray-900 dark:text-white">Ability Scores</span>
            </div>
          </template>

          <div v-if="abilityScores" class="space-y-3">
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
      </div>

      <!-- Right Column: Combat Stats and Saving Throws -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Combat Stats Card -->
        <CharacterStatsCombatStatsCard
          :hit-points="hitPoints"
          :armor-class="armorClass"
          :initiative="initiative"
          :speed="speed"
          :proficiency-bonus="proficiencyBonus"
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
    </div>

    <!-- Additional Sections -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Proficiencies -->
      <UCard :ui="{ body: 'p-4' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-primary" />
            <span class="font-semibold text-gray-900 dark:text-white">Proficiencies</span>
          </div>
        </template>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          <p>Armor, weapons, tools, and skills will be displayed here.</p>
        </div>
      </UCard>

      <!-- Languages -->
      <UCard :ui="{ body: 'p-4' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-language" class="w-5 h-5 text-primary" />
            <span class="font-semibold text-gray-900 dark:text-white">Languages</span>
          </div>
        </template>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          <p>Known languages will be displayed here.</p>
        </div>
      </UCard>
    </div>

    <!-- Equipment -->
    <UCard :ui="{ body: 'p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-primary" />
          <span class="font-semibold text-gray-900 dark:text-white">Equipment</span>
        </div>
      </template>

      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p>Selected equipment will be displayed here.</p>
      </div>
    </UCard>

    <!-- Spells (conditional) -->
    <UCard v-if="isSpellcaster" :ui="{ body: 'p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-arcane-500" />
          <span class="font-semibold text-gray-900 dark:text-white">Spells</span>
        </div>
      </template>

      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p>Known and prepared spells will be displayed here.</p>
      </div>
    </UCard>
  </div>
</template>

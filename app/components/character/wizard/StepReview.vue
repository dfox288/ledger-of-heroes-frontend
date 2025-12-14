<!-- app/components/character/wizard/StepReview.vue -->
<script setup lang="ts">
/**
 * Final review step - shows complete character summary before finishing
 *
 * Reuses character sheet components to provide a preview of the final
 * character sheet. This ensures consistency between the review and the
 * actual character view page.
 *
 * Uses useCharacterSheet composable to fetch all character data in parallel.
 */

import { useCharacterWizardStore } from '~/stores/characterWizard'

const store = useCharacterWizardStore()
const router = useRouter()

// Convert characterId to ref for useCharacterSheet
// By the time we reach the Review step, characterId should always be set
// The fallback to 0 satisfies the type but would show loading/empty state if somehow null
const characterId = computed(() => store.characterId ?? 0)

/**
 * Fetch all character data using the same composable as the character sheet page.
 * This ensures we display exactly what the final character sheet will show.
 */
const {
  character,
  stats,
  proficiencies,
  features,
  equipment,
  spells,
  languages,
  skills,
  savingThrows,
  hitDice,
  loading
} = useCharacterSheet(characterId)

/**
 * Finish wizard and navigate to character sheet
 */
async function finishWizard() {
  await router.push(`/characters/${store.publicId}`)
  store.reset()
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <USkeleton class="h-20 w-full" />
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <USkeleton class="h-80" />
        <div class="space-y-4">
          <USkeleton class="h-32" />
          <USkeleton class="h-48" />
        </div>
      </div>
    </div>

    <!-- Character Preview (reuses sheet components) -->
    <template v-else-if="character && stats">
      <!-- Header -->
      <CharacterSheetHeader :character="character" />

      <!-- Main Grid: Abilities sidebar + Stats/Skills -->
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <!-- Left Sidebar: Ability Scores + Passive + Hit Dice -->
        <div class="space-y-4">
          <CharacterSheetAbilityScoreBlock :stats="stats" />
          <CharacterSheetPassiveScores
            :perception="stats.passive_perception"
            :investigation="stats.passive_investigation"
            :insight="stats.passive_insight"
          />
          <CharacterSheetHitDice
            v-if="hitDice.length"
            :hit-dice="hitDice"
          />
        </div>

        <!-- Right: Combat Stats + Saves/Skills -->
        <div class="space-y-6">
          <!-- Combat Stats Grid -->
          <CharacterSheetCombatStatsGrid
            :character="character"
            :stats="stats"
          />

          <!-- Saving Throws and Skills -->
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Saving Throws + Death Saves stacked -->
            <div class="space-y-4">
              <CharacterSheetSavingThrowsList :saving-throws="savingThrows" />
              <CharacterSheetDeathSaves
                :successes="character.death_save_successes"
                :failures="character.death_save_failures"
              />
            </div>
            <CharacterSheetSkillsList
              :skills="skills"
              class="md:col-span-2"
            />
          </div>
        </div>
      </div>

      <!-- Features, Proficiencies, Equipment, Spells, Languages -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CharacterSheetProficienciesPanel :proficiencies="proficiencies" />
        <CharacterSheetLanguagesPanel :languages="languages" />
      </div>

      <!-- Equipment -->
      <CharacterSheetEquipmentPanel
        :equipment="equipment"
        :carrying-capacity="stats?.carrying_capacity"
        :push-drag-lift="stats?.push_drag_lift"
      />

      <!-- Spells (conditional) - read-only in review mode -->
      <CharacterSheetSpellsPanel
        v-if="stats.spellcasting && character"
        :spells="spells"
        :stats="stats"
        :character-id="character.id"
        :editable="false"
      />

      <!-- Features -->
      <CharacterSheetFeaturesPanel :features="features" />

      <!-- Finish Button -->
      <div class="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
        <UButton
          data-testid="finish-btn"
          size="xl"
          color="primary"
          @click="finishWizard"
        >
          <UIcon
            name="i-heroicons-check-circle"
            class="w-5 h-5 mr-2"
          />
          Create Character
        </UButton>
      </div>
    </template>
  </div>
</template>

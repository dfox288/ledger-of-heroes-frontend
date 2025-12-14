<!-- app/pages/characters/[publicId]/index.vue -->
<script setup lang="ts">
/**
 * Character View Page - Full Character Sheet
 *
 * Displays comprehensive D&D 5e character sheet with all data sections.
 * Uses useCharacterSheet composable for parallel data fetching.
 * Uses characterPlayState store for interactive play mode state (HP, currency, death saves).
 *
 * URL: /characters/:publicId (e.g., /characters/shadow-warden-q3x9)
 *
 * Play Mode: Toggle to enable interactive features (death saves, HP, etc.)
 *
 * @see Issue #584 - Character sheet component refactor
 */
import { storeToRefs } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)

const {
  character,
  stats,
  proficiencies,
  features,
  equipment,
  spells,
  languages,
  conditions,
  skills,
  skillAdvantages,
  savingThrows,
  hitDice,
  loading,
  error,
  refresh,
  refreshHitDice,
  refreshForShortRest,
  refreshForLongRest
} = useCharacterSheet(publicId)

// ============================================================================
// Play State Store
// ============================================================================

const playStateStore = useCharacterPlayStateStore()

/**
 * Initialize play state store when character and stats load
 * Store manages HP, death saves, and currency state for play mode
 */
watch([character, stats], ([char, s]) => {
  if (char && s) {
    playStateStore.initialize({
      characterId: char.id,
      isDead: char.is_dead ?? false,
      hitPoints: {
        current: s.hit_points?.current ?? null,
        max: s.hit_points?.max ?? null,
        temporary: s.hit_points?.temporary ?? null
      },
      deathSaves: {
        successes: char.death_save_successes ?? 0,
        failures: char.death_save_failures ?? 0
      },
      currency: char.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    })
  }
}, { immediate: true })

// Reset store when leaving the page
onUnmounted(() => {
  playStateStore.$reset()
})

// ============================================================================
// Play Mode (from store)
// ============================================================================

/**
 * canEdit is now computed in the store (isPlayMode && !isDead)
 * This removes the need for the ref pattern to access PageHeader's isPlayMode
 */
const { canEdit } = storeToRefs(playStateStore)

// Validation - check for dangling references when sourcebooks are removed
const characterId = computed(() => character.value?.id ?? null)
const { validationResult, validateReferences } = useCharacterValidation(characterId)

// Trigger validation once character is loaded
watch(characterId, async (newId) => {
  if (newId) {
    await validateReferences()
  }
}, { immediate: true })

useSeoMeta({
  title: () => character.value?.name ?? 'Character Sheet',
  description: () => `View ${character.value?.name ?? 'character'} - D&D 5e Character Sheet`
})

// Tab items for bottom section (Equipment moved to /inventory, Notes to /notes)
const tabItems = computed(() => {
  const items = [
    { label: 'Features', slot: 'features', icon: 'i-heroicons-star' },
    { label: 'Proficiencies', slot: 'proficiencies', icon: 'i-heroicons-academic-cap' },
    { label: 'Languages', slot: 'languages', icon: 'i-heroicons-language' }
  ]
  // Only show Spells tab for casters
  if (stats.value?.spellcasting) {
    items.splice(2, 0, { label: 'Spells', slot: 'spells', icon: 'i-heroicons-sparkles' })
  }
  return items
})

// Is this character a spellcaster? (for TabNavigation)
const isSpellcaster = computed(() => !!stats.value?.spellcasting)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <USkeleton class="h-32 w-full" />
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <USkeleton class="h-80" />
        <div class="space-y-4">
          <USkeleton class="h-32" />
          <USkeleton class="h-48" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load character"
      :description="error.message"
    />

    <!-- Character Sheet -->
    <div
      v-else-if="character && stats"
      class="space-y-6"
    >
      <!-- Unified Page Header (back button, play mode, portrait, actions, tabs) -->
      <CharacterPageHeader
        :character="character"
        :is-spellcaster="isSpellcaster"
        @updated="refresh"
      />

      <!-- Validation Warning - shows when sourcebook content was removed -->
      <CharacterSheetValidationWarning :validation-result="validationResult" />

      <!-- Active Conditions - only shows when character has conditions -->
      <CharacterSheetConditionsManager
        v-if="conditions.length > 0 && character"
        :conditions="conditions"
        :character-id="character.id"
        :editable="canEdit"
        @refresh="refresh"
      />

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
          <CharacterSheetHitDiceManager
            v-if="hitDice.length && character"
            :hit-dice="hitDice"
            :character-id="character.id"
            :editable="canEdit"
            @refresh-hit-dice="refreshHitDice"
            @refresh-short-rest="refreshForShortRest"
            @refresh-long-rest="refreshForLongRest"
          />
        </div>

        <!-- Right: Combat Stats + Saves/Skills -->
        <div class="space-y-6">
          <!-- Combat Stats Grid (uses store via managers) -->
          <CharacterSheetCombatStatsGrid
            :character="character"
            :stats="stats"
            :editable="canEdit"
          />

          <!-- Defensive Traits -->
          <CharacterSheetDefensesPanel
            :damage-resistances="stats.damage_resistances ?? []"
            :damage-immunities="stats.damage_immunities ?? []"
            :damage-vulnerabilities="stats.damage_vulnerabilities ?? []"
            :condition-advantages="stats.condition_advantages ?? []"
            :condition-immunities="stats.condition_immunities ?? []"
          />

          <!-- Saving Throws and Skills -->
          <div class="grid lg:grid-cols-3 gap-6">
            <!-- Saving Throws + Death Saves stacked -->
            <div class="space-y-4">
              <CharacterSheetSavingThrowsList :saving-throws="savingThrows" />
              <CharacterSheetDeathSavesManager :editable="canEdit" />
            </div>
            <CharacterSheetSkillsList
              :skills="skills"
              :skill-advantages="skillAdvantages"
              class="lg:col-span-2"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Tabs -->
      <UTabs
        :items="tabItems"
        class="mt-8"
      >
        <template #features>
          <CharacterSheetFeaturesPanel :features="features" />
        </template>

        <template #proficiencies>
          <CharacterSheetProficienciesPanel :proficiencies="proficiencies" />
        </template>

        <template #spells>
          <CharacterSheetSpellsPanel
            v-if="stats.spellcasting"
            :spells="spells"
            :stats="stats"
          />
        </template>

        <template #languages>
          <CharacterSheetLanguagesPanel :languages="languages" />
        </template>
      </UTabs>
    </div>
  </div>
</template>

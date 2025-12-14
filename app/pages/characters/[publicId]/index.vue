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
  // conditions now come from store
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
 * Initialize play state store when character, stats, and spells load
 * Store manages HP, death saves, currency, spellcasting, and conditions state for play mode
 */
watch([character, stats, spells], async ([char, s, sp]) => {
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

    // Initialize spellcasting state if character is a spellcaster
    if (s.spellcasting && sp) {
      // Convert spell_slots array/object to level-based array
      const slotData: Array<{ level: number, total: number }> = []
      if (Array.isArray(s.spell_slots)) {
        s.spell_slots.forEach((total: number, index: number) => {
          if (total > 0) {
            slotData.push({ level: index + 1, total })
          }
        })
      } else if (s.spell_slots && typeof s.spell_slots === 'object') {
        Object.entries(s.spell_slots as Record<string, number>).forEach(([level, total]) => {
          if (total > 0) {
            slotData.push({ level: parseInt(level), total })
          }
        })
      }

      playStateStore.initializeSpellSlots(slotData)
      playStateStore.initializeSpellPreparation({
        spells: sp,
        preparationLimit: s.preparation_limit ?? null
      })
    }

    // Fetch conditions into store
    await playStateStore.fetchConditions()
  }
}, { immediate: true })

// Note: We intentionally don't reset the store on unmount
// The store persists play mode between character sub-pages (overview/inventory/notes)
// Each page's initialize() will update the store with fresh data when mounting

// ============================================================================
// Play Mode (from store)
// ============================================================================

/**
 * canEdit is now computed in the store (isPlayMode && !isDead)
 * conditions are also managed by the store for reactivity across pages
 */
const { canEdit, conditions } = storeToRefs(playStateStore)

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

// Tab items for bottom section - Proficiencies and Languages only
// Spells moved to dedicated /spells page
const tabItems = [
  { label: 'Proficiencies', slot: 'proficiencies', icon: 'i-heroicons-academic-cap' },
  { label: 'Languages', slot: 'languages', icon: 'i-heroicons-language' }
]

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

      <!-- Active Conditions (from store) - only shows when character has conditions -->
      <CharacterSheetConditionsManager
        v-if="conditions?.length > 0"
        :editable="canEdit"
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
        <template #proficiencies>
          <CharacterSheetProficienciesPanel :proficiencies="proficiencies" />
        </template>

        <template #languages>
          <CharacterSheetLanguagesPanel :languages="languages" />
        </template>
      </UTabs>
    </div>
  </div>
</template>

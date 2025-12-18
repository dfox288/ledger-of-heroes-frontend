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
import type { SpellSlotsResponse } from '~/types/character'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)

const {
  character,
  stats,
  proficiencies,
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
      // Parse spell_slots from API - supports new format with spent tracking
      // New format: { slots: { "1": { total, spent, available } }, pact_magic: ... }
      // Old format: { "1": 4, "2": 3 } or [4, 3, ...] (backwards compatibility)
      const slotData: Array<{ level: number, total: number, spent?: number }> = []
      let pactMagicData: { level: number, total: number, spent: number } | null = null

      // Check for new format (has 'slots' property)
      // Type guard: new format has 'slots' key, old format is just Record<string, number>
      const rawSlots = s.spell_slots as SpellSlotsResponse | Record<string, number> | number[]
      if (rawSlots && typeof rawSlots === 'object' && 'slots' in rawSlots) {
        // New format: { slots: { "1": { total, spent, available } }, pact_magic: ... }
        const newFormat = rawSlots as SpellSlotsResponse
        Object.entries(newFormat.slots).forEach(([level, data]) => {
          if (data.total > 0) {
            slotData.push({
              level: parseInt(level),
              total: data.total,
              spent: data.spent
            })
          }
        })

        // Extract pact magic if present
        if (newFormat.pact_magic && newFormat.pact_magic.total > 0) {
          pactMagicData = {
            level: newFormat.pact_magic.level,
            total: newFormat.pact_magic.total,
            spent: newFormat.pact_magic.spent
          }
        }
      } else if (Array.isArray(s.spell_slots)) {
        // Legacy array format: [4, 3, ...] where index 0 = 1st level
        s.spell_slots.forEach((total: number, index: number) => {
          if (total > 0) {
            slotData.push({ level: index + 1, total })
          }
        })
      } else if (s.spell_slots && typeof s.spell_slots === 'object') {
        // Legacy object format: { "1": 4, "2": 3 }
        Object.entries(s.spell_slots as Record<string, number>).forEach(([level, total]) => {
          if (typeof total === 'number' && total > 0) {
            slotData.push({ level: parseInt(level), total })
          }
        })
      }

      playStateStore.initializeSpellSlots(slotData, pactMagicData)
      playStateStore.initializeSpellPreparation({
        spells: sp,
        preparationLimit: s.preparation_limit ?? null
      })
    }

    // Initialize counters for class resources (Rage, Ki, etc.)
    playStateStore.initializeCounters(char.counters ?? [])

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

// Is this character a spellcaster? (for TabNavigation)
// Check if spellcasting has any class entries (object keyed by class slug)
const isSpellcaster = computed(() => {
  const spellcasting = stats.value?.spellcasting
  return spellcasting !== null && typeof spellcasting === 'object' && Object.keys(spellcasting).length > 0
})
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

      <!-- Active Conditions (from store, client-only to avoid hydration mismatch) -->
      <ClientOnly>
        <CharacterSheetConditionsManager
          v-if="conditions?.length > 0"
          :editable="canEdit"
        />
      </ClientOnly>

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
          <CharacterSheetSenses :senses="character.senses" />
          <CharacterSheetHitDiceManager
            v-if="hitDice.length && character"
            :hit-dice="hitDice"
            :character-id="character.id"
            :editable="canEdit"
            :initial-is-dead="character.is_dead"
            @refresh-hit-dice="refreshHitDice"
            @refresh-short-rest="refreshForShortRest"
            @refresh-long-rest="refreshForLongRest"
          />
          <CharacterSheetClassResourcesManager
            v-if="character.counters?.length"
            :editable="canEdit"
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
            :condition-disadvantages="stats.condition_disadvantages ?? []"
            :condition-immunities="stats.condition_immunities ?? []"
          />

          <!-- Saving Throws, Death Saves, Languages | Skills, Proficiencies -->
          <div class="grid lg:grid-cols-3 gap-6">
            <!-- Saving Throws + Death Saves + Languages stacked -->
            <div class="space-y-4">
              <CharacterSheetSavingThrowsList :saving-throws="savingThrows" />
              <CharacterSheetDeathSavesManager
                :editable="canEdit"
                :initial-death-saves="{ successes: character.death_save_successes ?? 0, failures: character.death_save_failures ?? 0 }"
                :initial-is-dead="character.is_dead"
                :initial-hp-current="stats.hit_points?.current"
              />
              <CharacterSheetLanguagesPanel :languages="languages" />
            </div>
            <!-- Skills + Proficiencies stacked -->
            <div class="lg:col-span-2 space-y-4">
              <CharacterSheetSkillsList
                :skills="skills"
                :skill-advantages="skillAdvantages"
              />
              <CharacterSheetProficienciesPanel :proficiencies="proficiencies" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

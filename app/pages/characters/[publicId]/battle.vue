<!-- app/pages/characters/[publicId]/battle.vue -->
<script setup lang="ts">
/**
 * Battle Page
 *
 * Combat-focused view showing weapons, combat stats, defenses, and saving throws.
 * Designed for quick reference during battle encounters.
 *
 * Uses useCharacterSubPage for shared data fetching and play state initialization.
 *
 * @see Issue #554 - Battle Tab implementation
 * @see Issue #621 - Consolidated data fetching
 */

import type { AbilityScoreCode } from '~/types/character'
import { storeToRefs } from 'pinia'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)

// Shared character data + play state initialization
const { character, stats, isSpellcaster, loading, refreshCharacter, playStateStore }
  = useCharacterSubPage(publicId)

// Get reactive state from store
const { canEdit, hitPoints, conditions } = storeToRefs(playStateStore)

// Fetch conditions into store when character loads (only once)
const conditionsLoaded = ref(false)
watch(character, async (char) => {
  if (char && !conditionsLoaded.value) {
    await playStateStore.fetchConditions()
    conditionsLoaded.value = true
  }
}, { immediate: true })

// Extract ability modifiers for WeaponsPanel
const abilityModifiers = computed<Record<AbilityScoreCode, number>>(() => {
  if (!stats.value?.ability_scores) {
    return { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }
  }
  const mods: Record<AbilityScoreCode, number> = {} as Record<AbilityScoreCode, number>
  for (const [key, value] of Object.entries(stats.value.ability_scores)) {
    mods[key as AbilityScoreCode] = value.modifier ?? 0
  }
  return mods
})

// Extract saving throws for SavingThrowsList
const savingThrows = computed(() => {
  if (!stats.value?.saving_throws) return []
  return Object.entries(stats.value.saving_throws).map(([ability, data]) => ({
    ability: ability as AbilityScoreCode,
    modifier: data?.total ?? 0,
    proficient: data?.proficient ?? false
  }))
})

// Extract skills from stats and map to CharacterSkill format
const skills = computed(() => {
  if (!stats.value?.skills) return []
  return stats.value.skills.map((skill, index) => ({
    id: index,
    name: skill.name,
    slug: skill.slug,
    ability_code: skill.ability as AbilityScoreCode,
    modifier: skill.modifier ?? 0,
    proficient: skill.proficient,
    expertise: skill.expertise
  }))
})

// Check if character is at 0 HP (from play state store)
const isAtZeroHp = computed(() => hitPoints.value.current === 0)

// Show death saves when at 0 HP or in play mode
const showDeathSaves = computed(() => canEdit.value || isAtZeroHp.value)

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Battle` : 'Battle'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-24 w-full" />
      <div class="grid md:grid-cols-2 gap-4">
        <USkeleton class="h-64" />
        <USkeleton class="h-64" />
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="character && stats">
      <div data-testid="battle-layout">
        <!-- Unified Page Header -->
        <CharacterPageHeader
          :character="character"
          :is-spellcaster="isSpellcaster"
          :back-to="`/characters/${publicId}`"
          back-label="Back to Character"
          @updated="refreshCharacter"
        />

        <!-- Active Conditions (from store, client-only to avoid hydration mismatch) -->
        <ClientOnly>
          <CharacterSheetConditionsManager
            v-if="conditions?.length > 0"
            :editable="canEdit"
            class="mt-6"
          />
        </ClientOnly>

        <!-- Combat Stats Row (no currency for battle view) -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <CharacterSheetHitPointsManager
            :editable="canEdit"
            :initial-hit-points="stats.hit_points"
            :initial-is-dead="character.is_dead"
          />
          <CharacterSheetStatArmorClass
            :armor-class="stats.armor_class"
            :character="character"
          />
          <CharacterSheetStatInitiative :bonus="stats.initiative_bonus" />
          <CharacterSheetStatSpeed
            :speed="character.speed"
            :speeds="character.speeds"
          />
          <CharacterSheetStatProficiencyBonus :bonus="character.proficiency_bonus" />
        </div>

        <!-- Two Column Layout: Offensive | Defensive -->
        <div class="mt-6 grid md:grid-cols-2 gap-6">
          <!-- Left Column: Weapons + Saves/Death Saves -->
          <div class="space-y-6">
            <!-- Weapons Panel -->
            <CharacterSheetWeaponsPanel
              :weapons="stats.weapons ?? []"
              :proficiency-bonus="character.proficiency_bonus"
              :ability-modifiers="abilityModifiers"
            />

            <!-- Saving Throws + Death Saves side by side -->
            <div class="grid grid-cols-2 gap-4">
              <CharacterSheetSavingThrowsList
                :saving-throws="savingThrows"
              />
              <CharacterSheetDeathSavesManager
                v-if="showDeathSaves"
                :editable="canEdit"
                :initial-death-saves="{ successes: character.death_save_successes ?? 0, failures: character.death_save_failures ?? 0 }"
                :initial-is-dead="character.is_dead"
                :initial-hp-current="stats.hit_points?.current"
              />
            </div>
          </div>

          <!-- Right Column: Defenses + Skills -->
          <div class="space-y-6">
            <!-- Defenses Panel -->
            <CharacterSheetDefensesPanel
              :damage-resistances="stats.damage_resistances ?? []"
              :damage-immunities="stats.damage_immunities ?? []"
              :damage-vulnerabilities="stats.damage_vulnerabilities ?? []"
              :condition-advantages="stats.condition_advantages ?? []"
              :condition-disadvantages="stats.condition_disadvantages ?? []"
              :condition-immunities="stats.condition_immunities ?? []"
            />

            <!-- Skills List -->
            <CharacterSheetSkillsList :skills="skills" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

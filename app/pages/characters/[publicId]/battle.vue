<!-- app/pages/characters/[publicId]/battle.vue -->
<script setup lang="ts">
/**
 * Battle Page
 *
 * Combat-focused view showing weapons, combat stats, defenses, and saving throws.
 * Designed for quick reference during battle encounters.
 *
 * Uses CharacterPageHeader for unified header with play mode, inspiration, etc.
 * Uses characterPlayState store for play mode state persistence.
 *
 * @see Issue #554 - Battle Tab implementation
 */

import type { Character, CharacterCondition, CharacterStats, AbilityScoreCode } from '~/types/character'
import { storeToRefs } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Play State Store
const playStateStore = useCharacterPlayStateStore()
const { canEdit, hitPoints } = storeToRefs(playStateStore)

// Fetch character data
// Use same cache keys as useCharacterSheet to share data across pages
const { data: characterData, pending: characterPending, refresh: refreshCharacter } = await useAsyncData(
  `character-${publicId.value}`,
  () => apiFetch<{ data: Character }>(`/characters/${publicId.value}`)
)

// Fetch stats data (includes weapons, saves, defenses)
const { data: statsData, pending: statsPending } = await useAsyncData(
  `character-${publicId.value}-stats`,
  () => apiFetch<{ data: CharacterStats }>(`/characters/${publicId.value}/stats`)
)

// Fetch conditions
// Shared cache key ensures condition changes sync between battle/overview pages
const { data: conditionsData, pending: conditionsPending, refresh: refreshConditions } = await useAsyncData(
  `character-${publicId.value}-conditions`,
  () => apiFetch<{ data: CharacterCondition[] }>(`/characters/${publicId.value}/conditions`)
)

// Track initial load vs refresh
const hasLoadedOnce = ref(false)
const loading = computed(() => {
  if (hasLoadedOnce.value) return false
  return characterPending.value || statsPending.value || conditionsPending.value
})

watch(
  () => !characterPending.value && !statsPending.value && !conditionsPending.value,
  (allLoaded) => {
    if (allLoaded && !hasLoadedOnce.value) {
      hasLoadedOnce.value = true
    }
  },
  { immediate: true }
)

const character = computed(() => characterData.value?.data ?? null)
const stats = computed(() => statsData.value?.data ?? null)
const conditions = computed(() => conditionsData.value?.data ?? [])
const isSpellcaster = computed(() => !!stats.value?.spellcasting)

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
// API returns 'ability' but CharacterSkill expects 'ability_code'
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

// Initialize play state store when character and stats load
watch([character, statsData], ([char, s]) => {
  if (char && s?.data) {
    playStateStore.initialize({
      characterId: char.id,
      isDead: char.is_dead ?? false,
      hitPoints: {
        current: s.data.hit_points?.current ?? null,
        max: s.data.hit_points?.max ?? null,
        temporary: s.data.hit_points?.temporary ?? null
      },
      deathSaves: {
        successes: char.death_save_successes ?? 0,
        failures: char.death_save_failures ?? 0
      },
      currency: char.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    })
  }
}, { immediate: true })

// Handle conditions refresh
// Clear cache first to ensure fresh data when using shared cache keys
async function handleConditionsRefresh() {
  clearNuxtData(`character-${publicId.value}-conditions`)
  await refreshConditions()
}

// Handle full refresh (character + conditions)
// Called when PageHeader emits 'updated' (e.g., after adding condition)
async function handleFullRefresh() {
  clearNuxtData(`character-${publicId.value}-conditions`)
  await Promise.all([
    refreshCharacter(),
    refreshConditions()
  ])
}

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
          @updated="handleFullRefresh"
        />

        <!-- Active Conditions -->
        <CharacterSheetConditionsManager
          v-if="conditions.length > 0"
          :conditions="conditions"
          :character-id="character.id"
          :editable="canEdit"
          class="mt-6"
          @refresh="handleConditionsRefresh"
        />

        <!-- Combat Stats Row (no currency for battle view) -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <CharacterSheetHitPointsManager :editable="canEdit" />
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

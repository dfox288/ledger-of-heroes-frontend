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

import type { AbilityScoreCode, CharacterWeapon, CharacterEquipment } from '~/types/character'
import { storeToRefs } from 'pinia'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Shared character data + play state initialization
const { character, stats, isSpellcaster, loading, refreshCharacter, playStateStore }
  = useCharacterSubPage(publicId)

// Fetch equipment data to derive weapons from hand slots
const { data: equipmentData } = await useAsyncData(
  `character-${publicId.value}-equipment`,
  () => apiFetch<{ data: CharacterEquipment[] }>(`/characters/${publicId.value}/equipment`),
  { dedupe: 'defer' }
)

// Extended equipment type with new weapon fields from backend
interface EquipmentWithWeaponData extends Omit<CharacterEquipment, 'proficiency_status' | 'item'> {
  attack_bonus?: number
  damage_bonus?: number
  ability_used?: string
  item?: {
    name?: string
    damage_dice?: string
    [key: string]: unknown
  } | null
  proficiency_status?: {
    has_proficiency?: boolean
    [key: string]: unknown
  }
}

// Derive weapons from equipment in main_hand/off_hand slots
const weapons = computed<CharacterWeapon[]>(() => {
  if (!equipmentData.value?.data) return []

  return (equipmentData.value.data as EquipmentWithWeaponData[])
    .filter(eq => eq.location === 'main_hand' || eq.location === 'off_hand')
    .filter(eq => eq.item?.damage_dice) // Only items with damage dice are weapons
    .map(eq => ({
      name: eq.custom_name || eq.item?.name || 'Unknown Weapon',
      damage_dice: eq.item?.damage_dice || '1d4',
      attack_bonus: eq.attack_bonus ?? 0,
      damage_bonus: eq.damage_bonus ?? 0,
      ability_used: (eq.ability_used || 'STR') as AbilityScoreCode,
      is_proficient: eq.proficiency_status?.has_proficiency ?? false
    }))
})

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
  return stats.value.skills.map((skill, index) => {
    // Type assertion for fields added in backend PR #186
    const extendedSkill = skill as typeof skill & {
      has_reliable_talent?: boolean
      minimum_roll?: number | null
      minimum_total?: number | null
    }
    return {
      id: index,
      name: skill.name,
      slug: skill.slug,
      ability_code: skill.ability as AbilityScoreCode,
      modifier: skill.modifier ?? 0,
      proficient: skill.proficient,
      expertise: skill.expertise,
      has_reliable_talent: extendedSkill.has_reliable_talent ?? false,
      minimum_roll: extendedSkill.minimum_roll ?? null,
      minimum_total: extendedSkill.minimum_total ?? null
    }
  })
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
            <!-- Weapons Panel (weapons derived from equipment in hand slots) -->
            <CharacterSheetWeaponsPanel
              :weapons="weapons"
              :proficiency-bonus="character.proficiency_bonus"
              :ability-modifiers="abilityModifiers"
              :unarmed-strike="stats.unarmed_strike"
              :improvised-weapon="stats.improvised_weapon"
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

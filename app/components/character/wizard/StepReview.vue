<!-- app/components/character/wizard/StepReview.vue -->
<script setup lang="ts">
/**
 * Final review step - shows complete character summary before finishing
 *
 * Composes sub-components for each section:
 * - ReviewCharacterIdentity - Name and race/class/background
 * - ReviewCharacterAbilities - Ability scores card
 * - ReviewCharacterStats - Combat stats, saving throws, spellcasting
 * - ReviewProficiencies - Proficiencies grouped by type
 * - ReviewLanguages - Known languages
 * - ReviewEquipment - Equipment list
 * - ReviewSpells - Spells grouped by level
 */

import { useCharacterWizardStore } from '~/stores/characterWizard'
import type {
  CharacterProficiency,
  CharacterLanguage,
  CharacterEquipment,
  CharacterSpell
} from '~/types/character'

const store = useCharacterWizardStore()
const { apiFetch } = useApi()
const router = useRouter()

/**
 * Finish wizard and navigate to character sheet
 */
async function finishWizard() {
  await router.push(`/characters/${store.publicId}`)
  store.reset()
}

// Fetch character stats
const {
  hitPoints,
  armorClass,
  initiative,
  proficiencyBonus,
  savingThrows,
  spellcasting,
  abilityScores,
  isSpellcaster
} = useCharacterStats(computed(() => store.characterId))

// Speed comes from race, not stats endpoint
const speed = computed(() => store.selections.race?.speed ?? 30)

// Character identity
const characterName = computed(() => store.selections.name || 'Unnamed Character')
const race = computed(() => store.selections.race?.name || 'Unknown')
const characterClass = computed(() => store.selections.class?.name || 'Unknown')
const background = computed(() => store.selections.background?.name || 'Unknown')

// ══════════════════════════════════════════════════════════════
// Fetch character data from backend
// ══════════════════════════════════════════════════════════════

const { data: proficiencies } = await useAsyncData(
  `review-proficiencies-${store.characterId}`,
  () => apiFetch<{ data: CharacterProficiency[] }>(`/characters/${store.characterId}/proficiencies`),
  { transform: response => response.data, watch: [() => store.characterId] }
)

const { data: languages } = await useAsyncData(
  `review-languages-${store.characterId}`,
  () => apiFetch<{ data: CharacterLanguage[] }>(`/characters/${store.characterId}/languages`),
  { transform: response => response.data, watch: [() => store.characterId] }
)

const { data: equipment } = await useAsyncData(
  `review-equipment-${store.characterId}`,
  () => apiFetch<{ data: CharacterEquipment[] }>(`/characters/${store.characterId}/equipment`),
  { transform: response => response.data, watch: [() => store.characterId] }
)

const { data: spells } = await useAsyncData(
  `review-spells-${store.characterId}`,
  () => {
    if (!isSpellcaster.value) return Promise.resolve({ data: [] })
    return apiFetch<{ data: CharacterSpell[] }>(`/characters/${store.characterId}/spells`)
  },
  { transform: response => response.data, watch: [() => store.characterId, isSpellcaster] }
)
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header: Character Name and Identity -->
    <CharacterWizardReviewReviewCharacterIdentity
      :character-name="characterName"
      :race="race"
      :character-class="characterClass"
      :background="background"
    />

    <!-- Two Column Layout: Abilities + Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Ability Scores -->
      <div class="lg:col-span-1">
        <CharacterWizardReviewReviewCharacterAbilities
          :ability-scores="abilityScores"
        />
      </div>

      <!-- Right Column: Combat Stats and Saving Throws -->
      <div class="lg:col-span-2">
        <CharacterWizardReviewReviewCharacterStats
          :hit-points="hitPoints"
          :armor-class="armorClass"
          :initiative="initiative"
          :speed="speed"
          :proficiency-bonus="proficiencyBonus"
          :saving-throws="savingThrows"
          :is-spellcaster="isSpellcaster"
          :spellcasting="spellcasting"
        />
      </div>
    </div>

    <!-- Proficiencies and Languages -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CharacterWizardReviewReviewProficiencies
        :proficiencies="proficiencies"
      />
      <CharacterWizardReviewReviewLanguages
        :languages="languages"
      />
    </div>

    <!-- Equipment -->
    <CharacterWizardReviewReviewEquipment
      :equipment="equipment"
    />

    <!-- Spells (conditional) -->
    <CharacterWizardReviewReviewSpells
      :spells="spells"
      :is-spellcaster="isSpellcaster"
    />

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
  </div>
</template>

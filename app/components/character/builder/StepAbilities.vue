<!-- app/components/character/builder/StepAbilities.vue -->
<script setup lang="ts">
import type { AbilityScores } from '~/types'
import { useWizardNavigation } from '~/composables/useWizardSteps'

const store = useCharacterBuilderStore()
const {
  selectedRace,
  abilityScores,
  abilityScoreMethod,
  isLoading,
  error,
  racialAbilityChoices,
  racialAbilityChoiceModifiers,
  fixedRacialBonuses,
  allRacialAbilityChoicesMade
} = storeToRefs(store)
const { toggleRacialAbilityChoice } = store
const { nextStep } = useWizardNavigation()

// All 6 ability scores for the choice UI
const allAbilities = [
  { code: 'STR', name: 'Strength' },
  { code: 'DEX', name: 'Dexterity' },
  { code: 'CON', name: 'Constitution' },
  { code: 'INT', name: 'Intelligence' },
  { code: 'WIS', name: 'Wisdom' },
  { code: 'CHA', name: 'Charisma' }
]

type Method = 'standard_array' | 'point_buy' | 'manual'

const selectedMethod = ref<Method>(abilityScoreMethod.value || 'manual')

// Local scores for editing (converted for standard array which uses nullable)
const localScores = ref<AbilityScores>({ ...abilityScores.value })

// For standard array, we need nullable scores
const nullableScores = ref<Record<keyof AbilityScores, number | null>>({
  strength: null,
  dexterity: null,
  constitution: null,
  intelligence: null,
  wisdom: null,
  charisma: null
})

// Track validity from child components
const isInputValid = ref(false)

// Calculate final scores with racial bonuses (both fixed and choice-based)
const finalScores = computed(() => {
  const base = selectedMethod.value === 'standard_array'
    ? nullableScores.value
    : localScores.value

  const result: Record<string, { base: number | null, bonus: number, total: number | null }> = {}

  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
  const codeMap: Record<string, string> = {
    STR: 'strength', DEX: 'dexterity', CON: 'constitution',
    INT: 'intelligence', WIS: 'wisdom', CHA: 'charisma'
  }

  for (const ability of abilities) {
    const baseScore = base[ability]

    // Fixed racial bonuses
    let bonus = fixedRacialBonuses.value
      .filter(m => codeMap[m.ability_score?.code ?? ''] === ability)
      .reduce((sum, m) => sum + Number(m.value), 0)

    // Choice-based racial bonuses
    for (const mod of racialAbilityChoiceModifiers.value) {
      const selected = racialAbilityChoices.value.get(mod.id)
      if (selected) {
        const abilityCode = Object.entries(codeMap).find(([, v]) => v === ability)?.[0]
        if (abilityCode && selected.has(abilityCode)) {
          bonus += Number(mod.value.replace('+', ''))
        }
      }
    }

    result[ability] = {
      base: baseScore,
      bonus,
      total: baseScore !== null ? baseScore + bonus : null
    }
  }

  return result
})

const canSave = computed(() => {
  if (isLoading.value) return false
  if (!isInputValid.value) return false
  // If there are ability score choices to make, require them all to be completed
  if (racialAbilityChoiceModifiers.value.length > 0 && !allRacialAbilityChoicesMade.value) return false
  return true
})

async function saveAndContinue() {
  if (!canSave.value) return

  const scores: AbilityScores = selectedMethod.value === 'standard_array'
    ? {
        strength: nullableScores.value.strength ?? 10,
        dexterity: nullableScores.value.dexterity ?? 10,
        constitution: nullableScores.value.constitution ?? 10,
        intelligence: nullableScores.value.intelligence ?? 10,
        wisdom: nullableScores.value.wisdom ?? 10,
        charisma: nullableScores.value.charisma ?? 10
      }
    : localScores.value

  await store.saveAbilityScores(selectedMethod.value, scores)
  nextStep()
}

// Method options for selector
const methodOptions = [
  { label: 'Standard Array', value: 'standard_array' },
  { label: 'Point Buy', value: 'point_buy' },
  { label: 'Manual', value: 'manual' }
]

// Reset scores when method changes
watch(selectedMethod, (newMethod) => {
  if (newMethod === 'standard_array') {
    // Reset to unassigned
    nullableScores.value = {
      strength: null, dexterity: null, constitution: null,
      intelligence: null, wisdom: null, charisma: null
    }
  } else if (newMethod === 'point_buy') {
    // Reset to base 8s
    localScores.value = {
      strength: 8, dexterity: 8, constitution: 8,
      intelligence: 8, wisdom: 8, charisma: 8
    }
  } else {
    // Reset to 10s for manual
    localScores.value = {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold mb-2">
        Assign Ability Scores
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Choose a method and assign your character's six ability scores.
      </p>
    </div>

    <!-- Method Selector -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Method
      </label>
      <UButtonGroup>
        <UButton
          v-for="option in methodOptions"
          :key="option.value"
          :variant="selectedMethod === option.value ? 'solid' : 'outline'"
          @click="selectedMethod = option.value as Method"
        >
          {{ option.label }}
        </UButton>
      </UButtonGroup>
    </div>

    <!-- Method-specific Input -->
    <div class="mt-6">
      <CharacterBuilderStandardArrayInput
        v-if="selectedMethod === 'standard_array'"
        v-model="nullableScores"
        @update:valid="isInputValid = $event"
      />
      <CharacterBuilderPointBuyInput
        v-else-if="selectedMethod === 'point_buy'"
        v-model="localScores"
        @update:valid="isInputValid = $event"
      />
      <CharacterBuilderManualInput
        v-else
        v-model="localScores"
        @update:valid="isInputValid = $event"
      />
    </div>

    <!-- Racial Ability Score Choices (e.g., Human Variant) -->
    <div
      v-if="racialAbilityChoiceModifiers.length > 0"
      class="p-4 bg-race-50 dark:bg-race-900/20 rounded-lg"
    >
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Racial Ability Choices ({{ selectedRace?.name }})
      </h3>
      <div
        v-for="mod in racialAbilityChoiceModifiers"
        :key="mod.id"
        class="mt-3"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Choose {{ mod.choice_count }} {{ mod.choice_constraint === 'different' ? 'different ' : '' }}abilities for {{ mod.value }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="ability in allAbilities"
            :key="ability.code"
            :data-testid="`ability-choice-${ability.code}`"
            :variant="racialAbilityChoices.get(mod.id)?.has(ability.code) ? 'solid' : 'outline'"
            :disabled="!racialAbilityChoices.get(mod.id)?.has(ability.code)
              && (racialAbilityChoices.get(mod.id)?.size ?? 0) >= (mod.choice_count ?? 0)"
            color="race"
            size="sm"
            @click="toggleRacialAbilityChoice(mod.id, ability.code, mod.choice_count ?? 0)"
          >
            {{ ability.name }} {{ mod.value }}
          </UButton>
        </div>
        <p
          v-if="(racialAbilityChoices.get(mod.id)?.size ?? 0) < (mod.choice_count ?? 0)"
          class="text-xs text-amber-600 dark:text-amber-400 mt-2"
        >
          {{ (mod.choice_count ?? 0) - (racialAbilityChoices.get(mod.id)?.size ?? 0) }} more selection(s) required
        </p>
      </div>
    </div>

    <!-- Fixed Racial Bonuses -->
    <div
      v-if="fixedRacialBonuses.length > 0"
      class="p-4 bg-race-50 dark:bg-race-900/20 rounded-lg"
    >
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Racial Bonuses ({{ selectedRace?.name }})
      </h3>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="bonus in fixedRacialBonuses"
          :key="bonus.id"
          color="race"
          variant="subtle"
          size="md"
        >
          {{ bonus.ability_score?.name }} +{{ bonus.value }}
        </UBadge>
      </div>
    </div>

    <!-- Final Scores Summary -->
    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Final Ability Scores
      </h3>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
        <div
          v-for="(data, ability) in finalScores"
          :key="ability"
          class="p-2"
        >
          <div class="text-xs font-medium text-gray-500 uppercase">
            {{ ability.slice(0, 3) }}
          </div>
          <div class="text-lg font-bold">
            <template v-if="data.total !== null">
              {{ data.total }}
              <span
                v-if="data.bonus > 0"
                class="text-xs text-race-600 dark:text-race-400"
              >
                ({{ data.base }}+{{ data.bonus }})
              </span>
            </template>
            <span
              v-else
              class="text-gray-400"
            >—</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      :title="error"
    />

    <!-- Save Button -->
    <div class="flex justify-end">
      <UButton
        data-testid="save-abilities"
        :disabled="!canSave"
        :loading="isLoading"
        @click="saveAndContinue"
      >
        Save & Continue
      </UButton>
    </div>
  </div>
</template>

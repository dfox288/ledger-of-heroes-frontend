<!-- app/components/character/wizard/StepAbilities.vue -->
<script setup lang="ts">
import type { AbilityScores } from '~/types'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardNavigation } from '~/composables/useWizardSteps'
import type { AbilityMethod } from '~/stores/characterWizard'

const store = useCharacterWizardStore()
const {
  selections,
  isLoading,
  error,
  effectiveRace,
  racialBonuses
} = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// All 6 ability scores for the choice UI
const allAbilities = [
  { code: 'STR', name: 'Strength', key: 'strength' },
  { code: 'DEX', name: 'Dexterity', key: 'dexterity' },
  { code: 'CON', name: 'Constitution', key: 'constitution' },
  { code: 'INT', name: 'Intelligence', key: 'intelligence' },
  { code: 'WIS', name: 'Wisdom', key: 'wisdom' },
  { code: 'CHA', name: 'Charisma', key: 'charisma' }
] as const

const selectedMethod = ref<AbilityMethod>(selections.value.abilityMethod || 'standard_array')

// Local scores for editing (converted for standard array which uses nullable)
const localScores = ref<AbilityScores>({ ...selections.value.abilityScores })

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

// Calculate final scores with racial bonuses
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
    let bonus = racialBonuses.value
      .filter(m => codeMap[m.ability_score?.code ?? ''] === ability)
      .reduce((sum, m) => sum + Number(m.value), 0)

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
] as const

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
          @click="selectedMethod = option.value"
        >
          {{ option.label }}
        </UButton>
      </UButtonGroup>
    </div>

    <!-- Method-specific Input -->
    <div class="mt-6">
      <CharacterAbilityStandardArrayInput
        v-if="selectedMethod === 'standard_array'"
        v-model="nullableScores"
        @update:valid="isInputValid = $event"
      />
      <CharacterAbilityPointBuyInput
        v-else-if="selectedMethod === 'point_buy'"
        v-model="localScores"
        @update:valid="isInputValid = $event"
      />
      <CharacterAbilityManualInput
        v-else
        v-model="localScores"
        @update:valid="isInputValid = $event"
      />
    </div>

    <!-- Fixed Racial Bonuses -->
    <div
      v-if="racialBonuses.length > 0"
      class="p-4 bg-race-50 dark:bg-race-900/20 rounded-lg"
    >
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Racial Bonuses ({{ effectiveRace?.name }})
      </h3>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="bonus in racialBonuses"
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

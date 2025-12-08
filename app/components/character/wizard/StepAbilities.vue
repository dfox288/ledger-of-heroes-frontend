<!-- app/components/character/wizard/StepAbilities.vue -->
<script setup lang="ts">
import type { AbilityScores } from '~/types'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import type { AbilityMethod } from '~/stores/characterWizard'

type PendingChoice = components['schemas']['PendingChoiceResource']

// Metadata type for ability_score choices (API returns object, not array)
interface AbilityScoreChoiceMetadata {
  modifier_id?: number
  bonus_value?: number
  choice_constraint?: string
}

/** Default bonus value when metadata doesn't specify one */
const DEFAULT_ABILITY_BONUS = 1

/**
 * Safely parse ability score choice metadata with type validation.
 * Returns null if metadata is missing or malformed.
 *
 * @param choice - The pending choice to extract metadata from
 * @returns Validated metadata or null
 */
function getChoiceMetadata(choice: PendingChoice): AbilityScoreChoiceMetadata | null {
  if (!choice.metadata || typeof choice.metadata !== 'object' || Array.isArray(choice.metadata)) {
    return null
  }
  const meta = choice.metadata as Record<string, unknown>
  return {
    modifier_id: typeof meta.modifier_id === 'number' ? meta.modifier_id : undefined,
    bonus_value: typeof meta.bonus_value === 'number' ? meta.bonus_value : undefined,
    choice_constraint: typeof meta.choice_constraint === 'string' ? meta.choice_constraint : undefined
  }
}

const store = useCharacterWizardStore()
const {
  selections,
  isLoading,
  error,
  effectiveRace
} = storeToRefs(store)

// ══════════════════════════════════════════════════════════════
// Ability Score Choices (Issue #219)
// ══════════════════════════════════════════════════════════════

// Use unified choices composable for ability score choices
const {
  choicesByType,
  pending: choicesPending,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => store.characterId))

// Local selections: Map<choiceId, Set<abilityCode>>
const abilityScoreSelections = ref<Map<string, Set<string>>>(new Map())

// Fetch ability_score choices when characterId becomes available
// Using watch instead of onMounted to handle cases where characterId
// is set after the component mounts (e.g., after character creation)
watch(
  () => store.characterId,
  async (id) => {
    if (id) {
      await fetchChoices('ability_score')
    }
  },
  { immediate: true }
)

// Initialize from already-resolved selections when choices load
watch(() => choicesByType.value.abilityScores, (choices) => {
  for (const choice of choices) {
    if (!abilityScoreSelections.value.has(choice.id) && choice.selected.length > 0) {
      abilityScoreSelections.value.set(choice.id, new Set(choice.selected.map(String)))
    }
  }
}, { immediate: true })

// Get all racial ability score modifiers
const allRacialModifiers = computed(() => {
  const race = effectiveRace.value
  if (!race?.modifiers) return []
  return race.modifiers.filter(m => m.modifier_category === 'ability_score')
})

// Fixed bonuses have ability_score set (e.g., +2 CHA)
const fixedBonuses = computed(() =>
  allRacialModifiers.value.filter(m => !m.is_choice && m.ability_score)
)

// Choice bonuses require user selection (e.g., Half-Elf's "choose 2 different")
const choiceBonuses = computed(() =>
  allRacialModifiers.value.filter(m => m.is_choice)
)
const { nextStep } = useCharacterWizard()

// ══════════════════════════════════════════════════════════════
// Ability Score Choice Helpers
// ══════════════════════════════════════════════════════════════

// Check if an ability has a fixed racial bonus (e.g., CHA for Half-Elf)
function hasFixedBonus(code: string): boolean {
  return fixedBonuses.value.some(b => b.ability_score?.code === code)
}

// Check if an ability is selected in a specific choice
function isAbilitySelected(choiceId: string, code: string): boolean {
  return abilityScoreSelections.value.get(choiceId)?.has(code) ?? false
}

// Get current selection count for a choice
function getSelectionCount(choiceId: string): number {
  return abilityScoreSelections.value.get(choiceId)?.size ?? 0
}

// Handle ability toggle with validation
function handleAbilityToggle(choice: PendingChoice, code: string) {
  const isSelected = isAbilitySelected(choice.id, code)
  const count = getSelectionCount(choice.id)

  // Can't exceed quantity (unless deselecting)
  if (!isSelected && count >= choice.quantity) return

  // Toggle in the Set
  const selections = abilityScoreSelections.value.get(choice.id) ?? new Set<string>()
  const updated = new Set(selections)

  if (updated.has(code)) {
    updated.delete(code)
  } else {
    updated.add(code)
  }

  abilityScoreSelections.value.set(choice.id, updated)
}

/**
 * Get the bonus value from a choice's metadata.
 * Returns DEFAULT_ABILITY_BONUS if not specified or invalid.
 *
 * @param choice - The pending choice to get bonus value from
 * @returns The bonus value (always positive for display)
 */
function getChoiceBonusValue(choice: PendingChoice): number {
  const metadata = getChoiceMetadata(choice)
  const bonus = metadata?.bonus_value ?? DEFAULT_ABILITY_BONUS
  // Ensure positive display value (edge case: API sends 0 or negative)
  return Math.max(bonus, DEFAULT_ABILITY_BONUS)
}

// Check if all ability score choices are complete
const allAbilityChoicesComplete = computed(() => {
  const choices = choicesByType.value.abilityScores
  // If no choices, they're "complete"
  if (choices.length === 0) return true

  for (const choice of choices) {
    const count = abilityScoreSelections.value.get(choice.id)?.size ?? 0
    if (count < choice.quantity) return false
  }
  return true
})

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

// Sync local state from store when it changes (e.g., after page reload)
watch(
  () => selections.value.abilityMethod,
  (newMethod) => {
    if (newMethod && newMethod !== selectedMethod.value) {
      selectedMethod.value = newMethod
    }
  },
  { immediate: true }
)

watch(
  () => selections.value.abilityScores,
  (newScores) => {
    if (!newScores) return

    // Check if scores are non-default (user has assigned them)
    const hasAssignedScores = Object.values(newScores).some(v => v !== 10)

    if (hasAssignedScores) {
      // Update localScores for point_buy/manual
      localScores.value = { ...newScores }

      // Update nullableScores for standard_array
      nullableScores.value = {
        strength: newScores.strength,
        dexterity: newScores.dexterity,
        constitution: newScores.constitution,
        intelligence: newScores.intelligence,
        wisdom: newScores.wisdom,
        charisma: newScores.charisma
      }
    }
  },
  { immediate: true }
)

// Track validity from child components
const isInputValid = ref(false)

// Calculate final scores with racial bonuses (fixed + chosen)
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
  const reverseCodeMap: Record<string, string> = {
    strength: 'STR', dexterity: 'DEX', constitution: 'CON',
    intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA'
  }

  for (const ability of abilities) {
    const baseScore = base[ability]

    // Fixed racial bonuses (e.g., +2 CHA for Half-Elf)
    const fixedBonus = fixedBonuses.value
      .filter(m => codeMap[m.ability_score?.code ?? ''] === ability)
      .reduce((sum, m) => sum + Number(m.value), 0)

    // Chosen racial bonuses (e.g., +1 to STR, DEX for Half-Elf)
    let chosenBonus = 0
    const abilityCode = reverseCodeMap[ability]
    if (abilityCode) {
      for (const choice of choicesByType.value.abilityScores) {
        const selections = abilityScoreSelections.value.get(choice.id)
        if (selections?.has(abilityCode)) {
          const metadata = getChoiceMetadata(choice)
          chosenBonus += Number(metadata?.bonus_value ?? DEFAULT_ABILITY_BONUS)
        }
      }
    }

    const totalBonus = fixedBonus + chosenBonus

    result[ability] = {
      base: baseScore,
      bonus: totalBonus,
      total: baseScore !== null ? baseScore + totalBonus : null
    }
  }

  return result
})

const canSave = computed(() => {
  if (isLoading.value) return false
  if (!isInputValid.value) return false
  if (!allAbilityChoicesComplete.value) return false
  return true
})

async function saveAndContinue() {
  if (!canSave.value) return

  // Send BASE scores to backend - the backend applies racial bonuses itself
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

  // Resolve ability score choices with error context
  for (const [choiceId, selectedCodes] of abilityScoreSelections.value.entries()) {
    if (selectedCodes.size > 0) {
      try {
        await resolveChoice(choiceId, {
          selected: Array.from(selectedCodes)
        })
      } catch (err) {
        // Re-throw with context so user knows which choice failed
        const selectedAbilities = Array.from(selectedCodes).join(', ')
        const message = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Failed to save ability score choice (${selectedAbilities}): ${message}`)
      }
    }
  }

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
      <UFieldGroup>
        <UButton
          v-for="option in methodOptions"
          :key="option.value"
          :variant="selectedMethod === option.value ? 'solid' : 'outline'"
          @click="selectedMethod = option.value"
        >
          {{ option.label }}
        </UButton>
      </UFieldGroup>
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

    <!-- Racial Bonuses -->
    <div
      v-if="allRacialModifiers.length > 0"
      class="p-4 bg-race-50 dark:bg-race-900/20 rounded-lg space-y-3"
    >
      <h3 class="font-semibold text-gray-900 dark:text-gray-100">
        Racial Bonuses ({{ effectiveRace?.name }})
      </h3>

      <!-- Fixed Bonuses -->
      <div
        v-if="fixedBonuses.length > 0"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="bonus in fixedBonuses"
          :key="bonus.id"
          color="race"
          variant="subtle"
          size="md"
        >
          {{ bonus.ability_score?.name }} +{{ bonus.value }}
        </UBadge>
      </div>

      <!-- Ability Score Choices (Issue #219) -->
      <div
        v-for="choice in choicesByType.abilityScores"
        :key="choice.id"
        class="mt-4"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium">
            Choose {{ choice.quantity }} different
            {{ choice.quantity > 1 ? 'abilities' : 'ability' }} for
            +{{ getChoiceBonusValue(choice) }}:
          </span>
          <UBadge
            :color="getSelectionCount(choice.id) === choice.quantity ? 'success' : 'neutral'"
            size="md"
          >
            {{ getSelectionCount(choice.id) }}/{{ choice.quantity }} selected
          </UBadge>
        </div>

        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          <button
            v-for="ability in allAbilities"
            :key="ability.code"
            type="button"
            :data-testid="`ability-choice-${ability.code}`"
            :aria-label="`${ability.name} (${ability.code})${hasFixedBonus(ability.code) ? ' - fixed bonus, cannot select' : ''}`"
            :aria-pressed="isAbilitySelected(choice.id, ability.code)"
            :aria-disabled="hasFixedBonus(ability.code)"
            class="ability-option p-3 rounded-lg border text-center transition-all"
            :class="{
              'border-race bg-race/10 dark:bg-race/20': isAbilitySelected(choice.id, ability.code),
              'border-gray-200 dark:border-gray-700 hover:border-race/50':
                !isAbilitySelected(choice.id, ability.code) && !hasFixedBonus(ability.code),
              'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700': hasFixedBonus(ability.code)
            }"
            :disabled="hasFixedBonus(ability.code)"
            @click="handleAbilityToggle(choice, ability.code)"
          >
            <div class="font-bold">
              {{ ability.code }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ ability.name }}
            </div>
            <div
              v-if="hasFixedBonus(ability.code)"
              class="text-xs text-gray-400 mt-1"
            >
              (fixed bonus)
            </div>
          </button>
        </div>
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

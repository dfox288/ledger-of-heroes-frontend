<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Spell } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const store = useCharacterBuilderStore()
const {
  characterId,
  selectedRace,
  selectedClass,
  selectedSpells,
  selectedCantrips,
  selectedLeveledSpells,
  raceSpellChoices,
  characterStats,
  isLoading,
  error
} = storeToRefs(store)

// API client
const { apiFetch } = useApi()

// Fetch available spells for this character
const { data: availableSpells, pending: loadingSpells } = await useAsyncData(
  `builder-available-spells-${characterId.value}`,
  () => apiFetch<{ data: Spell[] }>(`/characters/${characterId.value}/available-spells?max_level=1`),
  { transform: (response: { data: Spell[] }) => response.data }
)

// Split available spells into cantrips and leveled spells
const availableCantrips = computed(() =>
  availableSpells.value?.filter(s => s.level === 0) ?? []
)

const availableLeveledSpells = computed(() =>
  availableSpells.value?.filter(s => s.level > 0) ?? []
)

// Race spell data
const raceSpells = computed(() => selectedRace.value?.spells ?? [])
const fixedRaceSpells = computed(() => raceSpells.value.filter(s => !s.is_choice))
const raceSpellChoiceGroups = computed(() => {
  const groups = new Map<string, typeof raceSpells.value>()
  for (const spell of raceSpells.value) {
    if (spell.is_choice && spell.choice_group) {
      const existing = groups.get(spell.choice_group) ?? []
      groups.set(spell.choice_group, [...existing, spell])
    }
  }
  return groups
})

// Spell limits from class level progression
// These values come from the class's level_progression data at level 1
const cantripsLimit = computed(() => {
  const progression = selectedClass.value?.level_progression
  if (!progression || progression.length === 0) return 0
  const level1 = progression.find(p => p.level === 1)
  return level1?.cantrips_known ?? 0
})
const spellsLimit = computed(() => {
  const progression = selectedClass.value?.level_progression
  if (!progression || progression.length === 0) return 0
  const level1 = progression.find(p => p.level === 1)
  return level1?.spells_known ?? 0
})

// Current selection counts
const cantripsSelected = computed(() => selectedCantrips.value.length)
const spellsSelected = computed(() => selectedLeveledSpells.value.length)

// Check if a spell is already selected
function isSpellSelected(spellId: number): boolean {
  return selectedSpells.value.some(s => s.spell?.id === spellId)
}

// Check if selection is at limit for cantrips
const cantripsAtLimit = computed(() =>
  cantripsSelected.value >= cantripsLimit.value
)

// Check if selection is at limit for leveled spells
const spellsAtLimit = computed(() =>
  spellsSelected.value >= spellsLimit.value
)

// Validation: all requirements met?
const allRaceSpellChoicesMade = computed(() => {
  for (const [group] of raceSpellChoiceGroups.value) {
    if (!raceSpellChoices.value.has(group)) return false
  }
  return true
})

const canProceed = computed(() => {
  // Must have selected correct number of cantrips (if class has any)
  if (cantripsLimit.value > 0 && cantripsSelected.value < cantripsLimit.value) return false
  // Must have selected correct number of spells (if class has any)
  if (spellsLimit.value > 0 && spellsSelected.value < spellsLimit.value) return false
  // Must have made all race spell choices (if any)
  if (!allRaceSpellChoicesMade.value) return false
  return true
})

/**
 * Toggle spell selection
 */
async function handleSpellToggle(spell: Spell) {
  if (isSpellSelected(spell.id)) {
    await store.unlearnSpell(spell.id)
  } else {
    // Don't allow selecting more than limit
    if (spell.level === 0 && cantripsAtLimit.value) return
    if (spell.level > 0 && spellsAtLimit.value) return
    await store.learnSpell(spell.id)
  }
}

/**
 * Handle race spell choice
 */
function handleRaceSpellChoice(choiceGroup: string, spellId: number) {
  store.setRaceSpellChoice(choiceGroup, spellId)
}

/**
 * Continue to next step
 */
function handleContinue() {
  store.nextStep()
}

/**
 * Format level text
 */
function formatLevelText(level: number): string {
  if (level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${level}${suffix[level]} Level`
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Select Your Spells
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Choose your starting spells from your class spell list
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
    />

    <!-- Loading State -->
    <div
      v-if="loadingSpells"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-spell-500"
      />
    </div>

    <template v-else>
      <!-- Racial Spells Section -->
      <div
        v-if="raceSpells.length > 0"
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
          Racial Spells ({{ selectedRace?.name }})
        </h3>

        <!-- Fixed Race Spells -->
        <div
          v-if="fixedRaceSpells.length > 0"
          class="space-y-2"
        >
          <p class="text-sm text-gray-500 dark:text-gray-400">
            You automatically know these spells from your race:
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="raceSpell in fixedRaceSpells"
              :key="raceSpell.id"
              color="spell"
              variant="subtle"
              size="md"
            >
              {{ raceSpell.spell?.name }} ({{ formatLevelText(raceSpell.spell?.level ?? 0) }})
            </UBadge>
          </div>
        </div>

        <!-- Race Spell Choices -->
        <div
          v-for="[group, spells] in raceSpellChoiceGroups"
          :key="group"
          class="space-y-2"
        >
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose one cantrip:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <button
              v-for="raceSpell in spells"
              :key="raceSpell.id"
              type="button"
              class="p-3 rounded-lg border-2 transition-all text-left"
              :class="[
                raceSpellChoices.get(group) === raceSpell.spell_id
                  ? 'ring-2 ring-spell-500 border-spell-500 bg-spell-50 dark:bg-spell-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-spell-300'
              ]"
              @click="handleRaceSpellChoice(group, raceSpell.spell_id!)"
            >
              <span class="font-medium">{{ raceSpell.spell?.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Cantrips Section -->
      <div
        v-if="availableCantrips.length > 0"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Cantrips ({{ selectedClass?.name }})
          </h3>
          <UBadge
            :color="cantripsSelected >= cantripsLimit ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ cantripsSelected }} of {{ cantripsLimit }}
          </UBadge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CharacterBuilderSpellPickerCard
            v-for="spell in availableCantrips"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(spell.id)"
            :disabled="!isSpellSelected(spell.id) && cantripsAtLimit"
            @toggle="handleSpellToggle"
          />
        </div>
      </div>

      <!-- 1st Level Spells Section -->
      <div
        v-if="availableLeveledSpells.length > 0"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            1st Level Spells ({{ selectedClass?.name }})
          </h3>
          <UBadge
            :color="spellsSelected >= spellsLimit ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ spellsSelected }} of {{ spellsLimit }}
          </UBadge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CharacterBuilderSpellPickerCard
            v-for="spell in availableLeveledSpells"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(spell.id)"
            :disabled="!isSpellSelected(spell.id) && spellsAtLimit"
            @toggle="handleSpellToggle"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="availableCantrips.length === 0 && availableLeveledSpells.length === 0 && raceSpells.length === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400">
          No spells available for selection at this level.
        </p>
      </div>
    </template>

    <!-- Continue Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-test="continue-btn"
        size="lg"
        :disabled="!canProceed || isLoading"
        :loading="isLoading"
        @click="handleContinue"
      >
        Continue with Spells
      </UButton>
    </div>
  </div>
</template>

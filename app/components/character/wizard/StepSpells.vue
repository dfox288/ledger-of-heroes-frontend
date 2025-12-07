<!-- app/components/character/wizard/StepSpells.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Spell } from '~/types'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { normalizeEndpoint } from '~/composables/useApi'

type PendingChoice = components['schemas']['PendingChoiceResource']

const store = useCharacterWizardStore()
const {
  characterId,
  selections,
  stats,
  isLoading,
  error: storeError
} = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// API client
const { apiFetch } = useApi()

// Use unified choices composable
const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => characterId.value))

// Fetch spell choices on mount
onMounted(async () => {
  await fetchChoices('spell')
})

// Combined error state
const error = computed(() => storeError.value || choicesError.value)

// Local tracking for selected spells per choice
// Map<choiceId, Set<spellId as string>> - API expects string IDs like "33"
const selectedSpells = ref<Map<string, Set<string>>>(new Map())

// Local cache for fetched spell options
// Map<choiceId, Spell[]>
const spellOptions = ref<Map<string, Spell[]>>(new Map())

// Spell choices grouped by subtype
const cantripChoices = computed(() =>
  choicesByType.value.spells.filter(c => c.subtype === 'cantrip')
)

const spellsKnownChoices = computed(() =>
  choicesByType.value.spells.filter(c => c.subtype === 'spells_known')
)

const raceSpellChoices = computed(() =>
  choicesByType.value.spells.filter(c => c.source === 'race')
)

// Fetch options for a choice if not already fetched
async function fetchSpellOptionsForChoice(choice: PendingChoice) {
  if (!choice.options_endpoint || spellOptions.value.has(choice.id)) return

  try {
    // Normalize endpoint: backend returns /api/v1/... but Nitro expects /...
    const endpoint = normalizeEndpoint(choice.options_endpoint)
    const response = await apiFetch<{ data: Spell[] }>(endpoint)
    spellOptions.value.set(choice.id, response.data)
  } catch (e) {
    console.error(`Failed to fetch spell options for ${choice.id}:`, e)
  }
}

// Get available spells for a choice
function getAvailableSpells(choice: PendingChoice): Spell[] {
  // If options are provided inline, use them
  if (choice.options && Array.isArray(choice.options)) {
    return choice.options as Spell[]
  }
  // Otherwise, use fetched options
  return spellOptions.value.get(choice.id) ?? []
}

// Fetch options for all spell choices when they load
watch(choicesByType, async (newVal) => {
  const allSpellChoices = newVal.spells
  for (const choice of allSpellChoices) {
    await fetchSpellOptionsForChoice(choice)

    // Initialize selected set from choice.selected (slugs from API)
    if (!selectedSpells.value.has(choice.id)) {
      const selected = new Set<string>()
      for (const spellSlug of choice.selected) {
        // Ensure it's a string (slug)
        selected.add(String(spellSlug))
      }
      selectedSpells.value.set(choice.id, selected)
    }
  }
}, { immediate: true })

// Spellcasting display from stats
const spellcasting = computed(() => {
  if (!stats.value?.spellcasting) return null

  const sc = stats.value.spellcasting
  const abilityNames: Record<string, string> = {
    STR: 'Strength',
    DEX: 'Dexterity',
    CON: 'Constitution',
    INT: 'Intelligence',
    WIS: 'Wisdom',
    CHA: 'Charisma'
  }

  return {
    ability: sc.ability,
    abilityName: abilityNames[sc.ability] ?? sc.ability,
    saveDC: sc.spell_save_dc,
    attackBonus: sc.spell_attack_bonus,
    formattedAttackBonus: sc.spell_attack_bonus >= 0 ? `+${sc.spell_attack_bonus}` : `${sc.spell_attack_bonus}`
  }
})

// Calculate total cantrips and spells limits from choices
const cantripsLimit = computed(() => {
  return cantripChoices.value.reduce((sum, choice) => sum + choice.quantity, 0)
})

const spellsLimit = computed(() => {
  return spellsKnownChoices.value.reduce((sum, choice) => sum + choice.quantity, 0)
})

// Race spell data (fixed spells from race selection)
const fixedRaceSpells = computed(() =>
  selections.value.race?.spells?.filter(s => !s.is_choice) ?? []
)

// Get count of selected spells for a choice
function getSelectedCount(choiceId: string): number {
  return selectedSpells.value.get(choiceId)?.size ?? 0
}

// Check if a spell is selected in a choice
function isSpellSelected(choiceId: string, spellId: number): boolean {
  return selectedSpells.value.get(choiceId)?.has(String(spellId)) ?? false
}

// Check if a choice is at limit
function isChoiceAtLimit(choice: PendingChoice): boolean {
  return getSelectedCount(choice.id) >= choice.quantity
}

// Toggle spell selection for a choice
function handleSpellToggle(choice: PendingChoice, spell: Spell) {
  const selected = selectedSpells.value.get(choice.id) ?? new Set<string>()
  const spellIdStr = String(spell.id)

  if (selected.has(spellIdStr)) {
    // Deselect
    selected.delete(spellIdStr)
  } else {
    // Don't allow selecting more than limit
    if (selected.size >= choice.quantity) return
    selected.add(spellIdStr)
  }

  selectedSpells.value.set(choice.id, selected)
}

// Validation: all requirements met?
const canProceed = computed(() => {
  // All required spell choices must be complete
  const requiredChoices = choicesByType.value.spells.filter(c => c.required)
  for (const choice of requiredChoices) {
    const selectedCount = getSelectedCount(choice.id)
    if (selectedCount < choice.quantity) return false
  }
  return true
})

// Saving state
const isSaving = ref(false)
const saveError = ref<string | null>(null)

// Toast for user feedback
const toast = useToast()

/**
 * Save spells and continue to next step
 */
async function handleContinue() {
  isSaving.value = true
  saveError.value = null

  try {
    // Resolve all spell choices
    for (const choice of choicesByType.value.spells) {
      const selected = selectedSpells.value.get(choice.id)
      if (selected && selected.size > 0) {
        await resolveChoice(choice.id, { selected: Array.from(selected) })
      }
    }
    nextStep()
  } catch (e) {
    console.error('Failed to save spell choices:', e)
    saveError.value = e instanceof Error ? e.message : 'Failed to save spell choices'
    toast.add({
      title: 'Failed to save spells',
      description: 'Please try again',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isSaving.value = false
  }
}

/**
 * Format level text
 */
function formatLevelText(level: number): string {
  if (level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${level}${suffix[level]} Level`
}

// Modal state for spell details
const detailModalOpen = ref(false)
const detailSpell = ref<Spell | null>(null)

/**
 * View spell details - open modal
 */
function handleViewDetails(spell: Spell) {
  detailSpell.value = spell
  detailModalOpen.value = true
}

/**
 * Close detail modal
 */
function handleCloseModal() {
  detailModalOpen.value = false
  detailSpell.value = null
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

    <!-- Spellcasting Info Card -->
    <div
      v-if="spellcasting"
      class="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
    >
      <h3 class="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-3">
        Spellcasting Information
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Spellcasting Ability
          </p>
          <p class="text-lg font-semibold text-primary-900 dark:text-primary-100">
            {{ spellcasting.abilityName }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Spell Save DC
          </p>
          <p class="text-lg font-semibold text-primary-900 dark:text-primary-100">
            {{ spellcasting.saveDC }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Spell Attack Bonus
          </p>
          <p class="text-lg font-semibold text-primary-900 dark:text-primary-100">
            {{ spellcasting.formattedAttackBonus }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Cantrips / Spells Known
          </p>
          <p class="text-lg font-semibold text-primary-900 dark:text-primary-100">
            {{ cantripsLimit }} / {{ spellsLimit }}
          </p>
        </div>
      </div>
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
      v-if="loadingChoices"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-spell-500"
      />
    </div>

    <template v-else>
      <!-- Fixed Racial Spells (if any) -->
      <div
        v-if="fixedRaceSpells.length > 0"
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
          Racial Spells ({{ selections.race?.name }})
        </h3>

        <div class="space-y-2">
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
      </div>

      <!-- Race Spell Choices (from unified choices) -->
      <div
        v-for="choice in raceSpellChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ choice.source_name }} - {{ choice.subtype || 'Spells' }}
          </h3>
          <UBadge
            :color="getSelectedCount(choice.id) >= choice.quantity ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ getSelectedCount(choice.id) }} of {{ choice.quantity }}
          </UBadge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CharacterPickerSpellPickerCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell.id)"
            :disabled="!isSpellSelected(choice.id, spell.id) && isChoiceAtLimit(choice)"
            @toggle="handleSpellToggle(choice, spell)"
            @view-details="handleViewDetails(spell)"
          />
        </div>
      </div>

      <!-- Cantrips Section -->
      <div
        v-for="choice in cantripChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Cantrips ({{ choice.source_name }})
          </h3>
          <UBadge
            :color="getSelectedCount(choice.id) >= choice.quantity ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ getSelectedCount(choice.id) }} of {{ choice.quantity }}
          </UBadge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CharacterPickerSpellPickerCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell.id)"
            :disabled="!isSpellSelected(choice.id, spell.id) && isChoiceAtLimit(choice)"
            @toggle="handleSpellToggle(choice, spell)"
            @view-details="handleViewDetails(spell)"
          />
        </div>
      </div>

      <!-- Spells Known Section -->
      <div
        v-for="choice in spellsKnownChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            1st Level Spells ({{ choice.source_name }})
          </h3>
          <UBadge
            :color="getSelectedCount(choice.id) >= choice.quantity ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ getSelectedCount(choice.id) }} of {{ choice.quantity }}
          </UBadge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CharacterPickerSpellPickerCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell.id)"
            :disabled="!isSpellSelected(choice.id, spell.id) && isChoiceAtLimit(choice)"
            @toggle="handleSpellToggle(choice, spell)"
            @view-details="handleViewDetails(spell)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="choicesByType.spells.length === 0 && fixedRaceSpells.length === 0"
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
        data-testid="continue-btn"
        size="lg"
        :disabled="!canProceed || isLoading || isSaving"
        :loading="isLoading || isSaving"
        @click="handleContinue"
      >
        Continue with Spells
      </UButton>
    </div>

    <!-- Spell Detail Modal -->
    <CharacterPickerSpellDetailModal
      :spell="detailSpell"
      :open="detailModalOpen"
      @close="handleCloseModal"
    />
  </div>
</template>

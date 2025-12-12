<!-- app/components/character/wizard/StepSpells.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Spell } from '~/types'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'
import { normalizeEndpoint } from '~/composables/useApi'
import { wizardErrors } from '~/utils/wizardErrors'

type PendingChoice = components['schemas']['PendingChoiceResource']

// Props for store-agnostic usage (enables use in both creation and level-up wizards)
const props = withDefaults(defineProps<{
  characterId?: number
  nextStep?: () => void
  spellcastingStats?: {
    ability: string
    spell_save_dc: number
    spell_attack_bonus: number
  } | null
}>(), {
  characterId: undefined,
  nextStep: undefined,
  spellcastingStats: null
})

// Fallback to store if props not provided (backward compatibility)
const store = useCharacterWizardStore()
const {
  characterId: storeCharacterId,
  selections,
  stats,
  isLoading,
  error: storeError
} = storeToRefs(store)
const wizardNav = useCharacterWizard()

// Use prop or store value
const effectiveCharacterId = computed(() => props.characterId ?? storeCharacterId.value)
const effectiveNextStep = computed(() => props.nextStep ?? wizardNav.nextStep)

// API client for fetching spell options
const { apiFetch } = useApi()

// Use unified choices composable with effective character ID
const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(effectiveCharacterId)

// Fetch spell choices on mount
onMounted(async () => {
  await fetchChoices('spell')
})

// Combined error state
const error = computed(() => storeError.value || choicesError.value)

// Use choice selection composable for core selection logic
const {
  localSelections: selectedSpells,
  isSaving,
  getSelectedCount,
  isOptionSelected: isSpellSelectedById,
  isOptionDisabled: isSpellDisabledById,
  getDisabledReason: getSpellDisabledReasonById,
  allComplete: canProceed,
  handleToggle: handleSpellToggleById,
  saveAllChoices
} = useWizardChoiceSelection(
  computed(() => choicesByType.value.spells),
  { resolveChoice }
)

// Local cache for fetched spell options (full Spell objects needed for SpellCard display)
// The composable's getDisplayOptions() returns simplified objects missing level/school/etc.
const spellOptionsCache = ref<Map<string, Spell[]>>(new Map())

// Fetch full spell options for a choice
async function fetchSpellOptionsForChoice(choice: PendingChoice) {
  if (!choice.options_endpoint || spellOptionsCache.value.has(choice.id)) return

  try {
    const endpoint = normalizeEndpoint(choice.options_endpoint)
    const response = await apiFetch<{ data: Spell[] }>(endpoint)
    spellOptionsCache.value.set(choice.id, response.data)
  } catch (e) {
    logger.error(`Failed to fetch spell options for ${choice.id}:`, e)
  }
}

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

// Subclass feature spell choices (cantrips will also appear in cantripChoices)
// This catches any subclass_feature spell choices that aren't cantrips
const subclassFeatureSpellChoices = computed(() =>
  choicesByType.value.spells.filter(c =>
    c.source === 'subclass_feature' && c.subtype !== 'cantrip'
  )
)

// Fetch options for all spell choices when they load
watch(choicesByType, async (newVal) => {
  const allSpellChoices = newVal.spells
  for (const choice of allSpellChoices) {
    await fetchSpellOptionsForChoice(choice)
  }
}, { immediate: true })

// Spellcasting display from stats (use prop if provided, otherwise use store stats)
const spellcasting = computed(() => {
  // Use prop if provided
  if (props.spellcastingStats) {
    const sc = props.spellcastingStats
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
  }

  // Otherwise use store stats
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

// Spell-specific wrappers for composable functions (work with Spell objects)
function isSpellSelected(choiceId: string, spell: Spell): boolean {
  return isSpellSelectedById(choiceId, spell.slug)
}

function isSpellDisabled(choiceId: string, spell: Spell): boolean {
  // Disabled if: already selected elsewhere OR at limit (and not selected in this choice)
  return isSpellDisabledById(choiceId, spell.slug)
    || (!isSpellSelectedById(choiceId, spell.slug) && isChoiceAtLimit(choiceId))
}

function getSpellDisabledReason(choiceId: string, spell: Spell): string | null {
  return getSpellDisabledReasonById(choiceId, spell.slug)
}

function isChoiceAtLimit(choiceId: string): boolean {
  const choice = choicesByType.value.spells.find(c => c.id === choiceId)
  return choice ? getSelectedCount(choiceId) >= choice.quantity : false
}

function handleSpellToggle(choice: PendingChoice, spell: Spell) {
  handleSpellToggleById(choice, spell.slug)
}

// Get available spells for a choice (from choice.options or local cache)
function getAvailableSpells(choice: PendingChoice): Spell[] {
  // If options are provided inline as Spell objects, use them directly
  if (choice.options && Array.isArray(choice.options) && choice.options.length > 0) {
    return choice.options as Spell[]
  }
  // Otherwise, use locally cached full Spell objects (needed for SpellCard display)
  return spellOptionsCache.value.get(choice.id) ?? []
}

// Toast for user feedback
const toast = useToast()

/**
 * Save spells and continue to next step
 */
async function handleContinue() {
  try {
    await saveAllChoices()
    effectiveNextStep.value()
  } catch (e) {
    wizardErrors.choiceResolveFailed(e, toast, 'spell')
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
const {
  open: detailModalOpen,
  item: detailSpell,
  show: handleViewDetails,
  close: handleCloseModal
} = useDetailModal<Spell>()
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
          <CharacterSpellCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell)"
            :disabled="isSpellDisabled(choice.id, spell)"
            :disabled-reason="getSpellDisabledReason(choice.id, spell)"
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
          <CharacterSpellCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell)"
            :disabled="isSpellDisabled(choice.id, spell)"
            :disabled-reason="getSpellDisabledReason(choice.id, spell)"
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
          <CharacterSpellCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell)"
            :disabled="isSpellDisabled(choice.id, spell)"
            :disabled-reason="getSpellDisabledReason(choice.id, spell)"
            @toggle="handleSpellToggle(choice, spell)"
            @view-details="handleViewDetails(spell)"
          />
        </div>
      </div>

      <!-- Subclass Feature Spell Choices (non-cantrip) -->
      <div
        v-for="choice in subclassFeatureSpellChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Spells ({{ choice.source_name }})
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
          <CharacterSpellCard
            v-for="spell in getAvailableSpells(choice)"
            :key="spell.id"
            :spell="spell"
            :selected="isSpellSelected(choice.id, spell)"
            :disabled="isSpellDisabled(choice.id, spell)"
            :disabled-reason="getSpellDisabledReason(choice.id, spell)"
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

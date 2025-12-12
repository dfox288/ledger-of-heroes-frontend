<!-- app/components/character/wizard/StepFeats.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Feat } from '~/types'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'
import { useDetailModal } from '~/composables/useDetailModal'
import { wizardErrors } from '~/utils/wizardErrors'

type PendingChoice = components['schemas']['PendingChoiceResource']

const store = useCharacterWizardStore()
const {
  characterId,
  isLoading,
  error: storeError,
  effectiveRace
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

// Fetch feat choices on mount
onMounted(async () => {
  await fetchChoices('feat')
})

// Combined error state
const error = computed(() => storeError.value || choicesError.value)

// Feat choices (all feat-type choices regardless of source)
const featChoices = computed(() => choicesByType.value.feats)

// Use choice selection composable for core selection logic
const {
  localSelections: selectedFeats,
  isSaving,
  getSelectedCount,
  isOptionSelected: isFeatSelectedById,
  allComplete: canProceed,
  handleToggle: handleFeatToggleById,
  saveAllChoices
} = useWizardChoiceSelection(
  featChoices,
  { resolveChoice }
)

// Local cache for fetched feat options (feats need custom fetching with source param)
// Map<choiceId, Feat[]>
const featOptions = ref<Map<string, Feat[]>>(new Map())

/**
 * Determine feat source from choice ID
 * Choice IDs follow pattern: feat|{source}|... (e.g., feat|race|phb:human-variant|1|bonus_feat)
 */
function getFeatSourceFromChoiceId(choiceId: string): 'race' | 'asi' {
  const parts = choiceId.split('|')
  const source = parts[1] // Second part is the source
  return source === 'race' ? 'race' : 'asi'
}

// Fetch options for a choice using the character-specific available-feats endpoint
async function fetchFeatOptionsForChoice(choice: PendingChoice) {
  if (featOptions.value.has(choice.id)) return
  if (!characterId.value) return

  try {
    // Use new available-feats endpoint with source parameter
    // For race feats: excludes ability score prerequisite feats (RAW compliant)
    // For ASI feats: checks all prerequisites against current character stats
    const source = getFeatSourceFromChoiceId(choice.id)
    const endpoint = `/characters/${characterId.value}/available-feats?source=${source}&per_page=200`
    const response = await apiFetch<{ data: Feat[] }>(endpoint)
    featOptions.value.set(choice.id, response.data)
  } catch (e) {
    logger.error(`Failed to fetch feat options for ${choice.id}:`, e)
  }
}

/**
 * Check if character meets race prerequisite for a feat
 * Matches if character's race ID or parent race ID equals the prerequisite race ID
 */
function meetsRacePrerequisite(feat: Feat): boolean {
  if (!feat.prerequisites || feat.prerequisites.length === 0) {
    return true // No prerequisites = always available
  }

  const race = effectiveRace.value
  if (!race) return true // No race selected yet, show all feats

  // Get character's race ID and parent race ID
  const characterRaceId = race.id
  const characterParentRaceId = race.parent_race?.id

  // Check each prerequisite
  for (const prereq of feat.prerequisites) {
    // Only filter by race prerequisites (frontend can't validate ability scores/proficiencies)
    if (prereq.race?.id) {
      const prereqRaceId = prereq.race.id
      // Character must match the race or be a subrace of it
      if (characterRaceId !== prereqRaceId && characterParentRaceId !== prereqRaceId) {
        return false
      }
    }
  }

  return true
}

// Get available feats for a choice (filtered by prerequisites character can meet)
function getAvailableFeats(choice: PendingChoice): Feat[] {
  let feats: Feat[]

  // If options are provided inline, use them
  if (choice.options && Array.isArray(choice.options) && choice.options.length > 0) {
    feats = choice.options as Feat[]
  } else {
    // Otherwise, use fetched options
    feats = featOptions.value.get(choice.id) ?? []
  }

  // Filter out feats with race prerequisites the character doesn't meet
  return feats.filter(meetsRacePrerequisite)
}

// Fetch options for all feat choices when they load
watch(featChoices, async (newVal) => {
  for (const choice of newVal) {
    await fetchFeatOptionsForChoice(choice)
  }
}, { immediate: true })

// Feat-specific wrappers for composable functions
function isFeatSelected(choiceId: string, featSlug: string): boolean {
  return isFeatSelectedById(choiceId, featSlug)
}

function isChoiceAtLimit(choice: PendingChoice): boolean {
  return getSelectedCount(choice.id) >= choice.quantity
}

function handleFeatToggle(choice: PendingChoice, feat: Feat) {
  handleFeatToggleById(choice, feat.slug)
}

// Toast for user feedback
const toast = useToast()

/**
 * Save feats and continue to next step
 */
async function handleContinue() {
  try {
    await saveAllChoices()

    // Sync store with backend to update hasFeatChoices flag
    await store.syncWithBackend()

    nextStep()
  } catch (e) {
    wizardErrors.choiceResolveFailed(e, toast, 'feat')
  }
}

// Modal state for feat details
const {
  open: detailModalOpen,
  item: detailFeat,
  show: handleViewDetails,
  close: handleCloseModal
} = useDetailModal<Feat>()
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Select Your Feats
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Choose feats granted by your race or other features
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
      v-if="loadingChoices"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-feat-500"
      />
    </div>

    <template v-else>
      <!-- Feat Choices Sections -->
      <div
        v-for="choice in featChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Feat ({{ choice.source_name }})
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
          <CharacterFeatCard
            v-for="feat in getAvailableFeats(choice)"
            :key="feat.id"
            :feat="feat"
            :selected="isFeatSelected(choice.id, feat.slug)"
            :disabled="!isFeatSelected(choice.id, feat.slug) && isChoiceAtLimit(choice)"
            @toggle="handleFeatToggle(choice, feat)"
            @view-details="handleViewDetails(feat)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="featChoices.length === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-heroicons-star"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400">
          No feat choices available.
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Feats may be available from races like Variant Human or at certain class levels.
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
        Continue with Feats
      </UButton>
    </div>

    <!-- Feat Detail Modal -->
    <CharacterPickerFeatDetailModal
      :feat="detailFeat"
      :open="detailModalOpen"
      @close="handleCloseModal"
    />
  </div>
</template>

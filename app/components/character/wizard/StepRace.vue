<!-- app/components/character/wizard/StepRace.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Race } from '~/types'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useWizardEntitySelection } from '~/composables/useWizardEntitySelection'
import { wizardErrors } from '~/utils/wizardErrors'

const store = useCharacterWizardStore()
const { selections, isLoading, error, sourceFilterString } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// API client
const { apiFetch } = useApi()

// Fetch only base races (not subraces) filtered by selected sourcebooks
const { data: races, pending: loadingRaces } = await useAsyncData(
  `builder-races-${sourceFilterString.value}`,
  () => {
    // Always filter for base races only (is_subrace=false)
    const baseRaceFilter = 'is_subrace=false'
    const sourceFilter = sourceFilterString.value

    // Combine filters with AND if source filter exists
    const combinedFilter = sourceFilter
      ? `${baseRaceFilter} AND ${sourceFilter}`
      : baseRaceFilter

    const url = `/races?per_page=50&filter=${encodeURIComponent(combinedFilter)}`
    return apiFetch<{ data: Race[] }>(url)
  },
  {
    transform: (response: { data: Race[] }) => response.data,
    watch: [sourceFilterString]
  }
)

// Use entity selection composable for core selection logic
const {
  localSelected: localSelectedRace,
  searchQuery,
  filtered: filteredRaces,
  canProceed,
  confirmSelection,
  detailModal: { open: detailModalOpen, item: detailRace, show: showDetails, close: _closeDetails }
} = useWizardEntitySelection(races, {
  storeAction: race => store.selectRace(race),
  existingSelection: computed(() => selections.value.race)
})

// ═══════════════════════════════════════════════════════════════════════════
// Race-specific: Change confirmation modal (when subrace was previously selected)
// This is NOT in the composable because only StepRace needs this behavior.
// ═══════════════════════════════════════════════════════════════════════════

const confirmChangeModalOpen = ref(false)
const pendingRaceChange = ref<Race | null>(null)

/**
 * Handle race card selection
 * Shows confirmation if changing race when subrace was previously selected
 */
function handleRaceSelect(race: Race) {
  // If changing race and a subrace was previously selected, show confirmation
  if (selections.value.subrace && localSelectedRace.value?.id !== race.id) {
    pendingRaceChange.value = race
    confirmChangeModalOpen.value = true
    return
  }
  localSelectedRace.value = race
}

/**
 * Confirm the pending race change (clears subrace)
 */
function confirmRaceChange() {
  if (pendingRaceChange.value) {
    // Just set the new race - store will handle subrace clearing
    localSelectedRace.value = pendingRaceChange.value
    pendingRaceChange.value = null
  }
  confirmChangeModalOpen.value = false
}

/**
 * Cancel the pending race change
 */
function cancelRaceChange() {
  pendingRaceChange.value = null
  confirmChangeModalOpen.value = false
}

/**
 * Confirm selection and navigate to next step
 */
async function handleConfirm() {
  try {
    await confirmSelection()
    nextStep()
  } catch (err) {
    wizardErrors.saveFailed(err, toast)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <CharacterWizardStepHeader
      title="Choose Your Race"
      description="Your race determines your character's physical traits and natural abilities"
    />

    <!-- Search -->
    <div class="max-w-md mx-auto">
      <UInput
        v-model="searchQuery"
        placeholder="Search races..."
        icon="i-heroicons-magnifying-glass"
        size="lg"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
    />

    <!-- Loading State -->
    <CharacterWizardLoadingState
      v-if="loadingRaces"
      color="race"
    />

    <!-- Race Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <CharacterRaceCard
        v-for="race in filteredRaces"
        :key="race.id"
        :race="race"
        :selected="localSelectedRace?.id === race.id"
        @select="handleRaceSelect"
        @view-details="showDetails(race)"
      />
    </div>

    <!-- Empty State -->
    <CharacterWizardEmptyState
      v-if="!loadingRaces && filteredRaces.length === 0"
      icon="i-heroicons-magnifying-glass"
      :title="`No races found matching &quot;${searchQuery}&quot;`"
    />

    <!-- Confirm Button -->
    <CharacterWizardContinueButton
      :text="isLoading ? 'Saving...' : `Continue with ${localSelectedRace?.name || 'Selection'}`"
      :disabled="!canProceed || isLoading"
      :loading="isLoading"
      @click="handleConfirm"
    />

    <!-- Detail Modal -->
    <CharacterPickerRaceDetailModal
      v-model:open="detailModalOpen"
      :race="detailRace"
    />

    <!-- Confirmation Modal for changing race when subrace was selected -->
    <CharacterWizardChangeConfirmationModal
      v-model:open="confirmChangeModalOpen"
      title="Change Race?"
      message="Changing your race will clear your subrace selection. You'll need to choose a new subrace if the new race has subraces."
      @confirm="confirmRaceChange"
      @cancel="cancelRaceChange"
    />
  </div>
</template>

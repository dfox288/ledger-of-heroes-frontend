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
  detailModal: { open: detailModalOpen, item: detailRace, show: showDetails, close: closeDetails }
} = useWizardEntitySelection(races, {
  storeAction: (race) => store.selectRace(race),
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
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Race
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Your race determines your character's physical traits and natural abilities
      </p>
    </div>

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
    <div
      v-if="loadingRaces"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-race-500"
      />
    </div>

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
    <div
      v-if="!loadingRaces && filteredRaces.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No races found matching "{{ searchQuery }}"
      </p>
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        size="lg"
        :disabled="!canProceed || isLoading"
        :loading="isLoading"
        @click="handleConfirm"
      >
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedRace?.name || 'Selection') }}
      </UButton>
    </div>

    <!-- Detail Modal -->
    <CharacterPickerRaceDetailModal
      :race="detailRace"
      :open="detailModalOpen"
      @close="closeDetails"
    />

    <!-- Confirmation Modal for changing race when subrace was selected -->
    <UModal v-model:open="confirmChangeModalOpen">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-5 h-5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Change Race?
            </h3>
          </div>

          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Changing your race will clear your subrace selection. You'll need to choose a new subrace if the new race has subraces.
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              variant="outline"
              @click="cancelRaceChange"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="confirmRaceChange"
            >
              Continue
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<!-- app/components/character/builder/StepRace.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Race } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const store = useCharacterBuilderStore()
const { selectedRace, subraceId, isLoading, error } = storeToRefs(store)

// API client
const { apiFetch } = useApi()

// Fetch all races
const { data: races, pending: loadingRaces } = await useAsyncData(
  'builder-races',
  () => apiFetch<{ data: Race[] }>('/races?per_page=100'),
  { transform: (response: { data: Race[] }) => response.data }
)

// Local state
const searchQuery = ref('')
const localSelectedRace = ref<Race | null>(null)
const detailModalOpen = ref(false)
const detailRace = ref<Race | null>(null)

// Confirmation modal state
const confirmChangeModalOpen = ref(false)
const pendingRaceChange = ref<Race | null>(null)

// Filter to only show base races (not subraces)
const baseRaces = computed((): Race[] => {
  if (!races.value) return []
  return races.value.filter((race: Race) => !race.parent_race)
})

// Apply search filter
const filteredRaces = computed((): Race[] => {
  if (!searchQuery.value) return baseRaces.value
  const query = searchQuery.value.toLowerCase()
  return baseRaces.value.filter((race: Race) =>
    race.name.toLowerCase().includes(query)
  )
})

// Validation: can proceed if race selected
const canProceed = computed(() => !!localSelectedRace.value)

/**
 * Handle race card selection
 * Shows confirmation if changing race when subrace was previously selected
 */
function handleRaceSelect(race: Race) {
  // If changing race and a subrace was previously selected, show confirmation
  if (subraceId.value && localSelectedRace.value?.id !== race.id) {
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
    store.clearSubrace()
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
 * Open detail modal
 */
function handleViewDetails(race: Race) {
  detailRace.value = race
  detailModalOpen.value = true
}

/**
 * Close detail modal
 */
function handleCloseModal() {
  detailModalOpen.value = false
  detailRace.value = null
}

/**
 * Confirm selection and call store action
 */
async function confirmSelection() {
  if (!localSelectedRace.value) return

  try {
    await store.selectRace(localSelectedRace.value)
    store.nextStep()
  } catch (err) {
    // Error is already set in store
    console.error('Failed to save race:', err)
  }
}

// Initialize from store if already selected
onMounted(() => {
  if (selectedRace.value) {
    // Find the base race if we have a subrace selected
    if (selectedRace.value.parent_race) {
      localSelectedRace.value = baseRaces.value.find((r: Race) => r.id === selectedRace.value?.parent_race?.id) ?? null
    } else {
      localSelectedRace.value = selectedRace.value
    }
  }
})
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
      <CharacterBuilderRacePickerCard
        v-for="race in filteredRaces"
        :key="race.id"
        :race="race"
        :selected="localSelectedRace?.id === race.id"
        @select="handleRaceSelect"
        @view-details="handleViewDetails(race)"
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
        @click="confirmSelection"
      >
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedRace?.name || 'Selection') }}
      </UButton>
    </div>

    <!-- Detail Modal -->
    <CharacterBuilderRaceDetailModal
      :race="detailRace"
      :open="detailModalOpen"
      @close="handleCloseModal"
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

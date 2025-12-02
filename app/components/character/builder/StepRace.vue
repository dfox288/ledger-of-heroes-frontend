<!-- app/components/character/builder/StepRace.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Race } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const store = useCharacterBuilderStore()
const { selectedRace, isLoading, error } = storeToRefs(store)

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
const localSelectedSubrace = ref<Race | null>(null)
const detailModalOpen = ref(false)
const detailRace = ref<Race | null>(null)

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

// Check if selected race has subraces
const selectedRaceHasSubraces = computed(() => {
  return localSelectedRace.value?.subraces && localSelectedRace.value.subraces.length > 0
})

// Get subraces for selected race (from full race data)
const availableSubraces = computed((): Race[] => {
  if (!localSelectedRace.value || !races.value) return []
  // Find full subrace objects from the races list
  return races.value.filter((race: Race) =>
    race.parent_race?.id === localSelectedRace.value?.id
  )
})

// Validation: can proceed if race selected (and subrace if needed)
const canProceed = computed(() => {
  if (!localSelectedRace.value) return false
  if (selectedRaceHasSubraces.value && !localSelectedSubrace.value) return false
  return true
})

/**
 * Handle race card selection
 */
function handleRaceSelect(race: Race) {
  localSelectedRace.value = race
  localSelectedSubrace.value = null // Reset subrace when race changes
}

/**
 * Handle subrace selection
 */
function handleSubraceSelect(subrace: Race) {
  localSelectedSubrace.value = subrace
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
    await store.selectRace(localSelectedRace.value, localSelectedSubrace.value ?? undefined)
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
      localSelectedSubrace.value = selectedRace.value
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

    <!-- Subrace Selector (appears when race with subraces is selected) -->
    <div
      v-if="selectedRaceHasSubraces && availableSubraces.length > 0"
      class="bg-race-50 dark:bg-race-900/20 rounded-lg p-4"
    >
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">
        Choose a Subrace for {{ localSelectedRace?.name }}
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          v-for="subrace in availableSubraces"
          :key="subrace.id"
          class="p-3 rounded-lg border-2 transition-all text-left"
          :class="[
            localSelectedSubrace?.id === subrace.id
              ? 'border-race-500 bg-race-100 dark:bg-race-900/40'
              : 'border-gray-200 dark:border-gray-700 hover:border-race-300'
          ]"
          @click="handleSubraceSelect(subrace)"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="[
                localSelectedSubrace?.id === subrace.id
                  ? 'border-race-500 bg-race-500'
                  : 'border-gray-400'
              ]"
            >
              <UIcon
                v-if="localSelectedSubrace?.id === subrace.id"
                name="i-heroicons-check"
                class="w-3 h-3 text-white"
              />
            </div>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ subrace.name }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        size="lg"
        :disabled="!canProceed || isLoading"
        :loading="isLoading"
        @click="confirmSelection"
      >
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedSubrace?.name || localSelectedRace?.name || 'Selection') }}
      </UButton>
    </div>

    <!-- Detail Modal -->
    <CharacterBuilderRaceDetailModal
      :race="detailRace"
      :open="detailModalOpen"
      @close="handleCloseModal"
    />
  </div>
</template>

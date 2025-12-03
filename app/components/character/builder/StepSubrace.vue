<!-- app/components/character/builder/StepSubrace.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Race } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const store = useCharacterBuilderStore()
const { selectedRace, subraceId, isLoading, error } = storeToRefs(store)

// API client
const { apiFetch } = useApi()

// Fetch all races to get full subrace data with traits/modifiers
const { data: races, pending: loadingRaces } = await useAsyncData(
  'builder-subraces',
  () => apiFetch<{ data: Race[] }>('/races?per_page=100'),
  { transform: (response: { data: Race[] }) => response.data }
)

// Local state
const localSelectedSubrace = ref<Race | null>(null)
const detailModalOpen = ref(false)
const detailSubrace = ref<Race | null>(null)

// Get full subrace objects for the selected parent race
const availableSubraces = computed((): Race[] => {
  if (!selectedRace.value || !races.value) return []
  // Filter to find subraces whose parent_race matches the selected race
  return races.value.filter((race: Race) =>
    race.parent_race?.id === selectedRace.value?.id
  )
})

// Validation: can proceed if subrace selected
const canProceed = computed(() => !!localSelectedSubrace.value)

/**
 * Handle subrace selection
 */
function handleSubraceSelect(subrace: Race) {
  localSelectedSubrace.value = subrace
}

/**
 * Open detail modal for a subrace
 */
function handleViewDetails(subrace: Race) {
  detailSubrace.value = subrace
  detailModalOpen.value = true
}

/**
 * Close detail modal
 */
function handleCloseModal() {
  detailModalOpen.value = false
  detailSubrace.value = null
}

/**
 * Confirm selection and advance to next step
 */
async function confirmSelection() {
  if (!localSelectedSubrace.value) return

  try {
    await store.selectSubrace(localSelectedSubrace.value)
    store.nextStep()
  } catch (err) {
    console.error('Failed to save subrace:', err)
  }
}

// Initialize from store if subrace already selected
onMounted(() => {
  if (subraceId.value && races.value) {
    localSelectedSubrace.value = races.value.find(r => r.id === subraceId.value) ?? null
  }
})

// Watch for races to load and initialize if needed
watch(races, (newRaces) => {
  if (newRaces && subraceId.value && !localSelectedSubrace.value) {
    localSelectedSubrace.value = newRaces.find(r => r.id === subraceId.value) ?? null
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Subrace
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select a subrace for your {{ selectedRace?.name }}
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
      v-if="loadingRaces"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-race-500"
      />
    </div>

    <!-- Subrace Grid -->
    <div
      v-else-if="availableSubraces.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <button
        v-for="subrace in availableSubraces"
        :key="subrace.id"
        class="p-4 rounded-lg border-2 transition-all text-left hover:shadow-md"
        :class="[
          localSelectedSubrace?.id === subrace.id
            ? 'border-race-500 bg-race-50 dark:bg-race-900/30 ring-2 ring-race-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-race-300 dark:hover:border-race-600'
        ]"
        @click="handleSubraceSelect(subrace)"
      >
        <!-- Subrace Header -->
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ subrace.name }}
          </h3>
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            :class="[
              localSelectedSubrace?.id === subrace.id
                ? 'border-race-500 bg-race-500'
                : 'border-gray-400 dark:border-gray-500'
            ]"
          >
            <UIcon
              v-if="localSelectedSubrace?.id === subrace.id"
              name="i-heroicons-check"
              class="w-3 h-3 text-white"
            />
          </div>
        </div>

        <!-- Speed (if different from parent) -->
        <div
          v-if="subrace.speed && subrace.speed !== selectedRace?.speed"
          class="text-sm text-gray-600 dark:text-gray-400 mb-2"
        >
          Speed: {{ subrace.speed }} ft.
        </div>

        <!-- Ability Score Modifiers -->
        <div
          v-if="subrace.modifiers?.length"
          class="flex flex-wrap gap-1 mb-2"
        >
          <UBadge
            v-for="mod in subrace.modifiers.filter(m => m.modifier_category === 'ability_score')"
            :key="mod.id"
            color="race"
            variant="subtle"
            size="md"
          >
            {{ mod.ability_score?.code }} +{{ mod.value }}
          </UBadge>
        </div>

        <!-- Traits Preview -->
        <div
          v-if="subrace.traits?.length"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          <span class="font-medium">Traits:</span>
          {{ subrace.traits.map(t => t.name).slice(0, 2).join(', ') }}
          <span v-if="subrace.traits.length > 2">
            +{{ subrace.traits.length - 2 }} more
          </span>
        </div>

        <!-- View Details Link -->
        <span
          role="button"
          tabindex="0"
          class="mt-3 text-sm text-race-600 dark:text-race-400 hover:underline cursor-pointer inline-block"
          @click.stop="handleViewDetails(subrace)"
          @keydown.enter.stop="handleViewDetails(subrace)"
        >
          View Details
        </span>
      </button>
    </div>

    <!-- Empty State (no subraces available) -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No subraces available for {{ selectedRace?.name }}
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
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedSubrace?.name || 'Selection') }}
      </UButton>
    </div>

    <!-- Detail Modal (reuse RaceDetailModal) -->
    <CharacterBuilderRaceDetailModal
      :race="detailSubrace"
      :open="detailModalOpen"
      @close="handleCloseModal"
    />
  </div>
</template>

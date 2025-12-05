<!-- app/components/character/wizard/StepSubrace.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Race } from '~/types'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardNavigation } from '~/composables/useWizardSteps'

const store = useCharacterWizardStore()
const { selections, isLoading, error, isSubraceRequired } = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// API client for fetching full subrace details
const { apiFetch } = useApi()

// Type for subrace items from the subraces array (partial Race data)
type SubraceItem = NonNullable<Race['subraces']>[number]

// Local state for selected subrace
const localSelectedSubrace = ref<SubraceItem | null>(null)

// Modal state
const detailModalOpen = ref(false)
const detailSubrace = ref<Race | null>(null)
const loadingDetail = ref(false)

// Get subraces directly from the selected base race
// The selections.race already has the full subraces array from the detail endpoint
const availableSubraces = computed(() => {
  if (!selections.value.race?.subraces) return []
  return selections.value.race.subraces
})

// Validation: can proceed if subrace is selected OR if subrace is optional and "None" is selected
const canProceed = computed(() => {
  return localSelectedSubrace.value !== null || (!isSubraceRequired.value && localSelectedSubrace.value === null)
})

/**
 * Handle subrace selection
 */
function handleSubraceSelect(subrace: SubraceItem) {
  localSelectedSubrace.value = subrace
}

/**
 * Handle "None" selection for optional subraces
 */
function handleNoneSelection() {
  localSelectedSubrace.value = null
}

/**
 * Open detail modal - fetch full subrace data for complete info
 */
async function handleViewDetails(subrace: SubraceItem) {
  loadingDetail.value = true
  detailModalOpen.value = true

  try {
    // Fetch full subrace detail to get all traits, modifiers, etc.
    const response = await apiFetch<{ data: Race }>(`/races/${subrace.slug}`)
    detailSubrace.value = response.data
  } catch (err) {
    console.error('Failed to fetch subrace details:', err)
    // Still show modal with partial data from the list
    // Use unknown intermediate cast since SubraceItem is a partial Race
    detailSubrace.value = subrace as unknown as Race
  } finally {
    loadingDetail.value = false
  }
}

/**
 * Close detail modal
 */
function handleCloseModal() {
  detailModalOpen.value = false
  detailSubrace.value = null
}

/**
 * Confirm selection and save to store
 * Needs to fetch full race detail before saving since subraces array only has partial data
 */
async function confirmSelection() {
  // If "None" selected (for optional subraces)
  if (localSelectedSubrace.value === null) {
    try {
      await store.selectSubrace(null)
      nextStep()
    } catch (err) {
      console.error('Failed to save subrace selection:', err)
    }
    return
  }

  // Otherwise, fetch and save subrace
  try {
    // Fetch full subrace detail before saving (the subraces array only has partial data)
    const fullSubrace = await apiFetch<{ data: Race }>(`/races/${localSelectedSubrace.value.slug}`)
    await store.selectSubrace(fullSubrace.data)
    nextStep()
  } catch (err) {
    console.error('Failed to save subrace:', err)
  }
}

// Initialize from store if already selected (editing existing selection)
onMounted(() => {
  if (selections.value.subrace) {
    // Find the matching subrace in availableSubraces to set local state
    const existingSubrace = availableSubraces.value.find(s => s.id === selections.value.subrace?.id)
    if (existingSubrace) {
      localSelectedSubrace.value = existingSubrace
    }
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
        {{ selections.race?.name }} has multiple subraces to choose from
      </p>
      <p
        v-if="!isSubraceRequired"
        class="mt-1 text-sm text-gray-500 dark:text-gray-500"
      >
        Subrace is optional for this race
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
    />

    <!-- Subrace Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- "None" Option (for optional subraces only) -->
      <div
        v-if="!isSubraceRequired"
        data-testid="none-option"
        class="relative cursor-pointer transition-all"
        :class="[
          localSelectedSubrace === null ? 'ring-2 ring-race-500 ring-offset-2' : ''
        ]"
        @click="handleNoneSelection"
      >
        <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-gray-300 dark:border-gray-700 hover:border-gray-500">
          <!-- Selected Checkmark -->
          <div
            v-if="localSelectedSubrace === null"
            class="absolute top-2 right-2 z-20"
          >
            <UBadge
              color="success"
              variant="solid"
              size="md"
            >
              <UIcon
                name="i-heroicons-check"
                class="w-4 h-4"
              />
            </UBadge>
          </div>

          <!-- Content -->
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <UIcon
              name="i-heroicons-x-circle"
              class="w-12 h-12 text-gray-400 mb-3"
            />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              No Subrace
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Continue without selecting a subrace
            </p>
          </div>
        </UCard>
      </div>

      <!-- Subrace Cards -->
      <CharacterPickerSubracePickerCard
        v-for="subrace in availableSubraces"
        :key="subrace.id"
        :subrace="subrace"
        :selected="localSelectedSubrace?.id === subrace.id"
        :parent-race-slug="selections.race?.slug"
        @select="handleSubraceSelect"
        @view-details="handleViewDetails(subrace)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="availableSubraces.length === 0 && isSubraceRequired"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-12 h-12 text-amber-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No subraces found for {{ selections.race?.name }}
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
        <template v-if="isLoading">
          Saving...
        </template>
        <template v-else-if="localSelectedSubrace === null">
          Continue without Subrace
        </template>
        <template v-else>
          Continue with {{ localSelectedSubrace.name }}
        </template>
      </UButton>
    </div>

    <!-- Detail Modal -->
    <CharacterPickerSubraceDetailModal
      :subrace="detailSubrace"
      :open="detailModalOpen"
      :parent-race="selections.race"
      @close="handleCloseModal"
    />
  </div>
</template>

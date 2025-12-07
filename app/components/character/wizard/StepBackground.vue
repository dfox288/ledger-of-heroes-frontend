<!-- app/components/character/wizard/StepBackground.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Background } from '~/types'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useDetailModal } from '~/composables/useDetailModal'
import { useEntitySearch } from '~/composables/useEntitySearch'

const store = useCharacterWizardStore()
const { selections, isLoading, error, sourceFilterString } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// API client
const { apiFetch } = useApi()

// Fetch backgrounds filtered by selected sourcebooks
const { data: backgrounds, pending: loadingBackgrounds } = await useAsyncData(
  `builder-backgrounds-${sourceFilterString.value}`,
  () => {
    const filter = sourceFilterString.value
    const url = filter
      ? `/backgrounds?per_page=100&filter=${encodeURIComponent(filter)}`
      : '/backgrounds?per_page=100'
    return apiFetch<{ data: Background[] }>(url)
  },
  {
    transform: (response: { data: Background[] }) => response.data,
    watch: [sourceFilterString]
  }
)

// Local state
const localSelectedBackground = ref<Background | null>(null)

// Detail modal
const { open: detailModalOpen, item: detailBackground, show: showDetails, close: closeDetails } = useDetailModal<Background>()

// Create a computed that ensures we have a proper type for useEntitySearch
const backgroundsList = computed((): Background[] => {
  if (!backgrounds.value) return []
  return backgrounds.value
})

// Search filter
const { searchQuery, filtered: filteredBackgrounds } = useEntitySearch(backgroundsList, {
  searchableFields: ['name', 'feature_name']
})

// Validation: can proceed if background selected
const canProceed = computed(() => {
  return localSelectedBackground.value !== null
})

/**
 * Handle background card selection
 */
function handleBackgroundSelect(background: Background) {
  localSelectedBackground.value = background
}

/**
 * Confirm selection and call store action
 */
async function confirmSelection() {
  if (!localSelectedBackground.value) return

  try {
    await store.selectBackground(localSelectedBackground.value)
    nextStep()
  } catch (err) {
    console.error('Failed to save background:', err)
    toast.add({
      title: 'Save Failed',
      description: 'Unable to save your selection. Please try again.',
      color: 'error'
    })
  }
}

// Initialize from store if already selected
onMounted(() => {
  if (selections.value.background) {
    localSelectedBackground.value = selections.value.background
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Background
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Your background reveals where you came from and your place in the world
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-md mx-auto">
      <UInput
        v-model="searchQuery"
        placeholder="Search backgrounds..."
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
      v-if="loadingBackgrounds"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-background-500"
      />
    </div>

    <!-- Background Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <CharacterPickerBackgroundPickerCard
        v-for="background in filteredBackgrounds"
        :key="background.id"
        :background="background"
        :selected="localSelectedBackground?.id === background.id"
        @select="handleBackgroundSelect"
        @view-details="showDetails(background)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="!loadingBackgrounds && filteredBackgrounds.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No backgrounds found matching "{{ searchQuery }}"
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
        {{ isLoading ? 'Saving...' : 'Continue with ' + (localSelectedBackground?.name || 'Selection') }}
      </UButton>
    </div>

    <!-- Detail Modal -->
    <CharacterPickerBackgroundDetailModal
      :background="detailBackground"
      :open="detailModalOpen"
      @close="closeDetails"
    />
  </div>
</template>

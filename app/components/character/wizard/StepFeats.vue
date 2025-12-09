<!-- app/components/character/wizard/StepFeats.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Feat } from '~/types'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { normalizeEndpoint } from '~/composables/useApi'
import { logger } from '~/utils/logger'

type PendingChoice = components['schemas']['PendingChoiceResource']

const store = useCharacterWizardStore()
const {
  characterId,
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

// Fetch feat choices on mount
onMounted(async () => {
  await fetchChoices('feat')
})

// Combined error state
const error = computed(() => storeError.value || choicesError.value)

// Local tracking for selected feats per choice
// Map<choiceId, Set<full_slug>> - API expects full_slug format like "phb:alert"
const selectedFeats = ref<Map<string, Set<string>>>(new Map())

// Local cache for fetched feat options
// Map<choiceId, Feat[]>
const featOptions = ref<Map<string, Feat[]>>(new Map())

// Feat choices (all feat-type choices regardless of source)
const featChoices = computed(() => choicesByType.value.feats)

// Fetch options for a choice if not already fetched
async function fetchFeatOptionsForChoice(choice: PendingChoice) {
  if (!choice.options_endpoint || featOptions.value.has(choice.id)) return

  try {
    // Normalize endpoint: backend returns /api/v1/... but Nitro expects /...
    const endpoint = normalizeEndpoint(choice.options_endpoint)
    const response = await apiFetch<{ data: Feat[] }>(endpoint)
    featOptions.value.set(choice.id, response.data)
  } catch (e) {
    logger.error(`Failed to fetch feat options for ${choice.id}:`, e)
  }
}

// Get available feats for a choice
function getAvailableFeats(choice: PendingChoice): Feat[] {
  // If options are provided inline, use them
  if (choice.options && Array.isArray(choice.options) && choice.options.length > 0) {
    return choice.options as Feat[]
  }
  // Otherwise, use fetched options
  return featOptions.value.get(choice.id) ?? []
}

// Fetch options for all feat choices when they load
watch(featChoices, async (newVal) => {
  for (const choice of newVal) {
    await fetchFeatOptionsForChoice(choice)

    // Initialize selected set from choice.selected (slugs from API)
    if (!selectedFeats.value.has(choice.id)) {
      const selected = new Set<string>()
      for (const featSlug of choice.selected) {
        // Ensure it's a string (slug)
        selected.add(String(featSlug))
      }
      selectedFeats.value.set(choice.id, selected)
    }
  }
}, { immediate: true })

// Get count of selected feats for a choice
function getSelectedCount(choiceId: string): number {
  return selectedFeats.value.get(choiceId)?.size ?? 0
}

// Check if a feat is selected in a choice (by full_slug)
function isFeatSelected(choiceId: string, featSlug: string): boolean {
  return selectedFeats.value.get(choiceId)?.has(featSlug) ?? false
}

// Check if a choice is at limit
function isChoiceAtLimit(choice: PendingChoice): boolean {
  return getSelectedCount(choice.id) >= choice.quantity
}

// Toggle feat selection for a choice (uses full_slug for API compatibility)
function handleFeatToggle(choice: PendingChoice, feat: Feat) {
  // Clone the Set to trigger Vue reactivity (mutating existing Set won't trigger updates)
  const selected = new Set(selectedFeats.value.get(choice.id) ?? [])
  const featSlug = feat.full_slug ?? feat.slug

  if (selected.has(featSlug)) {
    // Deselect
    selected.delete(featSlug)
  } else {
    // Don't allow selecting more than limit
    if (selected.size >= choice.quantity) return
    selected.add(featSlug)
  }

  selectedFeats.value.set(choice.id, selected)
}

// Validation: all requirements met?
const canProceed = computed(() => {
  // All required feat choices must be complete
  const requiredChoices = featChoices.value.filter(c => c.required)
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
 * Save feats and continue to next step
 */
async function handleContinue() {
  isSaving.value = true
  saveError.value = null

  try {
    // Resolve all feat choices
    for (const choice of featChoices.value) {
      const selected = selectedFeats.value.get(choice.id)
      if (selected && selected.size > 0) {
        await resolveChoice(choice.id, { selected: Array.from(selected) })
      }
    }

    // Sync store with backend to update hasFeatChoices flag
    await store.syncWithBackend()

    nextStep()
  } catch (e) {
    logger.error('Failed to save feat choices:', e)
    saveError.value = e instanceof Error ? e.message : 'Failed to save feat choices'
    toast.add({
      title: 'Failed to save feats',
      description: 'Please try again',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isSaving.value = false
  }
}

// Modal state for feat details
const detailModalOpen = ref(false)
const detailFeat = ref<Feat | null>(null)

/**
 * View feat details - open modal
 */
function handleViewDetails(feat: Feat) {
  detailFeat.value = feat
  detailModalOpen.value = true
}

/**
 * Close detail modal
 */
function handleCloseModal() {
  detailModalOpen.value = false
  detailFeat.value = null
}
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
          <CharacterPickerFeatPickerCard
            v-for="feat in getAvailableFeats(choice)"
            :key="feat.id"
            :feat="feat"
            :selected="isFeatSelected(choice.id, feat.full_slug ?? feat.slug)"
            :disabled="!isFeatSelected(choice.id, feat.full_slug ?? feat.slug) && isChoiceAtLimit(choice)"
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

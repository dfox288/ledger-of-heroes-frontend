<!-- app/components/character/wizard/StepSize.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { logger } from '~/utils/logger'

/**
 * Size option from pending-choices API
 */
interface SizeOption {
  id: number
  code: string
  name: string
}

const store = useCharacterWizardStore()
const { selections, isLoading, error, characterId } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// Unified choices composable
const {
  choicesByType,
  pending: choicesPending,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(characterId)

// Local state for selected size
const localSelectedSize = ref<SizeOption | null>(null)

// Get size choices from unified choices
const sizeChoices = computed(() => choicesByType.value.sizes)

// Get size options from the first size choice
const sizeOptions = computed((): SizeOption[] => {
  const choice = sizeChoices.value[0]
  if (!choice?.options) return []
  return choice.options as SizeOption[]
})

// Get the choice ID for resolving
const sizeChoiceId = computed(() => sizeChoices.value[0]?.id ?? null)

// Get currently selected size from choice (if already resolved)
const currentlySelected = computed(() => {
  const choice = sizeChoices.value[0]
  if (!choice?.selected || choice.selected.length === 0) return null
  // Find the option that matches the selected code
  const selectedCode = choice.selected[0]
  return sizeOptions.value.find(opt => opt.code === selectedCode) ?? null
})

// Get metadata note (e.g., "You are Small or Medium (your choice).")
// Note: metadata type in generated schema is unknown[] but actual API returns object
const choiceNote = computed(() => {
  const choice = sizeChoices.value[0]
  const metadata = choice?.metadata as { note?: string } | undefined
  return metadata?.note ?? null
})

// Validation: can proceed if size is selected
const canProceed = computed(() => localSelectedSize.value !== null)

// Combined loading state
const loading = computed(() => isLoading.value || choicesPending.value)

/**
 * Handle size selection
 */
function handleSizeSelect(size: SizeOption) {
  localSelectedSize.value = size
}

/**
 * Confirm selection and save via choices API
 */
async function confirmSelection() {
  if (!localSelectedSize.value || !sizeChoiceId.value) return

  try {
    await resolveChoice(sizeChoiceId.value, {
      selected: [localSelectedSize.value.code]
    })

    // Sync with backend to update character data
    await store.syncWithBackend()

    nextStep()
  } catch (err) {
    logger.error('Failed to save size selection:', err)
    toast.add({
      title: 'Save Failed',
      description: 'Unable to save your size selection. Please try again.',
      color: 'error'
    })
  }
}

// Fetch choices and initialize on mount
onMounted(async () => {
  await fetchChoices('size')

  // Initialize from existing selection if any
  if (currentlySelected.value) {
    localSelectedSize.value = currentlySelected.value
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Size
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ selections.race?.name ?? 'Your lineage' }} allows you to choose your size
      </p>
      <p
        v-if="choiceNote"
        class="mt-1 text-sm text-gray-500 dark:text-gray-500 italic"
      >
        "{{ choiceNote }}"
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
      v-if="loading && sizeOptions.length === 0"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-race-500"
      />
    </div>

    <!-- Size Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
    >
      <CharacterPickerSizePickerCard
        v-for="size in sizeOptions"
        :key="size.code"
        :size="size"
        :selected="localSelectedSize?.code === size.code"
        @select="handleSizeSelect"
      />
    </div>

    <!-- Info Alert -->
    <UAlert
      v-if="sizeOptions.length > 0"
      color="info"
      variant="subtle"
      icon="i-heroicons-information-circle"
      class="max-w-2xl mx-auto"
    >
      <template #title>
        Size Matters
      </template>
      <template #description>
        Your size affects carrying capacity, grappling, and fitting through tight spaces.
        Small creatures can move through spaces occupied by larger creatures.
      </template>
    </UAlert>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        size="lg"
        :disabled="!canProceed || loading"
        :loading="loading"
        @click="confirmSelection"
      >
        <template v-if="loading">
          Saving...
        </template>
        <template v-else>
          Continue as {{ localSelectedSize?.name ?? 'Selected Size' }}
        </template>
      </UButton>
    </div>
  </div>
</template>

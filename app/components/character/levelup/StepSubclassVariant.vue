<!-- app/components/character/levelup/StepSubclassVariant.vue -->
<script setup lang="ts">
/**
 * Level-Up Subclass Variant Choice Step
 *
 * Handles multi-level subclass feature choices during level-up.
 * For example, Totem Warrior Barbarian chooses different totems at L3, L6, and L14.
 * Each level allows choosing a different animal (Bear, Eagle, Wolf, etc.).
 *
 * Unlike the initial subclass choice (StepSubclassChoice), this step handles
 * the `subclass_variant` choice type which appears at specific levels after
 * subclass selection.
 *
 * Issue: #763
 */
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface VariantOption {
  value: string
  name: string
  description?: string
}

// ════════════════════════════════════════════════════════════════
// PROPS & COMPOSABLES
// ════════════════════════════════════════════════════════════════

const props = defineProps<{
  characterId: number
  publicId: string
  nextStep: () => void
  refreshAfterSave?: () => Promise<void>
}>()

const store = useCharacterLevelUpStore()
const toast = useToast()

// Fetch pending choices
const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => props.characterId))

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

const selectedValue = ref<string | undefined>(undefined)
const isSaving = ref(false)
const error = ref<string | null>(null)

// ════════════════════════════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════════════════════════════

// Get the first subclass_variant choice (handle one at a time, wizard will loop)
const variantChoice = computed(() => {
  const choices = choicesByType.value.subclassVariants
  return choices.length > 0 ? choices[0] : null
})

// Get options from the choice
const options = computed<VariantOption[]>(() => {
  if (!variantChoice.value?.options) return []
  return variantChoice.value.options as VariantOption[]
})

// Get display label from choice metadata or source name
const choiceLabel = computed(() => {
  if (!variantChoice.value) return 'Choose Feature'
  // Use source_name for display (e.g., "Path of the Totem Warrior")
  return variantChoice.value.source_name || 'Subclass Feature'
})

// Get the subtype for more specific header (e.g., "totem_aspect" -> "Totem Aspect")
const choiceSubtypeLabel = computed(() => {
  if (!variantChoice.value?.subtype) return null
  // Convert snake_case to Title Case
  return variantChoice.value.subtype
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

// Can proceed?
const canProceed = computed(() => {
  return selectedValue.value !== undefined
})

// ════════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════════

function handleSelect(value: string) {
  selectedValue.value = value
}

async function handleConfirm() {
  if (!selectedValue.value || !variantChoice.value) return

  isSaving.value = true
  error.value = null

  try {
    // Submit the choice
    await resolveChoice(variantChoice.value.id, {
      selected: [selectedValue.value]
    })

    // Refresh store's pending choices
    await store.fetchPendingChoices()

    // Call refreshAfterSave if provided
    if (props.refreshAfterSave) {
      await props.refreshAfterSave()
    }

    props.nextStep()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save selection'
    toast.add({
      title: 'Error',
      description: error.value,
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

// Fetch choices on mount
onMounted(() => {
  fetchChoices('subclass_variant')
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ choiceLabel }}
      </h2>
      <p
        v-if="choiceSubtypeLabel"
        class="mt-2 text-gray-600 dark:text-gray-400"
      >
        {{ choiceSubtypeLabel }}
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error || choicesError"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error || choicesError || undefined"
    />

    <!-- Loading State -->
    <div
      v-if="loadingChoices"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Options Grid -->
    <div
      v-else-if="options.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="p-4 rounded-lg border-2 text-left transition-all"
        :class="{
          'border-primary bg-primary-50 dark:bg-primary-900/20': selectedValue === option.value,
          'border-gray-200 dark:border-gray-700 hover:border-primary-300': selectedValue !== option.value
        }"
        @click="handleSelect(option.value)"
      >
        <div class="flex items-center gap-3">
          <!-- Selection indicator -->
          <UIcon
            v-if="selectedValue === option.value"
            name="i-heroicons-check-circle-solid"
            class="w-6 h-6 flex-shrink-0 text-primary"
          />
          <span
            v-else
            class="w-6 h-6 flex-shrink-0 rounded-full border-2 border-gray-400"
          />
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">
              {{ option.name }}
            </p>
            <p
              v-if="option.description"
              class="text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              {{ option.description }}
            </p>
          </div>
        </div>
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No choices available
      </p>
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-testid="continue-button"
        size="lg"
        :disabled="!canProceed || isSaving"
        :loading="isSaving"
        @click="handleConfirm"
      >
        {{ isSaving ? 'Saving...' : 'Continue' }}
      </UButton>
    </div>
  </div>
</template>

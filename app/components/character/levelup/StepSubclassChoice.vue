<!-- app/components/character/levelup/StepSubclassChoice.vue -->
<script setup lang="ts">
/**
 * Level-Up Subclass Choice Step
 *
 * Handles subclass selection during level-up (e.g., Fighter at level 3).
 * Supports variant_choices for subclasses like Circle of the Land (terrain).
 * Uses the same dedicated subclass endpoint as the creation wizard:
 * PUT /characters/{id}/classes/{classSlug}/subclass
 */
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface VariantOption {
  value: string
  name: string
  description?: string
  spells?: string[]
}

interface VariantChoice {
  required: boolean
  label: string
  options: VariantOption[]
}

interface SubclassOption {
  slug: string
  name: string
  description?: string
  features_preview?: string[]
  variant_choices?: Record<string, VariantChoice>
}

// ════════════════════════════════════════════════════════════════
// PROPS & COMPOSABLES
// ════════════════════════════════════════════════════════════════

const props = defineProps<{
  characterId: number
  nextStep: () => void
}>()

const store = useCharacterLevelUpStore()
const { apiFetch } = useApi()
const toast = useToast()

// Fetch pending choices to get subclass options
const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices
} = useUnifiedChoices(computed(() => props.characterId))

// Get the subclass choice (contains options and metadata)
const subclassChoice = computed(() => choicesByType.value.subclass)

// Get class slug from the choice metadata
const classSlug = computed(() => {
  const metadata = subclassChoice.value?.metadata as { class_slug?: string } | undefined
  return metadata?.class_slug
})

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

const selectedSubclass = ref<string | undefined>(undefined)
const selectedVariants = ref<Record<string, string>>({}) // e.g., { terrain: 'arctic' }
const isSaving = ref(false)
const error = ref<string | null>(null)

// ════════════════════════════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════════════════════════════

// Fetch subclass options from the choice
const { data: subclassOptions, pending: loadingOptions } = await useAsyncData(
  `levelup-subclass-options-${props.characterId}`,
  async () => {
    await fetchChoices('subclass')

    const choice = choicesByType.value.subclass
    if (!choice) return []

    // Options are inline in the choice
    if (choice.options && choice.options.length > 0) {
      return choice.options as SubclassOption[]
    }

    return []
  }
)

// Get the currently selected subclass option object
const selectedSubclassOption = computed<SubclassOption | undefined>(() => {
  if (!selectedSubclass.value || !subclassOptions.value) return undefined
  return subclassOptions.value.find(o => o.slug === selectedSubclass.value)
})

// Does the selected subclass have variant_choices?
const hasVariantChoices = computed(() => {
  return selectedSubclassOption.value?.variant_choices !== undefined
})

// Get the variant_choices from the selected subclass
const variantChoices = computed(() => {
  return selectedSubclassOption.value?.variant_choices
})

// Are all required variant choices made?
const allVariantsSelected = computed(() => {
  if (!variantChoices.value) return true

  for (const [key, choice] of Object.entries(variantChoices.value)) {
    if (choice.required && !selectedVariants.value[key]) {
      return false
    }
  }
  return true
})

// Get the selected variant option details (for showing spells, etc.)
const selectedVariantOption = computed<VariantOption | undefined>(() => {
  if (!variantChoices.value) return undefined

  // Get the first variant key (e.g., 'terrain')
  const variantKey = Object.keys(variantChoices.value)[0]
  if (!variantKey) return undefined

  const selectedValue = selectedVariants.value[variantKey]
  if (!selectedValue) return undefined

  return variantChoices.value[variantKey]?.options.find(o => o.value === selectedValue)
})

// Can proceed?
const canProceed = computed(() => {
  if (!selectedSubclass.value || !classSlug.value) return false
  if (hasVariantChoices.value && !allVariantsSelected.value) return false
  return true
})

// ════════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════════

function handleSubclassSelect(slug: string) {
  selectedSubclass.value = slug
  // Clear variant selections when switching subclass
  selectedVariants.value = {}
}

function handleVariantSelect(variantKey: string, value: string) {
  selectedVariants.value = {
    ...selectedVariants.value,
    [variantKey]: value
  }
}

async function handleConfirm() {
  if (!selectedSubclass.value || !classSlug.value) return

  isSaving.value = true
  error.value = null

  try {
    // Build request body
    const body: { subclass_slug: string, variant_choices?: Record<string, string> } = {
      subclass_slug: selectedSubclass.value
    }

    // Include variant_choices if the subclass has them and they're selected
    if (hasVariantChoices.value && Object.keys(selectedVariants.value).length > 0) {
      body.variant_choices = selectedVariants.value
    }

    // Use the same endpoint as the creation wizard
    // PUT /characters/{id}/classes/{classSlug}/subclass
    await apiFetch(
      `/characters/${props.characterId}/classes/${classSlug.value}/subclass`,
      { method: 'PUT', body }
    )

    // Refresh choices to update store state
    await store.fetchPendingChoices()

    props.nextStep()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save subclass selection'
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
  fetchChoices('subclass')
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Subclass
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select your specialization path
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
      v-if="loadingChoices || loadingOptions"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Subclass Grid -->
    <div
      v-else-if="subclassOptions && subclassOptions.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <button
        v-for="option in subclassOptions"
        :key="option.slug"
        type="button"
        class="p-4 rounded-lg border-2 text-left transition-all"
        :class="{
          'border-primary bg-primary-50 dark:bg-primary-900/20': selectedSubclass === option.slug,
          'border-gray-200 dark:border-gray-700 hover:border-primary-300': selectedSubclass !== option.slug
        }"
        @click="handleSubclassSelect(option.slug)"
      >
        <div class="flex items-center gap-3">
          <!-- Selection indicator -->
          <UIcon
            v-if="selectedSubclass === option.slug"
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
              class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
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
        No subclass options available
      </p>
    </div>

    <!-- Variant Choices Section (e.g., Terrain for Circle of the Land) -->
    <template v-if="hasVariantChoices && variantChoices">
      <div
        v-for="(choice, variantKey) in variantChoices"
        :key="variantKey"
        class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <!-- Variant Choice Header -->
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ choice.label }}
          </h3>
        </div>

        <!-- Variant Options Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            v-for="variantOption in choice.options"
            :key="variantOption.value"
            type="button"
            class="p-3 rounded-lg border-2 text-left transition-all"
            :class="{
              'border-primary bg-primary-50 dark:bg-primary-900/20': selectedVariants[variantKey] === variantOption.value,
              'border-gray-200 dark:border-gray-700 hover:border-primary-300': selectedVariants[variantKey] !== variantOption.value
            }"
            @click="handleVariantSelect(variantKey, variantOption.value)"
          >
            <div class="flex items-center gap-2">
              <UIcon
                v-if="selectedVariants[variantKey] === variantOption.value"
                name="i-heroicons-check-circle-solid"
                class="w-5 h-5 flex-shrink-0 text-primary"
              />
              <span
                v-else
                class="w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-400"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ variantOption.name }}
                </p>
                <p
                  v-if="variantOption.description"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ variantOption.description }}
                </p>
              </div>
            </div>
          </button>
        </div>

        <!-- Show spells for selected terrain -->
        <div
          v-if="selectedVariantOption?.spells && selectedVariantOption.spells.length > 0"
          class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
        >
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Circle Spells:
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="spell in selectedVariantOption.spells"
              :key="spell"
              class="px-2 py-1 bg-white dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            >
              {{ spell }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
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

<!-- app/components/character/levelup/StepSubclassChoice.vue -->
<script setup lang="ts">
/**
 * Level-Up Subclass Choice Step
 *
 * Handles subclass selection during level-up (e.g., Fighter at level 3).
 * Uses the same dedicated subclass endpoint as the creation wizard:
 * PUT /characters/{id}/classes/{classSlug}/subclass
 */
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

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
const classSlug = computed(() => subclassChoice.value?.metadata?.class_slug as string | undefined)

// Local state
const selectedSubclass = ref<string | null>(null)
const isSaving = ref(false)
const error = ref<string | null>(null)

// Fetch subclass options from the choice
const { data: subclassOptions, pending: loadingOptions } = await useAsyncData(
  `levelup-subclass-options-${props.characterId}`,
  async () => {
    await fetchChoices('subclass')

    const choice = choicesByType.value.subclass
    if (!choice) return []

    // Options are inline in the choice
    if (choice.options && choice.options.length > 0) {
      return choice.options
    }

    return []
  }
)

// Can proceed?
const canProceed = computed(() => !!selectedSubclass.value && !!classSlug.value)

async function handleConfirm() {
  if (!selectedSubclass.value || !classSlug.value) return

  isSaving.value = true
  error.value = null

  try {
    // Use the same endpoint as the creation wizard
    // PUT /characters/{id}/classes/{classSlug}/subclass
    await apiFetch(
      `/characters/${props.characterId}/classes/${classSlug.value}/subclass`,
      {
        method: 'PUT',
        body: { subclass_slug: selectedSubclass.value }
      }
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
      :title="error || choicesError"
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
        :key="option.full_slug || option.slug"
        type="button"
        class="p-4 rounded-lg border-2 text-left transition-all"
        :class="{
          'border-primary bg-primary-50 dark:bg-primary-900/20': selectedSubclass === (option.full_slug || option.slug),
          'border-gray-200 dark:border-gray-700 hover:border-primary-300': selectedSubclass !== (option.full_slug || option.slug)
        }"
        @click="selectedSubclass = option.full_slug || option.slug"
      >
        <div class="flex items-center gap-3">
          <UIcon
            :name="selectedSubclass === (option.full_slug || option.slug) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
            class="w-6 h-6 flex-shrink-0"
            :class="{
              'text-primary': selectedSubclass === (option.full_slug || option.slug),
              'text-gray-400': selectedSubclass !== (option.full_slug || option.slug)
            }"
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

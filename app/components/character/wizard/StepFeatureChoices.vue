<!-- app/components/character/wizard/StepFeatureChoices.vue -->
<script setup lang="ts">
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'
import { wizardErrors } from '~/utils/wizardErrors'

// Props for store-agnostic usage (enables use in both creation and level-up wizards)
const props = withDefaults(defineProps<{
  characterId?: number
  nextStep?: () => void
  refreshAfterSave?: () => Promise<void>
}>(), {
  characterId: undefined,
  nextStep: undefined,
  refreshAfterSave: undefined
})

// Fallback to store if props not provided (backward compatibility)
const store = useCharacterWizardStore()
const wizardNav = useCharacterWizard()

// Use prop or store value
const effectiveCharacterId = computed(() => props.characterId ?? store.characterId)
const effectiveNextStep = computed(() => props.nextStep ?? wizardNav.nextStep)

const toast = useToast()

// Fetch choices for this character
const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(effectiveCharacterId)

// Feature choice categories
const fightingStyleChoices = computed(() => choicesByType.value.fightingStyles ?? [])
const expertiseChoices = computed(() => choicesByType.value.expertise ?? [])
// Filter out optional_feature choices with subtype "fighting_style" - those are duplicates
// of the dedicated fighting_style type choices shown in the Fighting Style section
const optionalFeatureChoices = computed(() =>
  (choicesByType.value.optionalFeatures ?? []).filter(c => c.subtype !== 'fighting_style')
)

// Combined: any feature choices exist?
const hasAnyChoices = computed(() =>
  fightingStyleChoices.value.length > 0
  || expertiseChoices.value.length > 0
  || optionalFeatureChoices.value.length > 0
)

// Use choice selection composable for all feature choices
const {
  getSelectedCount,
  isOptionSelected,
  isOptionDisabled,
  getDisabledReason,
  handleToggle: handleOptionToggle,
  getDisplayOptions,
  fetchOptionsIfNeeded,
  isOptionsLoading,
  allComplete,
  saveAllChoices,
  isSaving
} = useWizardChoiceSelection(
  computed(() => [
    ...fightingStyleChoices.value,
    ...expertiseChoices.value,
    ...optionalFeatureChoices.value
  ]),
  { resolveChoice }
)

// Fetch on mount - fetch all choices (they get filtered by choicesByType)
onMounted(async () => {
  await fetchChoices()
})

// Load options when choices change
watch([fightingStyleChoices, expertiseChoices, optionalFeatureChoices], async () => {
  const allChoices = [
    ...fightingStyleChoices.value,
    ...expertiseChoices.value,
    ...optionalFeatureChoices.value
  ]
  for (const choice of allChoices) {
    await fetchOptionsIfNeeded(choice)
  }
}, { immediate: true })

// Continue handler
async function handleContinue() {
  if (!allComplete.value) return

  try {
    await saveAllChoices()

    // Refresh choices if callback provided (level-up context)
    if (props.refreshAfterSave) {
      await props.refreshAfterSave()
    }

    effectiveNextStep.value()
  } catch (e) {
    wizardErrors.choiceResolveFailed(e, toast, 'feature')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Feature Choices
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select your class features
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="choicesError"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="choicesError"
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

    <!-- Empty State -->
    <div
      v-else-if="!hasAnyChoices"
      class="text-center py-12"
    >
      <p class="text-gray-600 dark:text-gray-400">
        No feature choices available.
      </p>
    </div>

    <!-- Fighting Style Section -->
    <section
      v-if="fightingStyleChoices.length > 0"
      data-testid="fighting-style-section"
      class="space-y-4"
    >
      <div
        v-for="choice in fightingStyleChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Fighting Style ({{ choice.source_name }})
          </h3>
          <UBadge
            :color="getSelectedCount(choice.id) >= choice.quantity ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ getSelectedCount(choice.id) }} of {{ choice.quantity }}
          </UBadge>
        </div>

        <div
          v-if="isOptionsLoading(choice)"
          class="flex items-center gap-2 p-4 text-gray-500"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-5 h-5 animate-spin"
          />
          <span>Loading options...</span>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <button
            v-for="option in getDisplayOptions(choice)"
            :key="option.id"
            :data-testid="`fighting-style-option-${option.id}`"
            type="button"
            class="p-4 rounded-lg border text-left transition-all"
            :class="{
              'border-primary bg-primary/10': isOptionSelected(choice.id, option.id),
              'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isOptionSelected(choice.id, option.id) && !isOptionDisabled(choice.id, option.id),
              'opacity-50 cursor-not-allowed': isOptionDisabled(choice.id, option.id)
            }"
            :disabled="isOptionDisabled(choice.id, option.id)"
            @click="handleOptionToggle(choice, option.id)"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="isOptionSelected(choice.id, option.id) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
                class="w-6 h-6 flex-shrink-0"
                :class="{
                  'text-primary': isOptionSelected(choice.id, option.id),
                  'text-gray-400': !isOptionSelected(choice.id, option.id)
                }"
              />
              <div>
                <p class="font-semibold">
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
      </div>
    </section>

    <!-- Expertise Section -->
    <section
      v-if="expertiseChoices.length > 0"
      data-testid="expertise-section"
      class="space-y-4"
    >
      <div
        v-for="choice in expertiseChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Expertise ({{ choice.source_name }})
          </h3>
          <UBadge
            :color="getSelectedCount(choice.id) >= choice.quantity ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ getSelectedCount(choice.id) }} of {{ choice.quantity }}
          </UBadge>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Choose skills to gain expertise in. Your proficiency bonus is doubled for these skills.
        </p>

        <div
          v-if="isOptionsLoading(choice)"
          class="flex items-center gap-2 p-4 text-gray-500"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-5 h-5 animate-spin"
          />
          <span>Loading options...</span>
        </div>

        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <button
            v-for="option in getDisplayOptions(choice)"
            :key="option.id"
            :data-testid="`expertise-option-${option.id}`"
            type="button"
            class="p-3 rounded-lg border text-left transition-all"
            :class="{
              'border-primary bg-primary/10': isOptionSelected(choice.id, option.id),
              'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isOptionSelected(choice.id, option.id) && !isOptionDisabled(choice.id, option.id),
              'opacity-50 cursor-not-allowed': isOptionDisabled(choice.id, option.id)
            }"
            :disabled="isOptionDisabled(choice.id, option.id)"
            @click="handleOptionToggle(choice, option.id)"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="isOptionSelected(choice.id, option.id) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
                class="w-5 h-5 flex-shrink-0"
                :class="{
                  'text-primary': isOptionSelected(choice.id, option.id),
                  'text-gray-400': !isOptionSelected(choice.id, option.id)
                }"
              />
              <span class="font-medium">{{ option.name }}</span>
            </div>
            <p
              v-if="getDisabledReason(choice.id, option.id)"
              class="text-xs text-gray-400 mt-1 ml-7"
            >
              {{ getDisabledReason(choice.id, option.id) }}
            </p>
          </button>
        </div>
      </div>
    </section>

    <!-- Optional Features Section (Invocations, Metamagic, etc.) -->
    <section
      v-if="optionalFeatureChoices.length > 0"
      data-testid="optional-features-section"
      class="space-y-4"
    >
      <div
        v-for="choice in optionalFeatureChoices"
        :key="choice.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ choice.source_name }}
          </h3>
          <UBadge
            :color="getSelectedCount(choice.id) >= choice.quantity ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ getSelectedCount(choice.id) }} of {{ choice.quantity }}
          </UBadge>
        </div>

        <div
          v-if="isOptionsLoading(choice)"
          class="flex items-center gap-2 p-4 text-gray-500"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-5 h-5 animate-spin"
          />
          <span>Loading options...</span>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <button
            v-for="option in getDisplayOptions(choice)"
            :key="option.id"
            :data-testid="`optional-feature-option-${option.id}`"
            type="button"
            class="p-4 rounded-lg border text-left transition-all"
            :class="{
              'border-primary bg-primary/10': isOptionSelected(choice.id, option.id),
              'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isOptionSelected(choice.id, option.id) && !isOptionDisabled(choice.id, option.id),
              'opacity-50 cursor-not-allowed': isOptionDisabled(choice.id, option.id)
            }"
            :disabled="isOptionDisabled(choice.id, option.id)"
            @click="handleOptionToggle(choice, option.id)"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="isOptionSelected(choice.id, option.id) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
                class="w-6 h-6 flex-shrink-0"
                :class="{
                  'text-primary': isOptionSelected(choice.id, option.id),
                  'text-gray-400': !isOptionSelected(choice.id, option.id)
                }"
              />
              <div>
                <p class="font-semibold">
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
      </div>
    </section>

    <!-- Continue Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-testid="continue-btn"
        size="lg"
        :disabled="!allComplete || loadingChoices || isSaving"
        :loading="loadingChoices || isSaving"
        @click="handleContinue"
      >
        {{ hasAnyChoices ? 'Continue with Features' : 'Continue' }}
      </UButton>
    </div>
  </div>
</template>

<!-- app/components/character/wizard/StepFeatureChoices.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

const props = defineProps<{
  characterId: number
  nextStep: () => void
}>()

const toast = useToast()

// Fetch choices for this character
const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => props.characterId))

// Feature choice categories
const fightingStyleChoices = computed(() => choicesByType.value.fightingStyles ?? [])
const expertiseChoices = computed(() => choicesByType.value.expertise ?? [])
const optionalFeatureChoices = computed(() => choicesByType.value.optionalFeatures ?? [])

// Combined: any feature choices exist?
const hasAnyChoices = computed(() =>
  fightingStyleChoices.value.length > 0
  || expertiseChoices.value.length > 0
  || optionalFeatureChoices.value.length > 0
)

// Fetch on mount
onMounted(async () => {
  await fetchChoices(['fighting_style', 'expertise', 'optional_feature'])
})

// Continue handler
async function handleContinue() {
  props.nextStep()
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

    <!-- Continue Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-testid="continue-btn"
        size="lg"
        :loading="loadingChoices"
        @click="handleContinue"
      >
        Continue
      </UButton>
    </div>
  </div>
</template>

<!-- app/pages/characters/create.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

/**
 * Character Creation Wizard Page
 *
 * Multi-step wizard for creating D&D 5e characters.
 * Uses UStepper for navigation and Pinia store for state.
 */

// Page metadata
useSeoMeta({
  title: 'Create Your Character',
  description: 'Build your D&D 5e character step by step'
})

// Store
const store = useCharacterBuilderStore()
const { currentStep, isFirstStep, isLastStep, isCaster } = storeToRefs(store)

// Step definitions
const steps = computed(() => {
  const baseSteps = [
    { id: 1, name: 'name', label: 'Name', icon: 'i-heroicons-user' },
    { id: 2, name: 'race', label: 'Race', icon: 'i-heroicons-globe-alt' },
    { id: 3, name: 'class', label: 'Class', icon: 'i-heroicons-shield-check' },
    { id: 4, name: 'abilities', label: 'Abilities', icon: 'i-heroicons-chart-bar' },
    { id: 5, name: 'background', label: 'Background', icon: 'i-heroicons-book-open' }
  ]

  if (isCaster.value) {
    baseSteps.push({ id: 6, name: 'spells', label: 'Spells', icon: 'i-heroicons-sparkles' })
  }

  baseSteps.push({
    id: isCaster.value ? 7 : 6,
    name: 'review',
    label: 'Review',
    icon: 'i-heroicons-check-circle'
  })

  return baseSteps
})

// Reset wizard when leaving page
onBeforeUnmount(() => {
  // Only reset if character wasn't completed
  if (!store.isComplete) {
    // Optionally prompt user about unsaved progress
    // For now, just leave state (they might come back)
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Page Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Create Your Character
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Build your hero step by step
      </p>
    </div>

    <!-- Stepper Navigation -->
    <CharacterBuilderStepper
      :steps="steps"
      :current-step="currentStep"
      class="mb-8"
    />

    <!-- Step Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <!-- Step 1: Name -->
      <CharacterBuilderStepName v-if="currentStep === 1" />

      <!-- Step 2: Race -->
      <CharacterBuilderStepRace v-else-if="currentStep === 2" />

      <!-- Step 3: Class -->
      <CharacterBuilderStepClass v-else-if="currentStep === 3" />

      <!-- Step 4: Abilities -->
      <CharacterBuilderStepAbilities v-else-if="currentStep === 4" />

      <!-- Step 5: Background -->
      <CharacterBuilderStepBackground v-else-if="currentStep === 5" />

      <!-- Step 6: Spells (conditional) or Review -->
      <template v-else-if="currentStep === 6">
        <CharacterBuilderStepSpells v-if="isCaster" />
        <CharacterBuilderStepReview v-else />
      </template>

      <!-- Step 7: Review (for casters) -->
      <CharacterBuilderStepReview v-else-if="currentStep === 7" />
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <UButton
        v-if="!isFirstStep"
        variant="outline"
        icon="i-heroicons-arrow-left"
        @click="store.previousStep()"
      >
        Back
      </UButton>
      <div v-else />

      <UButton
        v-if="!isLastStep"
        icon="i-heroicons-arrow-right"
        trailing
        @click="store.nextStep()"
      >
        Next
      </UButton>
    </div>
  </div>
</template>

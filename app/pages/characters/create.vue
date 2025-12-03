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

// Reset to step 1 if navigating here without an active character (issue #97)
// This handles the case where step state persisted from a previous session
onMounted(() => {
  if (!store.characterId) {
    store.goToStep(1)
  }
})

// Step definitions
// Non-caster: Name → Race → Class → Abilities → Background → Equipment → Review (7 steps)
// Caster: Name → Race → Class → Abilities → Background → Equipment → Spells → Review (8 steps)
const steps = computed(() => {
  const baseSteps = [
    { id: 1, name: 'name', label: 'Name', icon: 'i-heroicons-user' },
    { id: 2, name: 'race', label: 'Race', icon: 'i-heroicons-globe-alt' },
    { id: 3, name: 'class', label: 'Class', icon: 'i-heroicons-shield-check' },
    { id: 4, name: 'abilities', label: 'Abilities', icon: 'i-heroicons-chart-bar' },
    { id: 5, name: 'background', label: 'Background', icon: 'i-heroicons-book-open' },
    { id: 6, name: 'equipment', label: 'Equipment', icon: 'i-heroicons-briefcase' }
  ]

  if (isCaster.value) {
    baseSteps.push({ id: 7, name: 'spells', label: 'Spells', icon: 'i-heroicons-sparkles' })
  }

  baseSteps.push({
    id: isCaster.value ? 8 : 7,
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

      <!-- Step 6: Equipment -->
      <CharacterBuilderStepEquipment v-else-if="currentStep === 6" />

      <!-- Step 7: Spells (caster) or Review (non-caster) -->
      <template v-else-if="currentStep === 7">
        <CharacterBuilderStepSpells v-if="isCaster" />
        <CharacterBuilderStepReview v-else />
      </template>

      <!-- Step 8: Review (for casters) -->
      <CharacterBuilderStepReview v-else-if="currentStep === 8" />
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

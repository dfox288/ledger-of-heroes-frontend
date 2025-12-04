<!-- app/pages/characters/[id]/edit.vue -->
<!--
  This page is now a layout wrapper for the wizard steps.
  Each step is a nested route under /characters/[id]/edit/[step].
  The <NuxtPage /> component renders the current step based on the URL.
-->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'
import { useWizardNavigation } from '~/composables/useWizardSteps'

const route = useRoute()
const characterId = computed(() => Number(route.params.id))
const isNewCharacter = computed(() => route.query.new === 'true')

// Page metadata
useSeoMeta({
  title: 'Edit Character',
  description: 'Continue building your D&D 5e character'
})

// Store
const store = useCharacterBuilderStore()
const { isLoading, error, name } = storeToRefs(store)

// Wizard navigation (uses route path, not store state)
const {
  activeSteps,
  currentStep,
  currentStepIndex,
  currentStepName,
  isFirstStep,
  isLastStep,
  nextStep,
  previousStep,
  goToStep
} = useWizardNavigation()

// Load character on mount
onMounted(async () => {
  store.reset()

  try {
    await store.loadCharacterForEditing(characterId.value)

    // For new characters, redirect to name step if not already there
    if (isNewCharacter.value && currentStepName.value !== 'name') {
      await navigateTo(`/characters/${characterId.value}/edit/name`)
    }
  } catch {
    await navigateTo(`/characters/${characterId.value}`)
  }
})

// Handle progress bar step click
function handleStepClick(stepName: string) {
  goToStep(stepName)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
      <span class="ml-3 text-gray-600 dark:text-gray-400">Loading character...</span>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      :title="error"
      class="mb-6"
    />

    <!-- Wizard Content -->
    <template v-else>
      <!-- Page Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Character
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ name || 'Continue building your hero' }}
        </p>
      </div>

      <!-- Compact Progress Bar -->
      <CharacterBuilderProgressBar
        :steps="activeSteps"
        :current-index="currentStepIndex"
        :current-label="currentStep?.label ?? ''"
        class="mb-8"
        @step-click="handleStepClick"
      />

      <!-- Step Content (nested route) -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <NuxtPage />
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-6">
        <UButton
          v-if="!isFirstStep"
          variant="outline"
          icon="i-heroicons-arrow-left"
          @click="previousStep()"
        >
          Back
        </UButton>
        <div v-else />

        <UButton
          v-if="!isLastStep"
          icon="i-heroicons-arrow-right"
          trailing
          @click="nextStep()"
        >
          Next
        </UButton>
      </div>
    </template>
  </div>
</template>

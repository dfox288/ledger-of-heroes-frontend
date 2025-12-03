<!-- app/pages/characters/[id]/edit.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

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
const { currentStep, isFirstStep, isLastStep, isCaster, isLoading, error, name } = storeToRefs(store)

// Load character on mount
onMounted(async () => {
  store.reset()

  try {
    await store.loadCharacterForEditing(characterId.value)

    // For new characters, always start at step 1 (Name)
    // This allows users to replace the placeholder "New Character" name
    if (isNewCharacter.value) {
      store.goToStep(1)
    }
  } catch {
    await navigateTo(`/characters/${characterId.value}`)
  }
})

// Step definitions
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
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Character
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ name || 'Continue building your hero' }}
        </p>
      </div>

      <!-- Stepper Navigation -->
      <CharacterBuilderStepper
        :steps="steps"
        :current-step="currentStep"
        class="mb-8"
        @step-click="store.goToStep"
      />

      <!-- Step Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <!--
          Each step is wrapped in its own Suspense boundary because several step
          components use top-level await (useAsyncData). Without Suspense, Vue
          resolves all async components in the v-if chain simultaneously, causing
          all steps to render at once.
        -->
        <Suspense v-if="currentStep === 1">
          <CharacterBuilderStepName />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStep === 2">
          <CharacterBuilderStepRace />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStep === 3">
          <CharacterBuilderStepClass />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStep === 4">
          <CharacterBuilderStepAbilities />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStep === 5">
          <CharacterBuilderStepBackground />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStep === 6">
          <CharacterBuilderStepEquipment />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <template v-else-if="currentStep === 7">
          <Suspense v-if="isCaster">
            <CharacterBuilderStepSpells />
            <template #fallback>
              <div class="flex justify-center py-12">
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="w-8 h-8 animate-spin text-primary"
                />
              </div>
            </template>
          </Suspense>
          <CharacterBuilderStepReview v-else />
        </template>

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
    </template>
  </div>
</template>

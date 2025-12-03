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
const { currentStep, isFirstStep, isLastStep, isCaster, hasSubraces, hasPendingChoices, isLoading, error, name } = storeToRefs(store)

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

// Step definitions - dynamically built based on character state
const steps = computed(() => {
  const stepList: Array<{ id: number, name: string, label: string, icon: string }> = [
    { id: 1, name: 'name', label: 'Name', icon: 'i-heroicons-user' },
    { id: 2, name: 'race', label: 'Race', icon: 'i-heroicons-globe-alt' }
  ]

  let nextId = 3

  // Conditional subrace step (only when selected race has subraces)
  if (hasSubraces.value) {
    stepList.push({ id: nextId++, name: 'subrace', label: 'Subrace', icon: 'i-heroicons-globe-americas' })
  }

  // Core steps
  stepList.push(
    { id: nextId++, name: 'class', label: 'Class', icon: 'i-heroicons-shield-check' },
    { id: nextId++, name: 'abilities', label: 'Abilities', icon: 'i-heroicons-chart-bar' },
    { id: nextId++, name: 'background', label: 'Background', icon: 'i-heroicons-book-open' }
  )

  // Conditional proficiency choices step (after background)
  if (hasPendingChoices.value) {
    stepList.push({ id: nextId++, name: 'proficiencies', label: 'Proficiencies', icon: 'i-heroicons-academic-cap' })
  }

  // Equipment step (always present)
  stepList.push({ id: nextId++, name: 'equipment', label: 'Equipment', icon: 'i-heroicons-briefcase' })

  // Conditional spells step (casters only)
  if (isCaster.value) {
    stepList.push({ id: nextId++, name: 'spells', label: 'Spells', icon: 'i-heroicons-sparkles' })
  }

  // Review step (always last)
  stepList.push({ id: nextId, name: 'review', label: 'Review', icon: 'i-heroicons-check-circle' })

  return stepList
})

// Helper to get step name by current step number
const currentStepName = computed(() => {
  const step = steps.value.find(s => s.id === currentStep.value)
  return step?.name ?? 'unknown'
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

          Steps are rendered by name (not number) to handle conditional steps
          like Proficiencies (appears only when choices exist) and Spells (casters only).
        -->
        <Suspense v-if="currentStepName === 'name'">
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

        <Suspense v-else-if="currentStepName === 'race'">
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

        <Suspense v-else-if="currentStepName === 'subrace'">
          <CharacterBuilderStepSubrace />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStepName === 'class'">
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

        <Suspense v-else-if="currentStepName === 'abilities'">
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

        <Suspense v-else-if="currentStepName === 'background'">
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

        <Suspense v-else-if="currentStepName === 'proficiencies'">
          <CharacterBuilderStepProficiencies />
          <template #fallback>
            <div class="flex justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>

        <Suspense v-else-if="currentStepName === 'equipment'">
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

        <Suspense v-else-if="currentStepName === 'spells'">
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

        <CharacterBuilderStepReview v-else-if="currentStepName === 'review'" />
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

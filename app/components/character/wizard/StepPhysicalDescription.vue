<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { wizardErrors } from '~/utils/wizardErrors'

/**
 * Step: Physical Description
 *
 * Optional step for entering character physical attributes:
 * - Appearance: age, height, weight
 * - Features: eye color, hair color, skin color
 * - Faith: deity
 *
 * All fields are optional. User can skip this step entirely.
 */

const store = useCharacterWizardStore()
const { isLoading, error } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// Local refs that sync with store
const age = computed({
  get: () => store.selections.physicalDescription.age || '',
  set: (value: string) => {
    store.selections.physicalDescription.age = value?.trim() || null
  }
})

const height = computed({
  get: () => store.selections.physicalDescription.height || '',
  set: (value: string) => {
    store.selections.physicalDescription.height = value?.trim() || null
  }
})

const weight = computed({
  get: () => store.selections.physicalDescription.weight || '',
  set: (value: string) => {
    store.selections.physicalDescription.weight = value?.trim() || null
  }
})

const eyeColor = computed({
  get: () => store.selections.physicalDescription.eye_color || '',
  set: (value: string) => {
    store.selections.physicalDescription.eye_color = value?.trim() || null
  }
})

const hairColor = computed({
  get: () => store.selections.physicalDescription.hair_color || '',
  set: (value: string) => {
    store.selections.physicalDescription.hair_color = value?.trim() || null
  }
})

const skinColor = computed({
  get: () => store.selections.physicalDescription.skin_color || '',
  set: (value: string) => {
    store.selections.physicalDescription.skin_color = value?.trim() || null
  }
})

const deity = computed({
  get: () => store.selections.physicalDescription.deity || '',
  set: (value: string) => {
    store.selections.physicalDescription.deity = value?.trim() || null
  }
})

/**
 * Check if any physical description has been entered
 */
const hasAnyData = computed(() => {
  const pd = store.selections.physicalDescription
  return pd.age || pd.height || pd.weight
    || pd.eye_color || pd.hair_color || pd.skin_color
    || pd.deity
})

/**
 * Save physical description and continue to next step
 */
async function handleContinue() {
  // Only save if there's data to save
  if (hasAnyData.value) {
    try {
      await store.savePhysicalDescription(store.selections.physicalDescription)
    } catch (err) {
      wizardErrors.saveFailed(err, toast)
      return
    }
  }
  await nextStep()
}

/**
 * Skip this step without saving
 */
async function handleSkip() {
  await nextStep()
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Physical Description
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Describe your character's appearance (optional)
      </p>
    </div>

    <!-- Appearance Section -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Appearance
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Age -->
        <UFormField
          label="Age"
          help="e.g., 25, Unknown, Ageless"
        >
          <UInput
            v-model="age"
            data-testid="age-input"
            type="text"
            placeholder="25"
            maxlength="50"
          />
        </UFormField>

        <!-- Height -->
        <UFormField
          label="Height"
          help="e.g., 5'10&quot;, 178cm"
        >
          <UInput
            v-model="height"
            data-testid="height-input"
            type="text"
            placeholder="5'10&quot;"
            maxlength="50"
          />
        </UFormField>

        <!-- Weight -->
        <UFormField
          label="Weight"
          help="e.g., 180 lbs, 82 kg"
        >
          <UInput
            v-model="weight"
            data-testid="weight-input"
            type="text"
            placeholder="180 lbs"
            maxlength="50"
          />
        </UFormField>
      </div>
    </div>

    <!-- Features Section -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Features
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Eye Color -->
        <UFormField label="Eye Color">
          <UInput
            v-model="eyeColor"
            data-testid="eye-color-input"
            type="text"
            placeholder="Blue"
            maxlength="50"
          />
        </UFormField>

        <!-- Hair Color -->
        <UFormField
          label="Hair Color"
          help="Hair, fur, or scales"
        >
          <UInput
            v-model="hairColor"
            data-testid="hair-color-input"
            type="text"
            placeholder="Brown"
            maxlength="50"
          />
        </UFormField>

        <!-- Skin Color -->
        <UFormField
          label="Skin Color"
          help="Skin, scales, or hide"
        >
          <UInput
            v-model="skinColor"
            data-testid="skin-color-input"
            type="text"
            placeholder="Fair"
            maxlength="50"
          />
        </UFormField>
      </div>
    </div>

    <!-- Faith Section -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Faith
      </h3>
      <UFormField
        label="Deity"
        help="Religious affiliation (optional)"
      >
        <UInput
          v-model="deity"
          data-testid="deity-input"
          type="text"
          placeholder="Pelor, None, Unknown"
          maxlength="150"
        />
      </UFormField>
    </div>

    <!-- Info Text -->
    <div class="text-sm text-gray-600 dark:text-gray-400 text-center">
      <p>
        These details help bring your character to life during roleplay.
        All fields are optional and can be edited later.
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
    />

    <!-- Navigation Buttons -->
    <div class="flex justify-center gap-4 pt-6">
      <UButton
        data-testid="skip-btn"
        size="lg"
        color="neutral"
        variant="ghost"
        :disabled="isLoading"
        @click="handleSkip"
      >
        Skip
      </UButton>
      <UButton
        data-testid="continue-btn"
        size="lg"
        :loading="isLoading"
        @click="handleContinue"
      >
        Continue to Review
      </UButton>
    </div>
  </div>
</template>

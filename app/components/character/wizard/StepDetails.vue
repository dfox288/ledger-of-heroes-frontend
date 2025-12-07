<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import type { CharacterAlignment } from '~/types/character'

/**
 * Step: Character Details
 *
 * Allows user to enter character name and select alignment.
 * This step comes near the end of the wizard, after major choices are made.
 */

const store = useCharacterWizardStore()
const { isLoading, error } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// Create local refs that sync with store
const name = computed({
  get: () => store.selections.name,
  set: (value: string) => {
    store.selections.name = value
  }
})

const alignment = computed({
  get: () => store.selections.alignment,
  set: (value: CharacterAlignment | null) => {
    store.selections.alignment = value
  }
})

// Validation: name is required
const canProceed = computed(() => {
  return name.value.trim().length > 0
})

/**
 * Save details and continue to next step
 */
async function handleContinue() {
  if (!canProceed.value) return

  try {
    await store.saveDetails(name.value, alignment.value)
    await nextStep()
  } catch (err) {
    console.error('Failed to save details:', err)
    toast.add({
      title: 'Save Failed',
      description: 'Unable to save your selection. Please try again.',
      color: 'error'
    })
  }
}

// Standard D&D 5e alignments
const alignmentOptions = [
  {
    value: null,
    label: 'Select alignment (optional)',
    description: 'Choose an alignment for your character'
  },
  {
    value: 'Lawful Good' as CharacterAlignment,
    label: 'Lawful Good',
    description: 'Creatures that act with compassion and honor within a set of rules'
  },
  {
    value: 'Neutral Good' as CharacterAlignment,
    label: 'Neutral Good',
    description: 'Folk who do the best they can to help others according to their needs'
  },
  {
    value: 'Chaotic Good' as CharacterAlignment,
    label: 'Chaotic Good',
    description: 'Creatures that act as their conscience directs with little regard for rules'
  },
  {
    value: 'Lawful Neutral' as CharacterAlignment,
    label: 'Lawful Neutral',
    description: 'Individuals who act in accordance with law, tradition, or personal codes'
  },
  {
    value: 'True Neutral' as CharacterAlignment,
    label: 'True Neutral',
    description: 'Those who prefer to steer clear of moral questions and take a balanced approach'
  },
  {
    value: 'Chaotic Neutral' as CharacterAlignment,
    label: 'Chaotic Neutral',
    description: 'Creatures that follow their whims, holding their personal freedom above all'
  },
  {
    value: 'Lawful Evil' as CharacterAlignment,
    label: 'Lawful Evil',
    description: 'Creatures that methodically take what they want within the bounds of rules'
  },
  {
    value: 'Neutral Evil' as CharacterAlignment,
    label: 'Neutral Evil',
    description: 'Those who do whatever they can get away with, without compassion or qualms'
  },
  {
    value: 'Chaotic Evil' as CharacterAlignment,
    label: 'Chaotic Evil',
    description: 'Creatures that act with arbitrary violence, spurred by their greed or hatred'
  },
  {
    value: 'Unaligned' as CharacterAlignment,
    label: 'Unaligned',
    description: 'Creatures lacking the capacity for moral or ethical judgment (beasts, constructs)'
  }
]
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Character Details
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Give your character a name and choose their moral alignment
      </p>
    </div>

    <!-- Form Fields -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <!-- Name Input -->
      <UFormField
        label="Character Name"
        help="Choose a name that fits your character's background and personality"
      >
        <UInput
          v-model="name"
          type="text"
          placeholder="Enter your character's name"
          size="lg"
        />
      </UFormField>

      <!-- Alignment Selector -->
      <UFormField
        label="Alignment"
        help="Optional - defines your character's moral compass"
      >
        <USelect
          v-model="alignment"
          :items="alignmentOptions"
          value-key="value"
          size="lg"
          data-testid="alignment-select"
        />
      </UFormField>
    </div>

    <!-- Info Text -->
    <div class="text-sm text-gray-600 dark:text-gray-400 text-center space-y-2">
      <p>
        Your character's name can be anything you like - traditional fantasy names,
        modern names, or something entirely unique to your world.
      </p>
      <p>
        Alignment represents your character's moral and ethical outlook. It can guide
        roleplay decisions but doesn't restrict your choices.
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
    />

    <!-- Continue Button -->
    <div class="flex justify-center pt-6">
      <UButton
        data-testid="continue-btn"
        size="lg"
        :disabled="!canProceed || isLoading"
        :loading="isLoading"
        @click="handleContinue"
      >
        Continue to Review
      </UButton>
    </div>
  </div>
</template>

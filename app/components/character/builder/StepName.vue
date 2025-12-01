<!-- app/components/character/builder/StepName.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

/**
 * Step 1: Name Your Character
 *
 * Simple name input with validation.
 * Creates a draft character on the API when user proceeds.
 */

const store = useCharacterBuilderStore()
const { name, isLoading, characterId } = storeToRefs(store)

// Validation
const isValid = computed(() => name.value.trim().length > 0)
const errorMessage = ref<string | null>(null)

// Create character and proceed
async function handleCreate() {
  if (!isValid.value) return

  errorMessage.value = null

  try {
    await store.createDraft(name.value.trim())
    store.nextStep()
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to create character'
  }
}

// If character already exists, just proceed
function handleNext() {
  if (characterId.value) {
    store.nextStep()
  } else {
    handleCreate()
  }
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Name Your Character
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        What shall this hero be called?
      </p>
    </div>

    <!-- Name Input -->
    <UFormField
      label="Character Name"
      :error="errorMessage ?? undefined"
      required
    >
      <UInput
        v-model="name"
        type="text"
        placeholder="Enter a name..."
        size="xl"
        autofocus
        :disabled="isLoading"
        @keyup.enter="handleNext"
      />
    </UFormField>

    <!-- Helper Text -->
    <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
      Choose a name that fits your character's personality and background.
      You can always change it later.
    </p>

    <!-- Create Button -->
    <div class="flex justify-center">
      <UButton
        size="lg"
        :disabled="!isValid"
        :loading="isLoading"
        @click="handleNext"
      >
        <template v-if="characterId">
          Continue
        </template>
        <template v-else>
          Begin Your Journey
        </template>
      </UButton>
    </div>
  </div>
</template>

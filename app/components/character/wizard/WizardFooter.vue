<!-- app/components/character/wizard/WizardFooter.vue -->
<script setup lang="ts">
import { useCharacterWizard, type UseCharacterWizardOptions } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'

const props = defineProps<UseCharacterWizardOptions>()

const store = useCharacterWizardStore()
const {
  isFirstStep,
  isLastStep,
  canProceed,
  nextStep,
  previousStep
} = useCharacterWizard(props)

async function handleNext() {
  if (isLastStep.value) {
    // TODO: Finish wizard and redirect to character page
    await navigateTo('/characters')
  } else {
    await nextStep()
  }
}

async function handleBack() {
  await previousStep()
}
</script>

<template>
  <footer class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 min-h-[72px]">
    <div class="flex justify-between items-center max-w-4xl mx-auto">
      <!-- Back Button -->
      <UButton
        data-testid="back-button"
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        :disabled="isFirstStep"
        @click="handleBack"
      >
        Back
      </UButton>

      <!-- Next/Finish Button -->
      <UButton
        data-testid="next-button"
        color="primary"
        :icon="isLastStep ? 'i-heroicons-check' : 'i-heroicons-arrow-right'"
        icon-trailing
        :disabled="!canProceed || store.isLoading"
        :loading="store.isLoading"
        @click="handleNext"
      >
        {{ isLastStep ? 'Finish' : 'Next' }}
      </UButton>
    </div>
  </footer>
</template>

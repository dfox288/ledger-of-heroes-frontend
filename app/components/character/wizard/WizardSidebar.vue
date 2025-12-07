<!-- app/components/character/wizard/WizardSidebar.vue -->
<script setup lang="ts">
import { useCharacterWizard, type UseCharacterWizardOptions } from '~/composables/useCharacterWizard'

const props = defineProps<UseCharacterWizardOptions>()

const {
  activeSteps,
  currentStepIndex,
  progressPercent,
  getStepUrl
} = useCharacterWizard(props)

function getStepStatus(stepIndex: number): 'completed' | 'current' | 'future' {
  if (stepIndex < currentStepIndex.value) return 'completed'
  if (stepIndex === currentStepIndex.value) return 'current'
  return 'future'
}

function handleStepClick(stepName: string, stepIndex: number) {
  // Only allow navigating to completed steps
  if (stepIndex < currentStepIndex.value) {
    navigateTo(getStepUrl(stepName))
  }
}
</script>

<template>
  <aside class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Character Builder
      </h2>
      <div class="mt-2">
        <div
          class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          data-testid="progress-bar"
        >
          <div
            class="h-full bg-primary transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ progressPercent }}% complete
        </p>
      </div>
    </div>

    <!-- Step List -->
    <nav class="flex-1 overflow-y-auto p-2">
      <ul class="space-y-1">
        <li
          v-for="(step, index) in activeSteps"
          :key="step.name"
        >
          <button
            type="button"
            :data-testid="`step-item-${step.name}`"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
            :class="{
              'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300': getStepStatus(index) === 'current',
              'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer': getStepStatus(index) === 'completed',
              'text-gray-400 dark:text-gray-500 cursor-not-allowed': getStepStatus(index) === 'future'
            }"
            :disabled="getStepStatus(index) === 'future'"
            @click="handleStepClick(step.name, index)"
          >
            <!-- Step indicator -->
            <span
              class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium"
              :class="{
                'bg-primary text-white': getStepStatus(index) === 'completed',
                'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 ring-2 ring-primary': getStepStatus(index) === 'current',
                'bg-gray-200 dark:bg-gray-700 text-gray-500': getStepStatus(index) === 'future'
              }"
            >
              <UIcon
                v-if="getStepStatus(index) === 'completed'"
                name="i-heroicons-check"
                class="w-4 h-4"
                data-testid="check-icon"
              />
              <span v-else>{{ index + 1 }}</span>
            </span>

            <!-- Step icon and label -->
            <span class="flex items-center gap-2 flex-1 min-w-0">
              <UIcon
                :name="step.icon"
                class="w-4 h-4 flex-shrink-0"
              />
              <span class="truncate">{{ step.label }}</span>
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

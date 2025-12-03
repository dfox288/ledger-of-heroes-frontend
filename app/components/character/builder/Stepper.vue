<!-- app/components/character/builder/Stepper.vue -->
<script setup lang="ts">
interface Step {
  id: number
  name: string
  label: string
  icon: string
}

const props = defineProps<{
  steps: Step[]
  currentStep: number
}>()

const emit = defineEmits<{
  'step-click': [stepId: number]
}>()

function handleStepClick(step: Step) {
  // Only allow clicking on completed steps (before current) or current step
  if (step.id <= props.currentStep) {
    emit('step-click', step.id)
  }
}

function isClickable(step: Step): boolean {
  return step.id <= props.currentStep
}
</script>

<template>
  <div class="flex justify-between">
    <button
      v-for="step in steps"
      :key="step.id"
      type="button"
      class="flex items-center transition-colors"
      :class="[
        step.id === currentStep
          ? 'text-primary font-medium'
          : step.id < currentStep
            ? 'text-gray-600 dark:text-gray-400 hover:text-primary cursor-pointer'
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
      ]"
      :disabled="!isClickable(step)"
      @click="handleStepClick(step)"
    >
      <UIcon
        :name="step.icon"
        class="w-5 h-5 mr-1"
      />
      <span class="text-sm">{{ step.label }}</span>
    </button>
  </div>
</template>

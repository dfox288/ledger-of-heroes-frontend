<!-- app/components/character/builder/Stepper.vue -->
<script setup lang="ts">
interface Step {
  id: number
  name: string
  label: string
  icon: string
}

defineProps<{
  steps: Step[]
  currentStep: number
}>()
</script>

<template>
  <div class="flex justify-between">
    <div
      v-for="step in steps"
      :key="step.id"
      class="flex items-center"
      :class="{ 'text-primary': step.id === currentStep }"
    >
      <UIcon
        :name="step.icon"
        class="w-5 h-5 mr-1"
      />
      <span class="text-sm">{{ step.label }}</span>
    </div>
  </div>
</template>

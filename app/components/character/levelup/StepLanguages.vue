<!-- app/components/character/levelup/StepLanguages.vue -->
<script setup lang="ts">
/**
 * Level-Up: Languages Step
 *
 * Handles language selection from feature choices.
 * Wraps the existing CharacterWizardStepLanguages component.
 */
const props = defineProps<{
  characterId?: number
  nextStep?: () => Promise<void>
  refreshAfterSave?: () => Promise<void>
}>()
</script>

<template>
  <CharacterWizardStepLanguages
    :character-id="characterId"
    :next-step="nextStep"
    :refresh-after-save="refreshAfterSave"
  />
</template>

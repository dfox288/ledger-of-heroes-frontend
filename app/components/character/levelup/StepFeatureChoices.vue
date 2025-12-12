<!-- app/components/character/levelup/StepFeatureChoices.vue -->
<script setup lang="ts">
/**
 * Level-Up: Feature Choices Step
 *
 * Handles Fighting Style, Expertise, and Optional Feature choices.
 * Wraps the existing CharacterWizardStepFeatureChoices component.
 */
const props = defineProps<{
  characterId?: number
  nextStep?: () => Promise<void>
  refreshAfterSave?: () => Promise<void>
}>()
</script>

<template>
  <CharacterWizardStepFeatureChoices
    :character-id="characterId"
    :next-step="nextStep"
    :refresh-after-save="refreshAfterSave"
  />
</template>

<!-- app/components/character/levelup/StepProficiencies.vue -->
<script setup lang="ts">
/**
 * Level-Up: Proficiencies Step
 *
 * Handles skill/tool proficiency selection from feature choices.
 * Wraps the existing CharacterWizardStepProficiencies component.
 */
const props = defineProps<{
  characterId?: number
  nextStep?: () => Promise<void>
  refreshAfterSave?: () => Promise<void>
}>()
</script>

<template>
  <CharacterWizardStepProficiencies
    :character-id="characterId"
    :next-step="nextStep"
    :refresh-after-save="refreshAfterSave"
  />
</template>

<!-- app/components/character/levelup/StepAsiFeat.vue -->
<script setup lang="ts">
/**
 * Level-Up: ASI/Feat Step
 *
 * Choose Ability Score Improvement or Feat at ASI levels.
 * Wraps the existing CharacterWizardStepFeats component.
 */
const props = defineProps<{
  characterId?: number
  nextStep?: () => Promise<void>
  refreshAfterSave?: () => Promise<void>
}>()
</script>

<template>
  <CharacterWizardStepFeats
    :character-id="characterId"
    :next-step="nextStep"
  />
</template>

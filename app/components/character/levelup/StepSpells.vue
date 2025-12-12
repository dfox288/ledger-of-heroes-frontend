<!-- app/components/character/levelup/StepSpells.vue -->
<script setup lang="ts">
/**
 * Level-Up: Spells Step
 *
 * Handles spell learning and replacement for casters.
 * Wraps the existing CharacterWizardStepSpells component.
 */
const props = defineProps<{
  characterId?: number
  nextStep?: () => Promise<void>
}>()
</script>

<template>
  <CharacterWizardStepSpells
    :character-id="characterId"
    :next-step="nextStep"
  />
</template>

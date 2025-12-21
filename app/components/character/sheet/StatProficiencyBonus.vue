<!-- app/components/character/sheet/StatProficiencyBonus.vue -->
<script setup lang="ts">
/**
 * Proficiency Bonus Stat Display
 *
 * Wrapper around StatDisplay for proficiency bonus.
 * Kept as a separate component for semantic clarity.
 */
defineProps<{
  bonus: number | null
}>()
</script>

<template>
  <CharacterSheetStatDisplay
    label="Prof Bonus"
    :value="bonus"
  />
</template>

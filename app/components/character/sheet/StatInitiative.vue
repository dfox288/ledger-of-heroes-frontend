<!-- app/components/character/sheet/StatInitiative.vue -->
<script setup lang="ts">
/**
 * Initiative Stat Display
 *
 * Wrapper around StatDisplay for initiative bonus.
 * Kept as a separate component for semantic clarity.
 */
defineProps<{
  bonus: number | null
}>()
</script>

<template>
  <CharacterSheetStatDisplay
    label="Initiative"
    :value="bonus"
  />
</template>

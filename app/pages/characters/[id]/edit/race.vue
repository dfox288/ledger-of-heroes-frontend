<!-- app/pages/characters/[id]/edit/race.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepRace />
</template>

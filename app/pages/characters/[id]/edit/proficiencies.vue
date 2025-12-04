<!-- app/pages/characters/[id]/edit/proficiencies.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepProficiencies />
</template>

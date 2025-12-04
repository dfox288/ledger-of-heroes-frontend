<!-- app/pages/characters/[id]/edit/abilities.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepAbilities />
</template>

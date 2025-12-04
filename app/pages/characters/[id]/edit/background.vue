<!-- app/pages/characters/[id]/edit/background.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepBackground />
</template>

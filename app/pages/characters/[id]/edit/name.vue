<!-- app/pages/characters/[id]/edit/name.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepName />
</template>

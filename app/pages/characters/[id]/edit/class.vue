<!-- app/pages/characters/[id]/edit/class.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepClass />
</template>

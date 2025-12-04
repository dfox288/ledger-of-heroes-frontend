<!-- app/pages/characters/[id]/edit/review.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepReview />
</template>

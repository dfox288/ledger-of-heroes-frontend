<!-- app/pages/characters/[id]/edit/spells.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepSpells />
</template>

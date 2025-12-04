<!-- app/pages/characters/[id]/edit/equipment.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <CharacterBuilderStepEquipment />
</template>

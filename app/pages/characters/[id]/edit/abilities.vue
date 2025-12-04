<!-- app/pages/characters/[id]/edit/abilities.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['wizard-step']
})
</script>

<template>
  <Suspense>
    <CharacterBuilderStepAbilities />
    <template #fallback>
      <div class="flex justify-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>
    </template>
  </Suspense>
</template>

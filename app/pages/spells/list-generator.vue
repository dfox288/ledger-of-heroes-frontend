<script setup lang="ts">
definePageMeta({
  title: 'Spell List Generator',
  description: 'Generate customized spell lists for your D&D 5e character',
})

useSeoMeta({
  title: 'Spell List Generator - D&D 5e Compendium',
  description:
    'Generate customized spell lists filtered by class, level, school, and more. Perfect for character building and campaign planning.',
  ogTitle: 'Spell List Generator - D&D 5e Compendium',
  ogDescription:
    'Generate customized spell lists filtered by class, level, school, and more. Perfect for character building and campaign planning.',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Spell List Generator</h1>

    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Generate customized spell lists filtered by class, level, school, and more. Perfect for
      character building and campaign planning.
    </p>

    <!-- Filter controls will be added in next task -->
    <!-- Spell list display will be added in next task -->
  </div>
</template>

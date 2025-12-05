<!-- app/components/character/sheet/LanguagesPanel.vue -->
<script setup lang="ts">
import type { CharacterLanguage } from '~/types/character'

defineProps<{
  languages: CharacterLanguage[]
}>()
</script>

<template>
  <div>
    <div
      v-if="languages.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No languages yet
    </div>

    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <UBadge
        v-for="lang in languages"
        :key="lang.id"
        color="neutral"
        variant="subtle"
        size="md"
      >
        {{ lang.language.name }}
      </UBadge>
    </div>
  </div>
</template>

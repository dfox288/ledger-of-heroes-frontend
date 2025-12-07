<!-- app/components/character/wizard/review/ReviewLanguages.vue -->
<script setup lang="ts">
/**
 * Languages card - displays character's known languages
 */

import type { CharacterLanguage } from '~/types/character'

defineProps<{
  languages: CharacterLanguage[] | null
}>()
</script>

<template>
  <UCard :ui="{ body: 'p-4' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-language"
          class="w-5 h-5 text-primary"
        />
        <span class="font-semibold text-gray-900 dark:text-white">Languages</span>
      </div>
    </template>

    <div
      v-if="languages && languages.length > 0"
      class="flex flex-wrap gap-2"
    >
      <UBadge
        v-for="lang in languages"
        :key="lang.id"
        color="neutral"
        variant="subtle"
        size="md"
      >
        {{ lang.language?.name ?? 'Unknown' }}
      </UBadge>
    </div>
    <div
      v-else
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      No languages selected yet.
    </div>
  </UCard>
</template>

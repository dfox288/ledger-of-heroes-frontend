<!-- app/components/character/sheet/LanguagesPanel.vue -->
<script setup lang="ts">
/**
 * Languages Panel - Card Display
 *
 * Shows character known languages as badges.
 * Displays as a card matching other sheet components.
 * Conditionally renders only when languages exist.
 *
 * @see Issue #584 - Character sheet component refactor
 */
import type { CharacterLanguage } from '~/types/character'

const props = defineProps<{
  languages: CharacterLanguage[]
}>()

// Check if panel should render
const hasLanguages = computed(() => props.languages.length > 0)
</script>

<template>
  <div
    v-if="hasLanguages"
    class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
  >
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Languages
    </h3>
    <div class="flex flex-wrap gap-2">
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
  </div>
</template>

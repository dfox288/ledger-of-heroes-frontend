<!-- app/pages/characters/create.vue -->
<script setup lang="ts">
/**
 * DEPRECATED - Character Creation Redirect
 *
 * This page redirects to the new character wizard at /characters/new/sourcebooks.
 * The new wizard uses a cleaner URL structure and improved architecture.
 *
 * Old flow: /characters/create → API POST → /characters/:id/edit
 * New flow: /characters/new/sourcebooks → wizard steps
 *
 * @deprecated Use /characters/new instead
 */

definePageMeta({
  middleware: () => navigateTo('/characters/new/sourcebooks', { redirectCode: 301 })
})

useSeoMeta({
  title: 'Create Character',
  description: 'Redirecting to new character wizard...'
})
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-[50vh]">
    <UIcon
      name="i-heroicons-arrow-path"
      class="w-8 h-8 animate-spin text-primary"
    />
    <span class="ml-3 text-gray-600 dark:text-gray-400">
      Redirecting to new character wizard...
    </span>
  </div>
</template>

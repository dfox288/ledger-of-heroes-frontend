<!-- app/pages/characters/create.vue -->
<script setup lang="ts">
/**
 * Character Creation - Redirect Page
 *
 * Creates an empty character in the database and redirects to the edit page.
 * This implements the "unified edit page" architecture where all character
 * building happens on /characters/[id]/edit.
 */
const { apiFetch } = useApi()

useSeoMeta({
  title: 'Create Character',
  description: 'Start building your D&D 5e character'
})

// Create empty character and redirect to edit
onMounted(async () => {
  try {
    const response = await apiFetch<{ data: { id: number } }>('/characters', {
      method: 'POST',
      body: { name: 'New Character' }
    })

    // Pass ?new=true so edit page knows to start at step 1 (Name)
    // This ensures users can replace the placeholder name
    await navigateTo(`/characters/${response.data.id}/edit?new=true`)
  } catch {
    await navigateTo('/characters')
  }
})
</script>

<template>
  <div class="flex justify-center items-center min-h-[50vh]">
    <UIcon
      name="i-heroicons-arrow-path"
      class="w-8 h-8 animate-spin text-primary"
    />
    <span class="ml-3 text-gray-600 dark:text-gray-400">Creating character...</span>
  </div>
</template>

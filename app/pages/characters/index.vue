<!-- app/pages/characters/index.vue -->
<script setup lang="ts">
import type { CharacterSummary } from '~/types'

/**
 * Character List Page
 *
 * Displays user's characters with option to create new ones.
 */

useSeoMeta({
  title: 'Your Characters',
  description: 'Manage your D&D 5e characters'
})

// Fetch characters
const { apiFetch } = useApi()
const { data, pending, error, refresh } = await useAsyncData(
  'characters-list',
  () => apiFetch<{ data: CharacterSummary[] }>('/characters')
)

const characters = computed(() => data.value?.data ?? [])

// Delete character
async function deleteCharacter(id: number) {
  if (!confirm('Are you sure you want to delete this character?')) return

  try {
    await apiFetch(`/characters/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    console.error('Failed to delete character:', err)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Your Characters
        </h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          Manage your D&D 5e heroes
        </p>
      </div>

      <UButton
        to="/characters/create"
        icon="i-heroicons-plus"
        size="lg"
      >
        Create Character
      </UButton>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-gray-400"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load characters"
      :description="error.message"
    />

    <!-- Empty State -->
    <div
      v-else-if="characters.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-user-group"
        class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
      />
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
        No characters yet
      </h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Create your first character to begin your adventure!
      </p>
      <UButton
        to="/characters/create"
        class="mt-6"
        icon="i-heroicons-plus"
      >
        Create Your First Character
      </UButton>
    </div>

    <!-- Character Grid -->
    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <CharacterCard
        v-for="character in characters"
        :key="character.id"
        :character="character"
        @delete="deleteCharacter(character.id)"
      />
    </div>
  </div>
</template>

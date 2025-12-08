<!-- app/pages/characters/index.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { CharacterSummary } from '~/types'
import { logger } from '~/utils/logger'

/**
 * Character List Page
 *
 * Displays user's characters with search and pagination.
 * Uses useEntityList composable following the pattern of other entity pages.
 */

// Use entity list composable for pagination and search
const {
  searchQuery,
  currentPage,
  data,
  meta,
  totalResults,
  loading,
  error,
  refresh,
  clearFilters,
  hasActiveFilters
} = useEntityList({
  endpoint: '/characters',
  cacheKey: 'characters-list',
  queryBuilder: computed(() => ({})), // No custom filters (just search + pagination)
  perPage: 15, // Characters per page
  seo: {
    title: 'Your Characters - D&D 5e Compendium',
    description: 'Manage your D&D 5e characters'
  }
})

const characters = computed(() => data.value as CharacterSummary[])
const perPage = 15
const { apiFetch } = useApi()

// Delete character by publicId
async function deleteCharacter(publicId: string) {
  if (!confirm('Are you sure you want to delete this character?')) return

  try {
    await apiFetch(`/characters/${publicId}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    logger.error('Failed to delete character:', err)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
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

    <!-- Search Input -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search characters..."
        size="lg"
      >
        <template
          v-if="searchQuery"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            icon="i-heroicons-x-mark"
            :padded="false"
            aria-label="Clear search"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>
    </div>

    <!-- List States (Loading, Error, Empty, Results) -->
    <UiListStates
      :loading="loading"
      :error="error"
      :empty="characters.length === 0"
      :meta="meta"
      :total="totalResults"
      entity-name="character"
      entity-name-plural="Characters"
      :has-filters="hasActiveFilters"
      :current-page="currentPage"
      :per-page="perPage"
      @retry="refresh"
      @clear-filters="clearFilters"
      @update:current-page="currentPage = $event"
    >
      <!-- Custom empty state with create button -->
      <template #empty>
        <div class="text-center py-12">
          <UIcon
            name="i-heroicons-user-group"
            class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
          />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No characters {{ hasActiveFilters ? 'found' : 'yet' }}
          </h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400">
            {{ hasActiveFilters
              ? 'Try adjusting your search or clear filters'
              : 'Create your first character to begin your adventure!'
            }}
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <UButton
              v-if="hasActiveFilters"
              variant="soft"
              @click="clearFilters"
            >
              Clear Search
            </UButton>
            <UButton
              to="/characters/create"
              icon="i-heroicons-plus"
            >
              {{ hasActiveFilters ? 'Create Character' : 'Create Your First Character' }}
            </UButton>
          </div>
        </div>
      </template>

      <template #grid>
        <CharacterCard
          v-for="character in characters"
          :key="character.public_id"
          :character="character"
          @delete="deleteCharacter(character.public_id)"
        />
      </template>
    </UiListStates>
  </div>
</template>

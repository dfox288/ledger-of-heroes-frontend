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
const toast = useToast()

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

// ============================================================================
// Character Import
// ============================================================================

/** Import modal open state */
const showImportModal = ref(false)

/** Prevents double-submit during import */
const isImporting = ref(false)

/** Import response shape from backend */
interface ImportResponse {
  data: {
    id: number
    public_id: string
    name: string
  }
}

/** Import data shape from the modal */
interface ImportData {
  format_version: string
  character: {
    public_id: string
    name: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * Handle character import from modal
 * POSTs to import endpoint and navigates to new character
 */
async function handleImport(importData: ImportData) {
  if (isImporting.value) return

  isImporting.value = true

  try {
    const response = await apiFetch<ImportResponse>('/characters/import', {
      method: 'POST',
      body: importData
    })

    // Handle both { data: {...} } and direct response shapes
    const character = response.data || response
    const publicId = character.public_id
    const name = character.name || 'Character'

    toast.add({
      title: 'Character imported!',
      description: `${name} is ready to play`,
      color: 'success'
    })

    // Navigate to the new character (or fall back to list if no public_id)
    if (publicId) {
      await navigateTo(`/characters/${publicId}`)
    } else {
      await refresh()
    }
  } catch (err: unknown) {
    const error = err as { statusCode?: number, data?: { message?: string } }

    if (error.statusCode === 422) {
      toast.add({
        title: 'Import failed',
        description: error.data?.message || 'Invalid character data',
        color: 'error'
      })
    } else {
      logger.error('Failed to import character:', err)
      toast.add({
        title: 'Import failed',
        description: 'Could not import character. Please try again.',
        color: 'error'
      })
    }
  } finally {
    isImporting.value = false
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

      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-arrow-up-tray"
          size="lg"
          variant="outline"
          @click="showImportModal = true"
        >
          Import
        </UButton>
        <UButton
          to="/characters/create"
          icon="i-heroicons-plus"
          size="lg"
        >
          Create Character
        </UButton>
      </div>
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

    <!-- Import Character Modal -->
    <CharacterImportModal
      v-model:open="showImportModal"
      @import="handleImport"
    />
  </div>
</template>

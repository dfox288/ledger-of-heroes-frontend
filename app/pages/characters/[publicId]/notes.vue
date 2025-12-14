<!-- app/pages/characters/[publicId]/notes.vue -->
<script setup lang="ts">
/**
 * Notes Management Page
 *
 * Dedicated page for character notes with CRUD functionality.
 * Notes are grouped by category (Campaign, Session, Backstory, etc.)
 *
 * Uses useCharacterSubPage for shared data fetching and play state initialization.
 *
 * @see Issue #557 - Notes tab implementation
 * @see Issue #621 - Consolidated data fetching
 */

import type { CharacterNote } from '~/types/character'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const { apiFetch } = useApi()

// Shared character data + play state initialization
const { character, isSpellcaster, loading, refreshCharacter, addPendingState } =
  useCharacterSubPage(publicId)

// Fetch notes data (grouped by category)
const { data: notesData, pending: notesPending, refresh: refreshNotes } = await useAsyncData(
  `character-${publicId.value}-notes`,
  () => apiFetch<{ data: Record<string, CharacterNote[]> }>(`/characters/${publicId.value}/notes`)
)

// Register pending state so it's included in loading
addPendingState(notesPending)

const notes = computed(() => notesData.value?.data ?? {})

// Handle refresh from NotesManager
async function handleRefresh() {
  await refreshNotes()
}

useSeoMeta({
  title: () => character.value ? `${character.value.name} - Notes` : 'Notes'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-skeleton"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Main Content -->
    <template v-else-if="character">
      <!-- Unified Page Header -->
      <CharacterPageHeader
        :character="character"
        :is-spellcaster="isSpellcaster"
        :back-to="`/characters/${publicId}`"
        back-label="Back to Character"
        @updated="refreshCharacter"
      />

      <!-- Notes Content -->
      <div class="mt-6">
        <CharacterSheetNotesManager
          :notes="notes"
          :character-id="character.id"
          @refresh="handleRefresh"
        />
      </div>
    </template>
  </div>
</template>

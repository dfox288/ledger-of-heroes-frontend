<!-- app/components/character/sheet/NotesManager.vue -->
<script setup lang="ts">
/**
 * Notes Manager Component
 *
 * Self-contained component for managing character notes.
 * Wraps NotesPanel + NoteEditModal + NoteDeleteModal.
 * Handles API calls and emits refresh event for the page to update data.
 */
import type { CharacterNote } from '~/types/character'
import type { NotePayload } from './NoteEditModal.vue'

const props = defineProps<{
  notes: Record<string, CharacterNote[]>
  characterId: number | string
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { apiFetch } = useApi()
const toast = useToast()

// ===========================================================================
// STATE
// ===========================================================================

/** Loading state for API calls */
const isLoading = ref(false)

/** Edit modal state */
const showEditModal = ref(false)
const noteToEdit = ref<CharacterNote | null>(null)

/** Delete modal state */
const showDeleteModal = ref(false)
const noteToDelete = ref<CharacterNote | null>(null)

/** API error state */
const apiError = ref<string | null>(null)

// ===========================================================================
// HANDLERS
// ===========================================================================

/**
 * Handle add note - open edit modal in create mode
 */
function handleAdd() {
  noteToEdit.value = null
  apiError.value = null
  showEditModal.value = true
}

/**
 * Handle edit note - open edit modal with note data
 */
function handleEdit(note: CharacterNote) {
  noteToEdit.value = note
  apiError.value = null
  showEditModal.value = true
}

/**
 * Handle delete request - open delete confirmation modal
 */
function handleDelete(note: CharacterNote) {
  noteToDelete.value = note
  showDeleteModal.value = true
}

/**
 * Handle save from edit modal
 * Creates new note or updates existing one
 */
async function handleSave(payload: NotePayload) {
  if (isLoading.value) return

  isLoading.value = true
  apiError.value = null

  try {
    if (noteToEdit.value) {
      // Edit mode - PATCH existing note
      await apiFetch(`/characters/${props.characterId}/notes/${noteToEdit.value.id}`, {
        method: 'PATCH',
        body: payload
      })
      toast.add({
        title: 'Note updated',
        color: 'success'
      })
    } else {
      // Create mode - POST new note
      await apiFetch(`/characters/${props.characterId}/notes`, {
        method: 'POST',
        body: payload
      })
      toast.add({
        title: 'Note added',
        color: 'success'
      })
    }
    showEditModal.value = false
    emit('refresh')
  } catch (err: unknown) {
    const error = err as { data?: { message?: string } }
    const message = error.data?.message || 'Failed to save note'
    apiError.value = message
    logger.error('Failed to save note:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle confirmed deletion
 */
async function handleDeleteConfirm() {
  if (isLoading.value || !noteToDelete.value) return

  isLoading.value = true

  try {
    await apiFetch(`/characters/${props.characterId}/notes/${noteToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Note deleted',
      color: 'success'
    })
    showDeleteModal.value = false
    emit('refresh')
  } catch (err) {
    logger.error('Failed to delete note:', err)
    toast.add({
      title: 'Failed to delete note',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Notes Panel -->
    <CharacterSheetNotesPanel
      :notes="notes"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Edit/Create Modal -->
    <CharacterSheetNoteEditModal
      v-model:open="showEditModal"
      :note="noteToEdit ?? undefined"
      :loading="isLoading"
      :error="apiError"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <CharacterSheetNoteDeleteModal
      v-if="noteToDelete"
      v-model:open="showDeleteModal"
      :note="noteToDelete"
      :loading="isLoading"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

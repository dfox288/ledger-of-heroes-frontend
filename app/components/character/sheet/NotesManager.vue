<!-- app/components/character/sheet/NotesManager.vue -->
<script setup lang="ts">
/**
 * Notes Manager Component
 *
 * Self-contained component for managing character notes.
 * Wraps NotesPanel + NoteEditModal + NoteDeleteModal.
 * Handles API calls and emits refresh event for the page to update data.
 *
 * Uses optimistic UI updates: modals close immediately and changes
 * appear instantly while API calls happen in the background.
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

/** Loading state for API calls (used for modal button states) */
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
// OPTIMISTIC UI STATE
// ===========================================================================

/** Temporary note ID counter for optimistic creates */
let tempIdCounter = -1

/** Optimistic notes pending API confirmation */
const pendingCreates = ref<CharacterNote[]>([])

/** Note IDs pending deletion */
const pendingDeletes = ref<Set<number>>(new Set())

/** Notes with pending edits (id -> updated note) */
const pendingEdits = ref<Map<number, CharacterNote>>(new Map())

/**
 * Display notes: merges props.notes with optimistic updates
 * - Filters out notes pending deletion
 * - Applies pending edits
 * - Adds pending creates
 */
const displayNotes = computed(() => {
  const result: Record<string, CharacterNote[]> = {}

  // Process existing notes from props
  for (const [category, notes] of Object.entries(props.notes)) {
    const filteredNotes = notes
      .filter(note => !pendingDeletes.value.has(note.id))
      .map(note => pendingEdits.value.get(note.id) ?? note)

    if (filteredNotes.length > 0) {
      result[category] = filteredNotes
    }
  }

  // Add pending creates
  for (const note of pendingCreates.value) {
    const category = note.category
    if (!result[category]) {
      result[category] = []
    }
    result[category]!.push(note)
  }

  return result
})

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
 * Uses optimistic updates: closes modal immediately and shows changes
 * while API call happens in background.
 */
async function handleSave(payload: NotePayload) {
  if (isLoading.value) return

  const isEdit = !!noteToEdit.value
  const editingNote = noteToEdit.value

  // Close modal immediately for snappy UX
  showEditModal.value = false

  if (isEdit && editingNote) {
    // EDIT MODE - Apply optimistic edit
    const optimisticNote: CharacterNote = {
      ...editingNote,
      title: payload.title ?? editingNote.title,
      content: payload.content
    }
    pendingEdits.value.set(editingNote.id, optimisticNote)

    try {
      await apiFetch(`/characters/${props.characterId}/notes/${editingNote.id}`, {
        method: 'PATCH',
        body: payload
      })
      toast.add({ title: 'Note updated', color: 'success' })
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } }
      const message = error.data?.message || 'Failed to update note'
      toast.add({ title: message, color: 'error' })
      logger.error('Failed to update note:', err)
    } finally {
      pendingEdits.value.delete(editingNote.id)
      emit('refresh')
    }
  } else {
    // CREATE MODE - Apply optimistic create
    const tempId = tempIdCounter--
    const optimisticNote: CharacterNote = {
      id: tempId,
      category: payload.category ?? 'session',
      category_label: payload.category ?? 'Session',
      title: payload.title ?? null,
      content: payload.content,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    pendingCreates.value.push(optimisticNote)

    try {
      await apiFetch(`/characters/${props.characterId}/notes`, {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Note added', color: 'success' })
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } }
      const message = error.data?.message || 'Failed to add note'
      toast.add({ title: message, color: 'error' })
      logger.error('Failed to add note:', err)
    } finally {
      pendingCreates.value = pendingCreates.value.filter(n => n.id !== tempId)
      emit('refresh')
    }
  }
}

/**
 * Handle confirmed deletion
 * Uses optimistic updates: closes modal and removes note immediately
 * while API call happens in background.
 */
async function handleDeleteConfirm() {
  if (!noteToDelete.value) return

  const deletingNote = noteToDelete.value
  const noteId = deletingNote.id

  // Close modal immediately and apply optimistic delete
  showDeleteModal.value = false
  pendingDeletes.value.add(noteId)

  try {
    await apiFetch(`/characters/${props.characterId}/notes/${noteId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Note deleted', color: 'success' })
  } catch (err) {
    logger.error('Failed to delete note:', err)
    toast.add({ title: 'Failed to delete note', color: 'error' })
  } finally {
    pendingDeletes.value.delete(noteId)
    emit('refresh')
  }
}
</script>

<template>
  <div>
    <!-- Notes Panel -->
    <CharacterSheetNotesPanel
      :notes="displayNotes"
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
      v-model:open="showDeleteModal"
      :note="noteToDelete"
      :loading="isLoading"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

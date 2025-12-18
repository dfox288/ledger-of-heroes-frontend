<!-- app/components/character/sheet/NotesManager.vue -->
<script setup lang="ts">
/**
 * Notes Manager Component
 *
 * Thin wrapper that delegates to characterPlayState store.
 * Store handles optimistic updates with rollback on error.
 * Component manages modal state for add/edit/delete flows.
 *
 * @see Issue #696 - Store consolidation
 */
import { storeToRefs } from 'pinia'
import type { CharacterNote } from '~/types/character'
import type { NotePayload } from '~/stores/characterPlayState'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  notes: Record<string, CharacterNote[]>
  characterId: number
}>()

const emit = defineEmits<{
  refresh: []
}>()

const store = useCharacterPlayStateStore()
const toast = useToast()

const { displayNotes, isUpdatingNotes } = storeToRefs(store)

// ===========================================================================
// INITIALIZATION
// ===========================================================================

// Initialize store when notes prop changes
watch(() => props.notes, (newNotes) => {
  store.initializeNotes(newNotes)
}, { immediate: true, deep: true })

// ===========================================================================
// MODAL STATE
// ===========================================================================

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
 * Uses optimistic updates via store: closes modal immediately and shows changes
 * while API call happens in background.
 *
 * @see Issue #802 - Only emits refresh on failure to resync with server state
 */
async function handleSave(payload: NotePayload) {
  const isEdit = !!noteToEdit.value
  const editingNote = noteToEdit.value

  // Close modal immediately for snappy UX
  showEditModal.value = false

  if (isEdit && editingNote) {
    // EDIT MODE - Delegate to store
    const success = await store.editNote(editingNote.id, payload)
    if (success) {
      toast.add({ title: 'Note updated', color: 'success' })
    } else {
      toast.add({ title: 'Failed to update note', color: 'error' })
      // Only refresh on failure to resync with server state after rollback
      emit('refresh')
    }
  } else {
    // CREATE MODE - Delegate to store
    const success = await store.addNote(payload)
    if (success) {
      toast.add({ title: 'Note added', color: 'success' })
    } else {
      toast.add({ title: 'Failed to add note', color: 'error' })
      // Only refresh on failure to resync with server state after rollback
      emit('refresh')
    }
  }
}

/**
 * Handle confirmed deletion
 * Uses optimistic updates via store: closes modal and removes note immediately
 * while API call happens in background.
 *
 * @see Issue #802 - Only emits refresh on failure to resync with server state
 */
async function handleDeleteConfirm() {
  if (!noteToDelete.value) return

  const noteId = noteToDelete.value.id

  // Close modal immediately and apply optimistic delete
  showDeleteModal.value = false

  const success = await store.deleteNote(noteId)
  if (success) {
    toast.add({ title: 'Note deleted', color: 'success' })
  } else {
    toast.add({ title: 'Failed to delete note', color: 'error' })
    // Only refresh on failure to resync with server state after rollback
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
      :loading="isUpdatingNotes"
      :error="apiError"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <CharacterSheetNoteDeleteModal
      v-model:open="showDeleteModal"
      :note="noteToDelete"
      :loading="isUpdatingNotes"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

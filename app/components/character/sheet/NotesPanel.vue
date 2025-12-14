<!-- app/components/character/sheet/NotesPanel.vue -->
<script setup lang="ts">
import type { CharacterNote } from '~/types/character'

/**
 * Notes panel for character sheet
 *
 * Displays character notes organized by category (backstory, session notes, etc.)
 * Notes are passed as an object keyed by category name.
 *
 * Emits events for add/edit/delete actions to be handled by parent (NotesManager).
 */
const props = defineProps<{
  notes: Record<string, CharacterNote[]>
  /** Whether to show action buttons (edit/delete) */
  readonly?: boolean
}>()

const emit = defineEmits<{
  add: []
  edit: [note: CharacterNote]
  delete: [note: CharacterNote]
}>()

/** Filter out empty categories (can occur during optimistic updates) */
const notesWithContent = computed(() =>
  Object.fromEntries(
    Object.entries(props.notes).filter(([_, notes]) => notes.length > 0)
  )
)
</script>

<template>
  <div>
    <!-- Header with Add button -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Notes
      </h3>
      <UButton
        v-if="!readonly"
        data-testid="add-note-btn"
        color="primary"
        variant="soft"
        size="sm"
        icon="i-heroicons-plus"
        @click="emit('add')"
      >
        Add Note
      </UButton>
    </div>

    <!-- Empty state -->
    <div
      v-if="Object.keys(notesWithContent).length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      <UIcon
        name="i-heroicons-document-text"
        class="w-12 h-12 mx-auto mb-3 opacity-50"
      />
      <p>No notes yet</p>
      <p
        v-if="!readonly"
        class="text-sm mt-1"
      >
        Click "Add Note" to create your first note.
      </p>
    </div>

    <!-- Notes by category -->
    <div
      v-else
      class="space-y-6"
    >
      <!-- Each category gets its own section -->
      <div
        v-for="(categoryNotes, categoryKey) in notesWithContent"
        :key="categoryKey"
        class="space-y-3"
      >
        <!-- Category header - use category_label from first note -->
        <h4 class="text-base font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          {{ categoryNotes[0]?.category_label || categoryKey }}
        </h4>

        <!-- Notes within this category -->
        <div class="space-y-3">
          <div
            v-for="note in categoryNotes"
            :key="note.id"
            class="group bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative"
          >
            <!-- Action buttons (shown on hover) -->
            <div
              v-if="!readonly"
              class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <UButton
                :data-testid="`edit-note-${note.id}`"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-pencil-square"
                @click="emit('edit', note)"
              />
              <UButton
                :data-testid="`delete-note-${note.id}`"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-heroicons-trash"
                @click="emit('delete', note)"
              />
            </div>

            <!-- Note title if present -->
            <h5
              v-if="note.title"
              class="font-medium text-gray-900 dark:text-gray-100 mb-2 pr-16"
            >
              {{ note.title }}
            </h5>
            <!-- Note content -->
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ note.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

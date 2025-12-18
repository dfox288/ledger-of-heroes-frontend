<!-- app/components/character/sheet/NotesPanel.vue -->
<script setup lang="ts">
import type { CharacterNote } from '~/types/character'

/**
 * Notes panel for character sheet
 *
 * Displays character notes organized by category (backstory, session notes, etc.)
 * Notes are passed as an object keyed by category name.
 *
 * Features:
 * - Categories display in D&D character sheet order (#798)
 * - Search functionality for title and content (#799)
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

// =============================================================================
// Category Ordering (#798)
// =============================================================================

/**
 * Category display order following D&D character sheet conventions
 *
 * Order:
 * 1. Character traits (personality, ideal, bond, flaw)
 * 2. Character description (backstory, appearance)
 * 3. Gameplay notes (campaign, session, quest)
 * 4. World-building (npc, location, lore, item)
 * 5. Custom categories (alphabetical)
 */
const CATEGORY_ORDER: Record<string, number> = {
  // Character traits
  personality_trait: 1,
  ideal: 2,
  bond: 3,
  flaw: 4,
  // Character description
  backstory: 5,
  appearance: 6,
  // Gameplay notes
  campaign: 7,
  session: 8,
  quest: 9,
  // World-building
  npc: 10,
  location: 11,
  lore: 12,
  item: 13
}

// =============================================================================
// Search Functionality (#799)
// =============================================================================

/** Search query for filtering notes */
const searchQuery = ref('')

/** Get all notes as a flat array for counting */
const allNotes = computed(() => {
  return Object.values(props.notes).flat()
})

/** Total note count */
const totalCount = computed(() => allNotes.value.length)

/** Filter notes by search query (title and content) */
const filteredNotes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  if (!query) {
    return props.notes
  }

  const result: Record<string, CharacterNote[]> = {}

  for (const [category, notes] of Object.entries(props.notes)) {
    const matchingNotes = notes.filter(note =>
      note.title?.toLowerCase().includes(query)
      || note.content.toLowerCase().includes(query)
    )
    if (matchingNotes.length > 0) {
      result[category] = matchingNotes
    }
  }

  return result
})

/** Filtered count */
const filteredCount = computed(() => {
  return Object.values(filteredNotes.value).flat().length
})

/** Filter out empty categories and sort by category order */
const orderedNotes = computed(() => {
  const entries = Object.entries(filteredNotes.value)
    .filter(([_, notes]) => notes.length > 0)

  // Sort entries by category order
  entries.sort((a, b) => {
    const orderA = CATEGORY_ORDER[a[0]] ?? 99
    const orderB = CATEGORY_ORDER[b[0]] ?? 99

    // If both are custom categories (order 99), sort alphabetically
    if (orderA === 99 && orderB === 99) {
      return a[0].localeCompare(b[0])
    }

    return orderA - orderB
  })

  return entries
})
</script>

<template>
  <div>
    <!-- Header with Search and Add button -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Notes
        <span
          v-if="totalCount > 0"
          class="text-sm font-normal text-gray-500 dark:text-gray-400"
        >
          ({{ filteredCount }}<span v-if="searchQuery"> of {{ totalCount }}</span>)
        </span>
      </h3>

      <div class="flex items-center gap-2">
        <!-- Search Input -->
        <UInput
          v-if="totalCount > 0"
          v-model="searchQuery"
          data-testid="note-search"
          placeholder="Search notes..."
          aria-label="Search notes"
          icon="i-heroicons-magnifying-glass"
          size="sm"
          class="w-48"
        />

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
    </div>

    <!-- Empty state (no notes at all) -->
    <div
      v-if="totalCount === 0"
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

    <!-- No search results -->
    <div
      v-else-if="orderedNotes.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 mx-auto mb-3 opacity-50"
      />
      <p>No notes match "{{ searchQuery }}"</p>
    </div>

    <!-- Notes by category (ordered) -->
    <div
      v-else
      class="space-y-6"
    >
      <!-- Each category gets its own section -->
      <div
        v-for="[categoryKey, categoryNotes] in orderedNotes"
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

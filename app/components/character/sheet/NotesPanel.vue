<!-- app/components/character/sheet/NotesPanel.vue -->
<script setup lang="ts">
import type { CharacterNote } from '~/types/character'

/**
 * Notes panel for character sheet
 *
 * Displays character notes organized by category (backstory, session notes, etc.)
 * Notes are passed as an object keyed by category name.
 */
const props = defineProps<{
  notes: Record<string, CharacterNote[]>
}>()
</script>

<template>
  <div>
    <div
      v-if="Object.keys(props.notes).length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No notes yet
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <!-- Each category gets its own section -->
      <div
        v-for="(categoryNotes, categoryKey) in props.notes"
        :key="categoryKey"
        class="space-y-3"
      >
        <!-- Category header - use category_label from first note -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          {{ categoryNotes[0]?.category_label || categoryKey }}
        </h3>

        <!-- Notes within this category -->
        <div class="space-y-4">
          <div
            v-for="note in categoryNotes"
            :key="note.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <!-- Note title if present -->
            <h4
              v-if="note.title"
              class="font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              {{ note.title }}
            </h4>
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

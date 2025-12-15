<!-- app/components/dm-screen/NotePopover.vue -->
<script setup lang="ts">
interface Props {
  note?: string
}

const props = withDefaults(defineProps<Props>(), {
  note: ''
})

const emit = defineEmits<{
  'update:note': [text: string]
}>()

const MAX_NOTE_LENGTH = 100

// Ensure note is always a string
const noteString = computed(() => {
  const n = props.note
  if (typeof n === 'string') return n
  return ''
})

const noteText = ref(noteString.value)
const notePopoverOpen = ref(false)

const hasNote = computed(() => noteString.value.trim() !== '')

// Sync with prop when it changes
watch(noteString, (newNote) => {
  noteText.value = newNote
})

function saveNote() {
  const trimmed = (noteText.value ?? '').trim()
  if (trimmed !== noteString.value) {
    emit('update:note', trimmed)
  }
  notePopoverOpen.value = false
}

function cancelNote() {
  noteText.value = noteString.value
  notePopoverOpen.value = false
}

function handleNoteKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cancelNote()
  }
}
</script>

<template>
  <!-- Note badge (when note exists) -->
  <UPopover
    v-if="hasNote"
    v-model:open="notePopoverOpen"
    :ui="{ content: 'p-3' }"
  >
    <UBadge
      color="neutral"
      variant="subtle"
      size="md"
      class="cursor-pointer hover:ring-2 hover:ring-neutral-500/50"
      data-testid="note-badge"
      @click.stop
    >
      <UIcon
        name="i-heroicons-chat-bubble-bottom-center-text"
        class="w-3 h-3 mr-1"
      />
      <span class="truncate max-w-[120px]">{{ noteString }}</span>
    </UBadge>
    <template #content>
      <div
        class="space-y-2 min-w-[250px]"
        @click.stop
      >
        <div class="text-sm font-medium">
          DM Note
        </div>
        <UTextarea
          v-model="noteText"
          placeholder="Add a note..."
          :maxlength="MAX_NOTE_LENGTH"
          :rows="2"
          autofocus
          class="w-full"
          data-testid="note-input"
          @keydown="handleNoteKeydown"
        />
        <div class="flex items-center justify-between">
          <span class="text-xs text-neutral-400">{{ noteText.length }}/{{ MAX_NOTE_LENGTH }}</span>
          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="ghost"
              @click="cancelNote"
            >
              Cancel
            </UButton>
            <UButton
              size="xs"
              color="primary"
              @click="saveNote"
            >
              Save
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>

  <!-- Add note button (when no note exists) -->
  <UPopover
    v-else
    v-model:open="notePopoverOpen"
    :ui="{ content: 'p-3' }"
  >
    <button
      class="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center gap-1"
      data-testid="add-note-btn"
      @click.stop
    >
      <UIcon
        name="i-heroicons-plus"
        class="w-3 h-3"
      />
      Add note
    </button>
    <template #content>
      <div
        class="space-y-2 min-w-[250px]"
        @click.stop
      >
        <div class="text-sm font-medium">
          DM Note
        </div>
        <UTextarea
          v-model="noteText"
          placeholder="Add a note..."
          :maxlength="MAX_NOTE_LENGTH"
          :rows="2"
          autofocus
          class="w-full"
          data-testid="note-input"
          @keydown="handleNoteKeydown"
        />
        <div class="flex items-center justify-between">
          <span class="text-xs text-neutral-400">{{ noteText.length }}/{{ MAX_NOTE_LENGTH }}</span>
          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="ghost"
              @click="cancelNote"
            >
              Cancel
            </UButton>
            <UButton
              size="xs"
              color="primary"
              @click="saveNote"
            >
              Save
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

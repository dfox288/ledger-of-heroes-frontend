<!-- app/components/character/sheet/NoteEditModal.vue -->
<script setup lang="ts">
/**
 * Note Edit/Create Modal
 *
 * Dual-mode modal for creating new notes or editing existing ones.
 * - Create mode: No note prop, category selectable
 * - Edit mode: Note prop provided, category locked
 *
 * Categories requiring title: backstory, custom
 * Categories not requiring title: personality_trait, ideal, bond, flaw
 */
import type { CharacterNote } from '~/types/character'

/** Constant for custom category selection value */
const CUSTOM_CATEGORY_VALUE = '__custom__' as const

/**
 * Predefined note categories - common D&D note types
 * Users can also create custom categories via the "Custom..." option
 */
const CATEGORIES = [
  // Character traits (from background)
  { value: 'personality_trait', label: 'Personality Trait', requiresTitle: false },
  { value: 'ideal', label: 'Ideal', requiresTitle: false },
  { value: 'bond', label: 'Bond', requiresTitle: false },
  { value: 'flaw', label: 'Flaw', requiresTitle: false },
  // Character background
  { value: 'backstory', label: 'Backstory', requiresTitle: true },
  { value: 'appearance', label: 'Appearance', requiresTitle: false },
  // Campaign & session tracking
  { value: 'campaign', label: 'Campaign', requiresTitle: true },
  { value: 'session', label: 'Session', requiresTitle: true },
  { value: 'quest', label: 'Quest', requiresTitle: true },
  // World building
  { value: 'npc', label: 'NPC', requiresTitle: true },
  { value: 'location', label: 'Location', requiresTitle: true },
  { value: 'lore', label: 'Lore', requiresTitle: true },
  { value: 'item', label: 'Item', requiresTitle: true },
  // Custom - shows text input for user-defined category
  { value: CUSTOM_CATEGORY_VALUE, label: 'Custom...', requiresTitle: true }
]

/** Convert string to snake_case for custom categories */
function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Spaces to underscores
}

export interface NotePayload {
  category?: string
  title?: string
  content: string
}

const props = defineProps<{
  open: boolean
  note?: CharacterNote
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [payload: NotePayload]
}>()

/** Local state */
const localCategory = ref('session')
const localTitle = ref('')
const localContent = ref('')
const customCategoryName = ref('')

/** Computed: Whether we're in edit mode */
const isEditMode = computed(() => !!props.note)

/** Computed: Modal title */
const modalTitle = computed(() => isEditMode.value ? 'Edit Note' : 'Add Note')

/** Computed: Whether custom category input is shown */
const isCustomCategory = computed(() => localCategory.value === CUSTOM_CATEGORY_VALUE)

/** Computed: Whether current category requires a title */
const requiresTitle = computed(() => {
  if (isCustomCategory.value) return true
  const cat = CATEGORIES.find(c => c.value === localCategory.value)
  return cat?.requiresTitle ?? false
})

/** Computed: The actual category value to send to API */
const effectiveCategory = computed(() => {
  if (isCustomCategory.value) {
    return toSnakeCase(customCategoryName.value)
  }
  return localCategory.value
})

/** Computed: Whether save is allowed */
const canSave = computed(() => {
  if (props.loading) return false
  if (localContent.value.trim().length === 0) return false
  if (requiresTitle.value && localTitle.value.trim().length === 0) return false
  // Custom category requires a valid category name
  if (isCustomCategory.value && toSnakeCase(customCategoryName.value).length === 0) return false
  return true
})

/** Handle cancel - reset transient state */
function handleCancel() {
  customCategoryName.value = ''
  emit('update:open', false)
}

/** Handle save */
function handleSave() {
  if (!canSave.value) return

  const payload: NotePayload = {
    content: localContent.value.trim()
  }

  // Include title only if it has content
  if (localTitle.value.trim().length > 0) {
    payload.title = localTitle.value.trim()
  }

  // Include category only in create mode (use effectiveCategory for custom support)
  if (!isEditMode.value) {
    payload.category = effectiveCategory.value
  }

  emit('save', payload)
}

/** Handle keydown for Enter submission and Escape cancel */
function handleKeydown(event: KeyboardEvent) {
  // Escape key cancels the modal
  if (event.key === 'Escape') {
    handleCancel()
    return
  }
  // Don't submit on Enter in textarea
  if ((event.target as HTMLElement).tagName === 'TEXTAREA') return
  if (event.key === 'Enter' && canSave.value) {
    handleSave()
  }
}

/** Initialize state from note */
function initializeState() {
  if (props.note) {
    // Edit mode - populate from note
    // Check if category is in predefined list, otherwise treat as custom
    const isPredefined = CATEGORIES.some(c => c.value === props.note!.category)
    if (isPredefined) {
      localCategory.value = props.note.category
      customCategoryName.value = ''
    } else {
      localCategory.value = CUSTOM_CATEGORY_VALUE
      customCategoryName.value = props.note.category_label ?? props.note.category
    }
    localTitle.value = props.note.title ?? ''
    localContent.value = props.note.content
  } else {
    // Create mode - reset to defaults (session is a good default)
    localCategory.value = 'session'
    localTitle.value = ''
    localContent.value = ''
    customCategoryName.value = ''
  }
}

/** Reset state when modal opens */
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    initializeState()
  }
}, { immediate: true })
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
    @keydown="handleKeydown"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          :name="isEditMode ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'"
          class="w-5 h-5 text-primary-500"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ modalTitle }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Category Select (only in create mode) -->
        <div v-if="!isEditMode">
          <label
            for="note-category"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <USelectMenu
            id="note-category"
            v-model="localCategory"
            data-testid="category-select"
            :items="CATEGORIES"
            value-key="value"
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- Custom Category Name Input (when "Custom..." is selected) -->
        <div v-if="!isEditMode && isCustomCategory">
          <label
            for="custom-category-name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category Name
            <span class="text-error-500">*</span>
          </label>
          <UInput
            id="custom-category-name"
            v-model="customCategoryName"
            data-testid="custom-category-input"
            type="text"
            placeholder="e.g., Party Members, Important Dates"
            :disabled="loading"
            class="w-full"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Will be saved as: {{ effectiveCategory || '...' }}
          </p>
        </div>

        <!-- Category Display (in edit mode) -->
        <div v-else-if="isEditMode">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <p class="text-gray-600 dark:text-gray-400">
            {{ note?.category_label }}
          </p>
        </div>

        <!-- Title Input (shown when required or has content) -->
        <div v-if="requiresTitle || localTitle.length > 0 || isEditMode">
          <label
            for="note-title"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title
            <span
              v-if="requiresTitle"
              class="text-error-500"
            >*</span>
          </label>
          <UInput
            id="note-title"
            v-model="localTitle"
            data-testid="title-input"
            type="text"
            placeholder="Note title"
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- Content Textarea -->
        <div>
          <label
            for="note-content"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Content
            <span class="text-error-500">*</span>
          </label>
          <UTextarea
            id="note-content"
            v-model="localContent"
            data-testid="content-textarea"
            :rows="6"
            placeholder="Write your note..."
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- API Error -->
        <UAlert
          v-if="error"
          color="error"
          icon="i-heroicons-exclamation-triangle"
          :title="error"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="save-btn"
          color="primary"
          :disabled="!canSave"
          :loading="loading"
          @click="handleSave"
        >
          {{ isEditMode ? 'Save Changes' : 'Add Note' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

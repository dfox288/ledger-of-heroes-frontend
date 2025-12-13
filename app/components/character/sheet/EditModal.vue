<!-- app/components/character/sheet/EditModal.vue -->
<script setup lang="ts">
/**
 * Character Edit Modal
 *
 * Modal for editing basic character information:
 * - Name (text input)
 * - Alignment (dropdown)
 * - Portrait (drag-and-drop upload)
 *
 * Portrait changes are handled separately from name/alignment
 * because they use different API endpoints (multipart vs JSON).
 */

/** Alignment options from D&D 5e */
const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
  'Unaligned'
] as const

interface CharacterData {
  id: number
  name: string
  /** Alignment can be a specific D&D alignment, 'Unaligned', or null */
  alignment: string | null
  portrait: {
    original: string | null
    thumb: string | null
    medium: string | null
    /**
     * Whether this is a user-uploaded portrait vs a generated/default one.
     * Currently used by backend for tracking; may be used later for UI
     * differentiation (e.g., showing "custom" badge or different remove behavior).
     */
    is_uploaded: boolean
  } | null
}

export interface EditPayload {
  name: string
  alignment: string | null
  portraitFile: File | null
}

const props = defineProps<{
  open: boolean
  character: CharacterData | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [payload: EditPayload]
  'remove-portrait': []
}>()

/** Local state for name input */
const localName = ref('')

/** Local state for alignment selection */
const localAlignment = ref<string | null>(null)

/** Selected file for portrait upload */
const selectedFile = ref<File | null>(null)

/** Drag state for visual feedback */
const isDragging = ref(false)

/** Counter to fix drag enter/leave flicker on child elements */
const dragCounter = ref(0)

/** Reference to hidden file input */
const fileInputRef = ref<HTMLInputElement | null>(null)

/** Max file size (2MB as per backend constraints) */
const MAX_FILE_SIZE = 2 * 1024 * 1024

/** Accepted image types */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** File validation error message */
const fileError = ref<string | null>(null)

/** Alignment options for dropdown (with "None" option) */
const alignmentOptions = computed((): { value: string | null, label: string }[] => [
  { value: null, label: 'No Alignment' },
  ...ALIGNMENTS.map(a => ({ value: a as string, label: a }))
])

/**
 * Get the current portrait source URL
 */
const currentPortraitSrc = computed(() => {
  if (!props.character?.portrait) return null
  return props.character.portrait.thumb || props.character.portrait.medium || null
})

/**
 * Check if name has changed from original
 */
const nameChanged = computed(() => {
  return localName.value.trim() !== (props.character?.name ?? '')
})

/**
 * Check if alignment has changed from original
 */
const alignmentChanged = computed(() => {
  return localAlignment.value !== (props.character?.alignment ?? null)
})

/**
 * Whether any changes have been made
 */
const hasChanges = computed(() => {
  return nameChanged.value || alignmentChanged.value || selectedFile.value !== null
})

/**
 * Whether the save button should be enabled
 * - Must have changes
 * - Name must not be empty
 * - Not currently loading
 */
const canSave = computed(() => {
  if (props.loading) return false
  if (!hasChanges.value) return false
  if (localName.value.trim().length === 0) return false
  return true
})

/**
 * Process a file (from input or drop)
 */
async function processFile(file: File) {
  fileError.value = null

  // Check file type
  if (!ACCEPTED_TYPES.includes(file.type)) {
    fileError.value = 'Please upload a JPEG, PNG, or WebP image'
    return
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    fileError.value = 'File too large (max 2MB)'
    return
  }

  selectedFile.value = file
}

/**
 * Handle file selection from input
 */
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    selectedFile.value = null
    return
  }

  await processFile(file)
}

/**
 * Handle drag enter/over
 */
function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  if (props.loading) return
  dragCounter.value++
  isDragging.value = true
}

/**
 * Handle drag leave
 */
function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

/**
 * Handle file drop
 */
async function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragCounter.value = 0
  isDragging.value = false

  if (props.loading) return

  const file = event.dataTransfer?.files[0]
  if (file) {
    await processFile(file)
  }
}

/**
 * Open file picker when drop zone is clicked
 */
function openFilePicker() {
  if (props.loading) return
  fileInputRef.value?.click()
}

/**
 * Clear selected file
 */
function clearSelectedFile() {
  selectedFile.value = null
  fileError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * Handle remove portrait button click
 */
function handleRemovePortrait() {
  emit('remove-portrait')
}

/**
 * Handle save button click
 */
function handleSave() {
  if (!canSave.value) return

  emit('save', {
    name: localName.value.trim(),
    alignment: localAlignment.value,
    portraitFile: selectedFile.value
  })
}

/**
 * Handle cancel button click
 */
function handleCancel() {
  emit('update:open', false)
}

/**
 * Handle keydown events for Enter key submission
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && canSave.value) {
    handleSave()
  }
}

/**
 * Reset state when modal opens
 */
watch(() => props.open, (isOpen) => {
  if (isOpen && props.character) {
    localName.value = props.character.name
    localAlignment.value = props.character.alignment
    selectedFile.value = null
    fileError.value = null
    isDragging.value = false
    dragCounter.value = 0
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
})
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
    @keydown="handleKeydown"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Character
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Name Input -->
        <div>
          <label
            for="character-name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name
          </label>
          <UInput
            id="character-name"
            v-model="localName"
            data-testid="name-input"
            type="text"
            placeholder="Character name"
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- Alignment Select -->
        <div>
          <label
            for="character-alignment"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Alignment
          </label>
          <USelectMenu
            v-model="localAlignment"
            data-testid="alignment-select"
            :items="alignmentOptions"
            value-key="value"
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- Portrait Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Portrait
          </label>

          <!-- Current Portrait Preview (if exists and no new file selected) -->
          <div
            v-if="currentPortraitSrc && !selectedFile"
            class="mb-3 flex items-center gap-4"
          >
            <img
              :src="currentPortraitSrc"
              alt="Current portrait"
              class="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            >
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-600 dark:text-gray-400">Current portrait</span>
              <UButton
                data-testid="remove-portrait-btn"
                color="error"
                variant="soft"
                size="xs"
                icon="i-heroicons-trash"
                :disabled="loading"
                @click="handleRemovePortrait"
              >
                Remove
              </UButton>
            </div>
          </div>

          <!-- Hidden file input -->
          <input
            ref="fileInputRef"
            data-testid="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleFileSelect"
          >

          <!-- Drop zone / File picker -->
          <div
            data-testid="drop-zone"
            class="h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors"
            :class="[
              loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : selectedFile
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            ]"
            @click="openFilePicker"
            @dragenter="handleDragEnter"
            @dragover="handleDragEnter"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <template v-if="selectedFile">
              <UIcon
                name="i-heroicons-photo"
                class="w-8 h-8 text-green-500 mb-2"
              />
              <p class="text-sm font-medium text-green-700 dark:text-green-400">
                {{ selectedFile.name }}
              </p>
              <button
                type="button"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1 hover:text-error-500 dark:hover:text-error-400"
                @click.stop="clearSelectedFile"
              >
                Click to remove
              </button>
            </template>
            <template v-else>
              <UIcon
                name="i-heroicons-photo"
                class="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2"
                :class="{ 'text-primary-500': isDragging }"
              />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-medium text-primary-600 dark:text-primary-400">Click to upload</span>
                or drag and drop
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPEG, PNG, or WebP (max 2MB)
              </p>
            </template>
          </div>

          <!-- File Error -->
          <p
            v-if="fileError"
            class="mt-2 text-sm text-error-600 dark:text-error-400"
          >
            {{ fileError }}
          </p>
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
          Save Changes
        </UButton>
      </div>
    </template>
  </UModal>
</template>

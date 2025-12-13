<!-- app/components/character/ImportModal.vue -->
<script setup lang="ts">
/**
 * Character Import Modal
 *
 * Modal for importing a character from JSON.
 * Supports two input methods:
 * - File upload (.json files)
 * - Paste JSON directly
 *
 * Validates structure before emitting import event.
 */

/** Expected structure of import data */
interface ImportData {
  format_version: string
  character: {
    public_id: string
    name: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'import': [data: ImportData]
}>()

/** Active tab: 'upload' or 'paste' */
const activeTab = ref('upload')

/** Selected file from file input */
const selectedFile = ref<File | null>(null)

/** Pasted JSON text */
const pastedJson = ref('')

/** Validation error message */
const error = ref<string | null>(null)

/** Successfully parsed data ready for import */
const parsedData = ref<ImportData | null>(null)

/** Drag state for visual feedback */
const isDragging = ref(false)

/** Counter to fix drag enter/leave flicker on child elements */
const dragCounter = ref(0)

/** Reference to hidden file input */
const fileInputRef = ref<HTMLInputElement | null>(null)

/** Max file size (10MB) to prevent browser crashes */
const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Tab items for UTabs */
const tabItems = [
  { label: 'Upload File', slot: 'upload', icon: 'i-heroicons-arrow-up-tray' },
  { label: 'Paste JSON', slot: 'paste', icon: 'i-heroicons-clipboard-document' }
]

/**
 * Whether the Import button should be enabled
 * Requires valid parsed data with no errors
 */
const canImport = computed(() => {
  return parsedData.value !== null && error.value === null
})

/**
 * Process a file (from input or drop)
 */
async function processFile(file: File) {
  // Clear previous state first
  error.value = null
  parsedData.value = null

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'File too large (max 10MB)'
    return
  }

  selectedFile.value = file

  try {
    const text = await file.text()
    parseAndValidate(text)
  } catch {
    error.value = 'Failed to read file'
    parsedData.value = null
  }
}

/**
 * Handle file selection from input
 */
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    selectedFile.value = null
    parsedData.value = null
    return
  }

  await processFile(file)
}

/**
 * Handle drag enter/over
 * Uses counter to avoid flicker when hovering child elements
 */
function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

/**
 * Handle drag leave
 * Only sets isDragging false when counter reaches 0
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

  const file = event.dataTransfer?.files[0]
  if (file && (file.name.endsWith('.json') || file.type === 'application/json')) {
    await processFile(file)
  } else if (file) {
    error.value = 'Please drop a .json file'
  }
}

/**
 * Open file picker when drop zone is clicked
 */
function openFilePicker() {
  fileInputRef.value?.click()
}

/**
 * Validate and parse JSON string
 * Called when pasting JSON or after file read
 */
function validateAndParse() {
  if (!pastedJson.value.trim()) {
    error.value = null
    parsedData.value = null
    return
  }
  parseAndValidate(pastedJson.value)
}

/**
 * Parse JSON and validate structure
 */
function parseAndValidate(jsonString: string) {
  error.value = null
  parsedData.value = null

  // Try to parse JSON
  let data: unknown
  try {
    data = JSON.parse(jsonString)
  } catch {
    error.value = 'Invalid JSON format'
    return
  }

  // Validate structure
  if (typeof data !== 'object' || data === null) {
    error.value = 'Invalid JSON format'
    return
  }

  const obj = data as Record<string, unknown>

  if (!obj.format_version) {
    error.value = 'Missing format version'
    return
  }

  if (!obj.character || typeof obj.character !== 'object') {
    error.value = 'Missing character data'
    return
  }

  // Validate character.name exists
  const char = obj.character as Record<string, unknown>
  if (!char.name || typeof char.name !== 'string') {
    error.value = 'Character name is required'
    return
  }

  // Valid!
  parsedData.value = obj as ImportData
}

/**
 * Handle Import button click
 */
function handleImport() {
  if (!parsedData.value) return

  emit('import', parsedData.value)
  emit('update:open', false)
}

/**
 * Handle Cancel button click
 */
function handleCancel() {
  emit('update:open', false)
}

/**
 * Reset state when modal opens
 */
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'upload'
    selectedFile.value = null
    pastedJson.value = ''
    error.value = null
    parsedData.value = null
    isDragging.value = false
    dragCounter.value = 0
    // Reset file input to allow re-selecting same file
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
})

/**
 * Watch pasted JSON for changes and validate
 */
watch(pastedJson, () => {
  validateAndParse()
})

/**
 * Clear state when switching tabs to avoid confusion
 */
watch(activeTab, () => {
  // Reset all input state when tab changes
  selectedFile.value = null
  pastedJson.value = ''
  error.value = null
  parsedData.value = null
  // Reset file input to allow re-selecting same file
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
})
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Import Character
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Tabs -->
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          class="w-full"
        >
          <!-- Upload File Tab -->
          <template #upload>
            <div class="pt-4">
              <!-- Hidden file input -->
              <input
                ref="fileInputRef"
                data-testid="file-input"
                type="file"
                accept=".json"
                class="hidden"
                @change="handleFileSelect"
              >

              <!-- Clickable/droppable zone -->
              <div
                class="h-[140px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
                :class="isDragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : selectedFile
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                @click="openFilePicker"
                @dragenter="handleDragEnter"
                @dragover="handleDragEnter"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
              >
                <template v-if="selectedFile">
                  <UIcon
                    name="i-heroicons-document-check"
                    class="w-10 h-10 text-green-500 mb-2"
                  />
                  <p class="text-sm font-medium text-green-700 dark:text-green-400">
                    {{ selectedFile.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to change file
                  </p>
                </template>
                <template v-else>
                  <UIcon
                    name="i-heroicons-document-arrow-up"
                    class="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2"
                    :class="{ 'text-primary-500': isDragging }"
                  />
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-medium text-primary-600 dark:text-primary-400">Click to upload</span>
                    or drag and drop
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JSON files only
                  </p>
                </template>
              </div>
            </div>
          </template>

          <!-- Paste JSON Tab -->
          <template #paste>
            <div class="pt-4">
              <UTextarea
                v-model="pastedJson"
                data-testid="json-input"
                placeholder="Paste character JSON here..."
                :rows="6"
                class="font-mono text-sm w-full"
              />
            </div>
          </template>
        </UTabs>

        <!-- Error message -->
        <UAlert
          v-if="error"
          color="error"
          icon="i-heroicons-exclamation-triangle"
          :title="error"
        />

        <!-- Success preview -->
        <div
          v-if="parsedData && !error"
          class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <UIcon
            name="i-heroicons-check-circle"
            class="w-5 h-5"
          />
          <span>Ready to import: <strong>{{ parsedData.character.name }}</strong></span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="import-btn"
          color="primary"
          :disabled="!canImport"
          @click="handleImport"
        >
          Import
        </UButton>
      </div>
    </template>
  </UModal>
</template>

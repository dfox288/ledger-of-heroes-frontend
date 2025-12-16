<!-- app/components/dm-screen/LoadPresetModal.vue -->
<script setup lang="ts">
import type { EncounterPreset } from '~/types/dm-screen'

const props = defineProps<{
  presets: EncounterPreset[]
}>()

const open = defineModel<boolean>('open', { default: false })

// Sort presets by date (newest first)
const sortedPresets = computed(() =>
  [...props.presets].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
)

const emit = defineEmits<{
  load: [presetId: number]
  delete: [presetId: number]
  rename: [presetId: number, newName: string]
}>()

const confirmDeleteId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const editingName = ref('')
const editInput = ref<HTMLInputElement | null>(null)

function handleLoad(preset: EncounterPreset) {
  emit('load', preset.id)
  handleClose()
}

function handleDelete(presetId: number) {
  emit('delete', presetId)
  confirmDeleteId.value = null
}

function handleClose() {
  open.value = false
  confirmDeleteId.value = null
  editingId.value = null
}

function startEditing(preset: EncounterPreset) {
  editingId.value = preset.id
  editingName.value = preset.name
  nextTick(() => editInput.value?.focus())
}

function cancelEditing() {
  editingId.value = null
  editingName.value = ''
}

function saveEditing(presetId: number) {
  const trimmedName = editingName.value.trim()
  if (trimmedName.length > 0) {
    emit('rename', presetId, trimmedName)
  }
  cancelEditing()
}

function handleEditKeydown(event: KeyboardEvent, presetId: number) {
  if (event.key === 'Enter') {
    saveEditing(presetId)
  } else if (event.key === 'Escape') {
    cancelEditing()
  }
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  // Show year for presets older than 1 year
  if (date < oneYearAgo) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
}

function getMonsterCount(preset: EncounterPreset): number {
  return preset.monsters.reduce((sum, m) => sum + m.quantity, 0)
}
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <h3 class="text-lg font-semibold">
        Load Encounter Preset
      </h3>
    </template>

    <template #body>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <!-- Presets List -->
        <div
          v-for="preset in sortedPresets"
          :key="preset.id"
          data-testid="preset-item"
          class="group p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
        >
          <!-- Delete Confirmation -->
          <div
            v-if="confirmDeleteId === preset.id"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-error">Delete "{{ preset.name }}"?</span>
            <div class="flex gap-2">
              <UButton
                data-testid="confirm-delete-btn"
                size="xs"
                color="error"
                @click="handleDelete(preset.id)"
              >
                Delete
              </UButton>
              <UButton
                data-testid="cancel-delete-btn"
                size="xs"
                variant="ghost"
                @click="confirmDeleteId = null"
              >
                Cancel
              </UButton>
            </div>
          </div>

          <!-- Editing Mode -->
          <div
            v-else-if="editingId === preset.id"
            class="flex items-center gap-2"
          >
            <input
              ref="editInput"
              v-model="editingName"
              data-testid="rename-input"
              type="text"
              class="flex-1 px-2 py-1 text-sm border rounded border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              :maxlength="50"
              @keydown="handleEditKeydown($event, preset.id)"
              @blur="saveEditing(preset.id)"
            >
            <UButton
              data-testid="cancel-rename-btn"
              size="xs"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="cancelEditing"
            />
          </div>

          <!-- Normal View -->
          <div
            v-else
            class="flex items-center justify-between"
          >
            <div
              class="flex-1 cursor-pointer"
              @click="handleLoad(preset)"
            >
              <div class="font-medium flex items-center gap-2">
                {{ preset.name }}
                <UButton
                  data-testid="rename-btn"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-pencil"
                  class="opacity-0 group-hover:opacity-100 hover:opacity-100"
                  @click.stop="startEditing(preset)"
                />
              </div>
              <div class="text-sm text-neutral-500">
                {{ getMonsterCount(preset) }} monster{{ getMonsterCount(preset) !== 1 ? 's' : '' }}
                ·
                {{ formatDate(preset.created_at) }}
              </div>
              <!-- Monster list preview -->
              <div class="text-xs text-neutral-400 mt-1">
                {{ preset.monsters.map(m => `${m.quantity}× ${m.monster_name}`).join(', ') }}
              </div>
            </div>
            <div class="flex items-center gap-1 ml-2">
              <UButton
                data-testid="load-preset-btn"
                size="xs"
                variant="soft"
                @click="handleLoad(preset)"
              >
                Load
              </UButton>
              <UButton
                data-testid="delete-preset-btn"
                size="xs"
                variant="ghost"
                color="error"
                icon="i-heroicons-trash"
                @click="confirmDeleteId = preset.id"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="presets.length === 0"
          data-testid="empty-state"
          class="text-center py-8 text-neutral-500"
        >
          <UIcon
            name="i-heroicons-bookmark"
            class="w-8 h-8 mx-auto mb-2 opacity-50"
          />
          <p>No saved presets yet</p>
          <p class="text-sm mt-1">
            Save your current encounter to create a preset
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton
          data-testid="close-btn"
          color="neutral"
          variant="ghost"
          @click="handleClose"
        >
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>

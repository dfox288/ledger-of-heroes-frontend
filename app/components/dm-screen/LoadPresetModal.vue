<!-- app/components/dm-screen/LoadPresetModal.vue -->
<script setup lang="ts">
import type { EncounterPreset } from '~/types/dm-screen'

const props = defineProps<{
  open: boolean
  presets: EncounterPreset[]
}>()

// Sort presets by date (newest first)
const sortedPresets = computed(() =>
  [...props.presets].sort((a, b) => b.created_at - a.created_at)
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  'load': [preset: EncounterPreset]
  'delete': [presetId: string]
}>()

const confirmDeleteId = ref<string | null>(null)

function handleLoad(preset: EncounterPreset) {
  emit('load', preset)
  handleClose()
}

function handleDelete(presetId: string) {
  emit('delete', presetId)
  confirmDeleteId.value = null
}

function handleClose() {
  emit('update:open', false)
  confirmDeleteId.value = null
}

function formatDate(timestamp: number): string {
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
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
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
          class="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-colors"
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

          <!-- Normal View -->
          <div
            v-else
            class="flex items-center justify-between"
          >
            <div
              class="flex-1 cursor-pointer"
              @click="handleLoad(preset)"
            >
              <div class="font-medium">
                {{ preset.name }}
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

<!-- app/components/dm-screen/SavePresetModal.vue -->
<script setup lang="ts">
import type { PresetMonster } from '~/types/dm-screen'

defineProps<{
  monsters: PresetMonster[]
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  save: [name: string]
}>()

const presetName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const canSave = computed(() => presetName.value.trim().length > 0)

function handleSave() {
  if (!canSave.value) return
  emit('save', presetName.value.trim())
  handleClose()
}

function handleClose() {
  open.value = false
}

// Reset state and focus when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    presetName.value = ''
    nextTick(() => nameInput.value?.focus())
  }
})

// Handle Enter key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && canSave.value) {
    handleSave()
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <h3 class="text-lg font-semibold">
        Save Encounter Preset
      </h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Preset Name Input -->
        <UFormField label="Preset Name">
          <UInput
            ref="nameInput"
            v-model="presetName"
            data-testid="preset-name-input"
            placeholder="e.g., Goblin Patrol"
            :maxlength="50"
            class="w-full"
            @keydown="handleKeydown"
          />
        </UFormField>

        <!-- Preview of monsters being saved -->
        <div
          v-if="monsters.length > 0"
          class="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
        >
          <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Monsters in preset:
          </div>
          <ul class="space-y-1">
            <li
              v-for="monster in monsters"
              :key="monster.monster_id"
              class="text-sm flex items-center gap-2"
            >
              <span class="font-mono text-neutral-500">{{ monster.quantity }}×</span>
              <span>{{ monster.monster_name }}</span>
            </li>
          </ul>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="text-center py-4 text-neutral-500"
        >
          No monsters in current encounter
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="save-btn"
          color="primary"
          :disabled="!canSave || monsters.length === 0"
          @click="handleSave"
        >
          Save Preset
        </UButton>
      </div>
    </template>
  </UModal>
</template>

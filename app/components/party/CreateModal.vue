<!-- app/components/party/CreateModal.vue -->
<script setup lang="ts">
import type { PartyListItem } from '~/types'

const props = defineProps<{
  party: PartyListItem | null
  loading?: boolean
  error?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  save: [payload: { name: string, description: string | null }]
}>()

/** Local state */
const localName = ref('')
const localDescription = ref('')

/** Whether this is edit mode (party provided) */
const isEditMode = computed(() => props.party !== null)

/** Modal title */
const modalTitle = computed(() => isEditMode.value ? 'Edit Party' : 'New Party')

/** Button label */
const saveButtonLabel = computed(() => isEditMode.value ? 'Save' : 'Create')

/** Whether save is enabled */
const canSave = computed(() => {
  if (props.loading) return false
  return localName.value.trim().length > 0
})

function handleSave() {
  if (!canSave.value) return

  emit('save', {
    name: localName.value.trim(),
    description: localDescription.value.trim() || null
  })
}

function handleCancel() {
  open.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && canSave.value) {
    handleSave()
  }
}

/** Reset form when modal opens */
watch(open, (isOpen) => {
  if (isOpen) {
    if (props.party) {
      localName.value = props.party.name
      localDescription.value = props.party.description || ''
    } else {
      localName.value = ''
      localDescription.value = ''
    }
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    @keydown="handleKeydown"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ modalTitle }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Name Input -->
        <div>
          <label
            for="party-name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name <span class="text-error-500">*</span>
          </label>
          <UInput
            id="party-name"
            v-model="localName"
            data-testid="name-input"
            type="text"
            placeholder="Enter party name"
            :disabled="loading"
            class="w-full"
          />
        </div>

        <!-- Description Input -->
        <div>
          <label
            for="party-description"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <UTextarea
            id="party-description"
            v-model="localDescription"
            data-testid="description-input"
            placeholder="Optional description for your party"
            :disabled="loading"
            :rows="3"
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
          {{ saveButtonLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<!-- app/components/party/AddCharacterModal.vue -->
<script setup lang="ts">
import type { PartyCharacter } from '~/types'

const props = defineProps<{
  characters: PartyCharacter[]
  existingCharacterIds: number[]
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  add: [characterIds: number[]]
}>()

/** Search filter */
const searchQuery = ref('')

/** Selected character IDs */
const selectedIds = ref<Set<number>>(new Set())

/** Characters filtered by search and not already in party */
const filteredCharacters = computed(() => {
  const existingSet = new Set(props.existingCharacterIds)

  return props.characters
    .filter(c => !existingSet.has(c.id))
    .filter((c) => {
      if (!searchQuery.value.trim()) return true
      const query = searchQuery.value.toLowerCase()
      return c.name.toLowerCase().includes(query)
        || c.class_name.toLowerCase().includes(query)
    })
})

/** Whether add button is enabled */
const canAdd = computed(() => {
  if (props.loading) return false
  return selectedIds.value.size > 0
})

/** Toggle character selection */
function toggleSelection(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  // Force reactivity
  selectedIds.value = new Set(selectedIds.value)
}

/** Check if character is selected */
function isSelected(id: number): boolean {
  return selectedIds.value.has(id)
}

/** Handle add button click */
function handleAdd() {
  if (!canAdd.value) return
  emit('add', Array.from(selectedIds.value))
}

/** Handle cancel */
function handleCancel() {
  open.value = false
}

/** Reset state when modal opens */
watch(open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    selectedIds.value = new Set()
  }
})
</script>

<template>
  <UModal v-model:open="open">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Add Characters to Party
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Search Input -->
        <UInput
          v-model="searchQuery"
          placeholder="Search characters..."
          icon="i-heroicons-magnifying-glass"
          :disabled="loading"
        >
          <template
            v-if="searchQuery"
            #trailing
          >
            <UButton
              color="neutral"
              variant="link"
              icon="i-heroicons-x-mark"
              :padded="false"
              aria-label="Clear search"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>

        <!-- Character List -->
        <div
          v-if="filteredCharacters.length > 0"
          class="space-y-2 max-h-80 overflow-y-auto"
        >
          <div
            v-for="character in filteredCharacters"
            :key="character.id"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
            :class="[
              isSelected(character.id)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
            @click="toggleSelection(character.id)"
          >
            <!-- Checkbox -->
            <UCheckbox
              :model-value="isSelected(character.id)"
              @click.stop
              @update:model-value="toggleSelection(character.id)"
            />

            <!-- Portrait placeholder -->
            <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UIcon
                v-if="!character.portrait?.thumb"
                name="i-heroicons-user"
                class="w-5 h-5 text-gray-400"
              />
              <img
                v-else
                :src="character.portrait.thumb"
                :alt="character.name"
                class="w-10 h-10 rounded-full object-cover"
              >
            </div>

            <!-- Character Info -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white truncate">
                {{ character.name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ character.class_name }} {{ character.total_level }}
              </div>
              <!-- Party indicator -->
              <div
                v-if="character.parties && character.parties.length > 0"
                class="text-xs text-gray-400 dark:text-gray-500 mt-1"
              >
                Also in: {{ character.parties.map(p => p.name).join(', ') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          <UIcon
            name="i-heroicons-user-group"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>No characters available</p>
          <p class="text-sm">
            {{ searchQuery ? 'Try a different search' : 'Create characters first' }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center">
        <span
          v-if="selectedIds.size > 0"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          {{ selectedIds.size }} selected
        </span>
        <span v-else />

        <div class="flex gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="loading"
            @click="handleCancel"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            :disabled="!canAdd"
            :loading="loading"
            @click="handleAdd"
          >
            Add Selected
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<!-- app/pages/parties/[id]/index.vue -->
<script setup lang="ts">
import type { Party, PartyCharacter, CharacterSummary } from '~/types'
import { logger } from '~/utils/logger'

/**
 * Party Detail Page
 *
 * Shows party info and character management.
 */

const route = useRoute()
const partyId = computed(() => route.params.id as string)

const { apiFetch } = useApi()
const toast = useToast()

// Fetch party
const { data: partyResponse, pending, error, refresh } = await useAsyncData(
  `party-${partyId.value}`,
  () => apiFetch<{ data: Party }>(`/parties/${partyId.value}`)
)

const party = computed(() => partyResponse.value?.data)

// SEO
useSeoMeta({
  title: () => party.value ? `${party.value.name} - D&D 5e Compendium` : 'Loading...',
  description: () => party.value?.description || 'Manage your adventuring party'
})

// Edit modal state
const showEditModal = ref(false)
const isSaving = ref(false)
const saveError = ref<string | null>(null)

// Add character modal state
const showAddModal = ref(false)
const isAdding = ref(false)
const availableCharacters = ref<PartyCharacter[]>([])

// Delete confirmation
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// Remove character confirmation
const characterToRemove = ref<PartyCharacter | null>(null)
const isRemoving = ref(false)

/** Open edit modal */
function openEditModal() {
  saveError.value = null
  showEditModal.value = true
}

/** Handle party update */
async function handleSave(payload: { name: string, description: string | null }) {
  if (!party.value) return

  isSaving.value = true
  saveError.value = null

  try {
    await apiFetch(`/parties/${party.value.id}`, {
      method: 'PUT',
      body: payload
    })
    toast.add({ title: 'Party updated!', color: 'success' })
    showEditModal.value = false
    await refresh()
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    saveError.value = apiError.data?.message || 'Failed to save party'
    logger.error('Update party failed:', err)
  } finally {
    isSaving.value = false
  }
}

/** Handle party delete */
async function handleDelete() {
  if (!party.value) return

  isDeleting.value = true

  try {
    await apiFetch(`/parties/${party.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Party deleted', color: 'success' })
    await navigateTo('/parties')
  } catch (err) {
    logger.error('Delete party failed:', err)
    toast.add({ title: 'Failed to delete party', color: 'error' })
  } finally {
    isDeleting.value = false
  }
}

// Loading state for fetching characters
const isFetchingCharacters = ref(false)

/** Open add character modal */
async function openAddModal() {
  isFetchingCharacters.value = true

  try {
    // Fetch all user's characters
    const response = await apiFetch<{ data: CharacterSummary[] }>('/characters')
    // Transform to PartyCharacter shape
    availableCharacters.value = response.data.map(c => ({
      id: c.id,
      public_id: c.public_id,
      name: c.name,
      class_name: c.class?.name || 'Unknown',
      total_level: c.total_level,
      portrait: c.portrait?.thumb ? { thumb: c.portrait.thumb } : null,
      parties: []
    }))
    // Only open modal after successful fetch
    showAddModal.value = true
  } catch (err) {
    logger.error('Failed to fetch characters:', err)
    toast.add({ title: 'Failed to load characters', color: 'error' })
  } finally {
    isFetchingCharacters.value = false
  }
}

/** Handle add characters */
async function handleAddCharacters(characterIds: number[]) {
  if (!party.value) return

  isAdding.value = true

  // Add characters in parallel and track results
  const results = await Promise.allSettled(
    characterIds.map(id =>
      apiFetch(`/parties/${party.value!.id}/characters`, {
        method: 'POST',
        body: { character_id: id }
      })
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  if (failed === 0) {
    // All succeeded
    toast.add({
      title: `Added ${succeeded} character${succeeded > 1 ? 's' : ''} to party`,
      color: 'success'
    })
    showAddModal.value = false
  } else if (succeeded === 0) {
    // All failed
    logger.error('Add characters failed:', results)
    toast.add({
      title: 'Failed to add characters',
      color: 'error'
    })
  } else {
    // Partial success
    logger.error('Some characters failed to add:', results)
    toast.add({
      title: `Added ${succeeded} of ${characterIds.length} characters (${failed} failed)`,
      color: 'warning'
    })
    showAddModal.value = false
  }

  await refresh()
  isAdding.value = false
}

/** Confirm remove character */
function confirmRemove(characterId: number) {
  const character = party.value?.characters.find(c => c.id === characterId)
  if (character) {
    characterToRemove.value = character
  }
}

/** Handle remove character */
async function handleRemoveCharacter() {
  if (!party.value || !characterToRemove.value) return

  isRemoving.value = true

  try {
    await apiFetch(`/parties/${party.value.id}/characters/${characterToRemove.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Character removed from party', color: 'success' })
    characterToRemove.value = null
    await refresh()
  } catch (err) {
    logger.error('Remove character failed:', err)
    toast.add({ title: 'Failed to remove character', color: 'error' })
  } finally {
    isRemoving.value = false
  }
}

/** Get existing character IDs for filtering */
const existingCharacterIds = computed(() =>
  party.value?.characters.map(c => c.id) ?? []
)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Back Link -->
    <NuxtLink
      to="/parties"
      class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6"
    >
      <UIcon
        name="i-heroicons-arrow-left"
        class="w-4 h-4"
      />
      Back to Parties
    </NuxtLink>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-gray-400"
      />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load party"
      class="mb-6"
    >
      <template #actions>
        <UButton
          variant="soft"
          color="error"
          @click="() => refresh()"
        >
          Retry
        </UButton>
      </template>
    </UAlert>

    <!-- Party Content -->
    <template v-else-if="party">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ party.name }}
          </h1>
          <p
            v-if="party.description"
            class="mt-2 text-gray-600 dark:text-gray-400"
          >
            {{ party.description }}
          </p>
        </div>

        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-pencil"
            variant="soft"
            @click="openEditModal"
          >
            Edit
          </UButton>
          <UButton
            data-testid="dm-screen-link"
            :to="`/parties/${partyId}/dm-screen`"
            icon="i-heroicons-presentation-chart-bar"
            variant="soft"
            color="primary"
          >
            DM Screen
          </UButton>
          <UDropdownMenu
            :items="[[
              { label: 'Delete Party', icon: 'i-heroicons-trash', color: 'error' }
            ]]"
          >
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              color="neutral"
              variant="ghost"
            />
            <template #item="{ item }">
              <span
                class="flex items-center gap-2 text-error-500"
                @click="showDeleteConfirm = true"
              >
                <UIcon
                  :name="item.icon"
                  class="w-4 h-4"
                />
                {{ item.label }}
              </span>
            </template>
          </UDropdownMenu>
        </div>
      </div>

      <!-- Characters Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Characters ({{ party.characters.length }})
          </h2>
          <UButton
            icon="i-heroicons-plus"
            :loading="isFetchingCharacters"
            @click="openAddModal"
          >
            Add Character
          </UButton>
        </div>

        <PartyCharacterList
          :characters="party.characters"
          @remove="confirmRemove"
        />
      </div>
    </template>

    <!-- Edit Modal -->
    <PartyCreateModal
      v-model:open="showEditModal"
      :party="party ?? null"
      :loading="isSaving"
      :error="saveError"
      @save="handleSave"
    />

    <!-- Add Character Modal -->
    <PartyAddCharacterModal
      v-model:open="showAddModal"
      :characters="availableCharacters"
      :existing-character-ids="existingCharacterIds"
      :loading="isAdding"
      @add="handleAddCharacters"
    />

    <!-- Delete Party Confirmation -->
    <UModal
      :open="showDeleteConfirm"
      @update:open="showDeleteConfirm = $event"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Delete Party
        </h3>
      </template>

      <template #body>
        <p class="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{{ party?.name }}</strong>?
          This will remove the party but characters will not be deleted.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="isDeleting"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            :loading="isDeleting"
            @click="handleDelete"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Remove Character Confirmation -->
    <UModal
      :open="!!characterToRemove"
      @update:open="characterToRemove = null"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Remove Character
        </h3>
      </template>

      <template #body>
        <p class="text-gray-600 dark:text-gray-400">
          Remove <strong>{{ characterToRemove?.name }}</strong> from this party?
          The character will not be deleted.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="isRemoving"
            @click="characterToRemove = null"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            :loading="isRemoving"
            @click="handleRemoveCharacter"
          >
            Remove
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

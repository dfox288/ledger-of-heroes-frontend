<!-- app/pages/parties/index.vue -->
<script setup lang="ts">
import type { PartyListItem } from '~/types'
import { logger } from '~/utils/logger'

/**
 * Party List Page
 *
 * Displays user's parties with create/edit/delete actions.
 */

useSeoMeta({
  title: 'My Parties - D&D 5e Compendium',
  description: 'Manage your D&D 5e adventuring parties'
})

const { apiFetch } = useApi()
const toast = useToast()

// Fetch parties
const { data: partiesResponse, pending, error, refresh } = await useAsyncData(
  'parties-list',
  () => apiFetch<{ data: PartyListItem[] }>('/parties')
)

const parties = computed(() => partiesResponse.value?.data ?? [])

// Modal state
const showCreateModal = ref(false)
const editingParty = ref<PartyListItem | null>(null)
const isSaving = ref(false)
const saveError = ref<string | null>(null)

// Delete confirmation
const partyToDelete = ref<PartyListItem | null>(null)
const isDeleting = ref(false)

/** Open create modal */
function openCreateModal() {
  editingParty.value = null
  saveError.value = null
  showCreateModal.value = true
}

/** Open edit modal */
function openEditModal(party: PartyListItem) {
  editingParty.value = party
  saveError.value = null
  showCreateModal.value = true
}

/** Handle create/update save */
async function handleSave(payload: { name: string; description: string | null }) {
  isSaving.value = true
  saveError.value = null

  try {
    if (editingParty.value) {
      // Update existing
      await apiFetch(`/parties/${editingParty.value.id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Party updated!', color: 'success' })
    } else {
      // Create new
      const response = await apiFetch<{ data: PartyListItem }>('/parties', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Party created!', color: 'success' })
      // Navigate to new party
      await navigateTo(`/parties/${response.data.id}`)
      return
    }

    showCreateModal.value = false
    await refresh()
  } catch (err: unknown) {
    const apiError = err as { statusCode?: number; data?: { message?: string } }
    saveError.value = apiError.data?.message || 'Failed to save party'
    logger.error('Save party failed:', err)
  } finally {
    isSaving.value = false
  }
}

/** Confirm delete */
function confirmDelete(party: PartyListItem) {
  partyToDelete.value = party
}

/** Handle delete */
async function handleDelete() {
  if (!partyToDelete.value) return

  isDeleting.value = true

  try {
    await apiFetch(`/parties/${partyToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Party deleted', color: 'success' })
    partyToDelete.value = null
    await refresh()
  } catch (err) {
    logger.error('Delete party failed:', err)
    toast.add({ title: 'Failed to delete party', color: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          My Parties
        </h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          Manage your adventuring groups
        </p>
      </div>

      <UButton
        icon="i-heroicons-plus"
        size="lg"
        @click="openCreateModal"
      >
        New Party
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load parties"
      class="mb-6"
    >
      <template #actions>
        <UButton variant="soft" color="error" @click="refresh">
          Retry
        </UButton>
      </template>
    </UAlert>

    <!-- Party Grid -->
    <div
      v-else-if="parties.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <PartyCard
        v-for="party in parties"
        :key="party.id"
        :party="party"
        @edit="openEditModal(party)"
        @delete="confirmDelete(party)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-user-group"
        class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
      />
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
        No parties yet
      </h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Create your first party to start tracking your adventuring group
      </p>
      <UButton
        class="mt-6"
        icon="i-heroicons-plus"
        @click="openCreateModal"
      >
        New Party
      </UButton>
    </div>

    <!-- Create/Edit Modal -->
    <PartyCreateModal
      v-model:open="showCreateModal"
      :party="editingParty"
      :loading="isSaving"
      :error="saveError"
      @save="handleSave"
    />

    <!-- Delete Confirmation -->
    <UModal
      :open="!!partyToDelete"
      @update:open="partyToDelete = null"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Delete Party
        </h3>
      </template>

      <template #body>
        <p class="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{{ partyToDelete?.name }}</strong>?
          This will remove the party but characters will not be deleted.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="isDeleting"
            @click="partyToDelete = null"
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
  </div>
</template>

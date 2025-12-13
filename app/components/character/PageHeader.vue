<!-- app/components/character/PageHeader.vue -->
<script setup lang="ts">
/**
 * Self-contained Character Page Header
 *
 * Unified header for all character sub-pages (Overview, Inventory, Spells, etc.)
 * Fully self-contained - handles all state, modals, and API calls internally.
 *
 * Features:
 * - Back button (configurable destination)
 * - Play mode toggle (persisted to localStorage)
 * - Character info with portrait and inspiration glow
 * - Actions dropdown with all actions handled internally:
 *   - Inspiration toggle
 *   - Add Condition (with modal)
 *   - Level Up (with confirmation modal)
 *   - Edit Character (with modal)
 *   - Export Character
 *   - Revive (for dead characters)
 *
 * @example
 * <CharacterPageHeader
 *   :character="character"
 *   :is-spellcaster="isSpellcaster"
 *   @updated="refreshCharacter"
 * />
 */

import type { Character } from '~/types/character'
import type { Condition } from '~/types'
import type { EditPayload } from '~/components/character/sheet/EditModal.vue'
import { logger } from '~/utils/logger'

const props = withDefaults(defineProps<{
  character: Character
  isSpellcaster?: boolean
  /** Where back button navigates. Defaults to /characters */
  backTo?: string
  /** Back button label. Defaults to "Back to Characters" */
  backLabel?: string
}>(), {
  isSpellcaster: false,
  backTo: '/characters',
  backLabel: 'Back to Characters'
})

const emit = defineEmits<{
  /** Emitted when character data has changed and parent should refresh */
  updated: []
}>()

const { apiFetch } = useApi()
const toast = useToast()

// ============================================================================
// Play Mode (self-contained with localStorage)
// ============================================================================

const isPlayMode = ref(false)
// Use global key to sync with index.vue until it's refactored to use PageHeader
const playModeKey = 'character-play-mode'

onMounted(() => {
  const saved = localStorage.getItem(playModeKey)
  if (saved === 'true' && props.character.is_complete) {
    isPlayMode.value = true
  }
})

watch(isPlayMode, (newValue) => {
  localStorage.setItem(playModeKey, String(newValue))
})

// Disable play mode for draft characters
watch(() => props.character.is_complete, (isComplete) => {
  if (!isComplete && isPlayMode.value) {
    isPlayMode.value = false
  }
}, { immediate: true })

/** Expose play mode for parent components that need it */
defineExpose({ isPlayMode })

// ============================================================================
// Inspiration Toggle (self-contained)
// ============================================================================

const localHasInspiration = ref(false)
const isUpdatingInspiration = ref(false)

watch(() => props.character.has_inspiration, (hasInspiration) => {
  if (hasInspiration !== undefined && !isUpdatingInspiration.value) {
    localHasInspiration.value = hasInspiration
  }
}, { immediate: true })

const canToggleInspiration = computed(() => {
  return isPlayMode.value && !props.character.is_dead
})

async function handleToggleInspiration() {
  if (isUpdatingInspiration.value || !canToggleInspiration.value) return

  isUpdatingInspiration.value = true
  const oldValue = localHasInspiration.value
  const newValue = !oldValue
  localHasInspiration.value = newValue

  try {
    await apiFetch(`/characters/${props.character.id}`, {
      method: 'PATCH',
      body: { has_inspiration: newValue }
    })
    toast.add({
      title: newValue ? 'Inspiration granted!' : 'Inspiration spent',
      color: newValue ? 'warning' : 'neutral'
    })
  } catch (err) {
    localHasInspiration.value = oldValue
    logger.error('Failed to toggle inspiration:', err)
    toast.add({ title: 'Failed to update inspiration', color: 'error' })
  } finally {
    isUpdatingInspiration.value = false
  }
}

// ============================================================================
// Export (self-contained)
// ============================================================================

const isExporting = ref(false)

async function handleExport() {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const response = await apiFetch<{ data: unknown }>(`/characters/${props.character.public_id}/export`)
    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const filename = `${props.character.public_id}-${timestamp}.json`

    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.add({ title: 'Character exported', color: 'success' })
  } catch (err) {
    logger.error('Failed to export character:', err)
    toast.add({ title: 'Failed to export character', color: 'error' })
  } finally {
    isExporting.value = false
  }
}

// ============================================================================
// Revive (self-contained)
// ============================================================================

const isReviving = ref(false)

async function handleRevive() {
  if (isReviving.value || !props.character.is_dead) return
  isReviving.value = true

  try {
    await apiFetch(`/characters/${props.character.id}/revive`, {
      method: 'POST',
      body: { hit_points: 1, clear_exhaustion: true }
    })
    toast.add({
      title: 'Character revived!',
      description: `${props.character.name} has been brought back with 1 HP`,
      color: 'success'
    })
    emit('updated')
  } catch (err: unknown) {
    const error = err as { statusCode?: number, data?: { message?: string } }
    if (error.statusCode === 422) {
      toast.add({
        title: 'Cannot revive',
        description: error.data?.message || 'Character is not dead',
        color: 'warning'
      })
    } else {
      logger.error('Failed to revive character:', err)
      toast.add({ title: 'Failed to revive', color: 'error' })
    }
  } finally {
    isReviving.value = false
  }
}

// ============================================================================
// Level Up Modal (self-contained)
// ============================================================================

const showLevelUpModal = ref(false)

function handleLevelUpClick() {
  showLevelUpModal.value = true
}

// ============================================================================
// Add Condition Modal (self-contained)
// ============================================================================

const showAddConditionModal = ref(false)
const isAddingCondition = ref(false)

// Fetch available conditions
const { data: availableConditions } = useReferenceData<Condition>('/conditions')

function handleAddConditionClick() {
  showAddConditionModal.value = true
}

async function handleAddCondition(payload: { condition: string, source: string, duration: string, level?: number }) {
  if (isAddingCondition.value) return
  isAddingCondition.value = true

  try {
    await apiFetch(`/characters/${props.character.id}/conditions`, {
      method: 'POST',
      body: payload
    })
    toast.add({ title: 'Condition added', color: 'success' })
    emit('updated')
  } catch (err) {
    logger.error('Failed to add condition:', err)
    toast.add({ title: 'Failed to add condition', color: 'error' })
  } finally {
    isAddingCondition.value = false
  }
}

// ============================================================================
// Edit Character Modal (self-contained)
// ============================================================================

const showEditModal = ref(false)
const isEditing = ref(false)
const editError = ref<string | null>(null)

function handleEditClick() {
  editError.value = null
  showEditModal.value = true
}

async function handleEditSave(payload: EditPayload) {
  if (isEditing.value) return
  isEditing.value = true
  editError.value = null

  try {
    const hasNameChange = payload.name !== props.character.name
    const hasAlignmentChange = payload.alignment !== props.character.alignment

    if (hasNameChange || hasAlignmentChange) {
      await apiFetch(`/characters/${props.character.id}`, {
        method: 'PATCH',
        body: { name: payload.name, alignment: payload.alignment }
      })
    }

    if (payload.portraitFile) {
      const formData = new FormData()
      formData.append('file', payload.portraitFile)
      await apiFetch(`/characters/${props.character.id}/media/portrait`, {
        method: 'POST',
        body: formData
      })
    }

    showEditModal.value = false

    const changes: string[] = []
    if (hasNameChange || hasAlignmentChange) changes.push('details')
    if (payload.portraitFile) changes.push('portrait')
    const toastTitle = changes.length > 1
      ? 'Character details and portrait updated'
      : payload.portraitFile ? 'Portrait updated' : 'Character updated'

    toast.add({ title: toastTitle, color: 'success' })
    emit('updated')
  } catch (err: unknown) {
    const error = err as { statusCode?: number, data?: { message?: string } }
    if (error.statusCode === 422) {
      editError.value = error.data?.message || 'Validation failed'
    } else {
      logger.error('Failed to update character:', err)
      editError.value = 'Failed to update character. Please try again.'
    }
  } finally {
    isEditing.value = false
  }
}

async function handleRemovePortrait() {
  if (isEditing.value) return
  isEditing.value = true

  try {
    await apiFetch(`/characters/${props.character.id}/media/portrait`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Portrait removed', color: 'success' })
    emit('updated')
  } catch (err) {
    logger.error('Failed to remove portrait:', err)
    toast.add({ title: 'Failed to remove portrait', color: 'error' })
  } finally {
    isEditing.value = false
  }
}

// ============================================================================
// Computed Display Values
// ============================================================================

const displayCharacter = computed(() => ({
  ...props.character,
  has_inspiration: localHasInspiration.value
}))

const totalLevel = computed(() => {
  if (!props.character.classes?.length) return 1
  return props.character.classes.reduce((sum, c) => sum + (c.level || 0), 0)
})

const classesDisplay = computed(() => {
  if (!props.character.classes?.length) {
    return props.character.class?.name ?? 'No class'
  }
  return props.character.classes
    .filter(c => c.class !== null)
    .map((c) => {
      const className = c.class!.name
      const level = c.level
      const subclassName = c.subclass?.name
      return subclassName ? `${className} ${level} (${subclassName})` : `${className} ${level}`
    })
    .join(' / ') || 'No class'
})

const portraitSrc = computed(() => {
  if (!props.character.portrait) return null
  return props.character.portrait.thumb || props.character.portrait.medium || null
})

const portraitAriaLabel = computed(() => {
  if (!canToggleInspiration.value) return undefined
  const status = localHasInspiration.value ? 'active' : 'inactive'
  return `Toggle inspiration (currently ${status})`
})

// ============================================================================
// Actions Menu
// ============================================================================

const actionMenuItems = computed(() => {
  const items: Array<Array<{ label: string, icon: string, to?: string, onSelect?: () => void }>> = []

  // Play mode actions
  if (props.character.is_complete && isPlayMode.value) {
    const playModeActions: Array<{ label: string, icon: string, onSelect: () => void }> = []

    if (props.character.is_dead) {
      playModeActions.push({
        label: 'Revive Character',
        icon: 'i-heroicons-sparkles',
        onSelect: handleRevive
      })
    } else {
      playModeActions.push({
        label: 'Add Condition',
        icon: 'i-heroicons-exclamation-triangle',
        onSelect: handleAddConditionClick
      })
    }

    if (playModeActions.length > 0) {
      items.push(playModeActions)
    }
  }

  // Level up
  if (props.character.is_complete && totalLevel.value < 20) {
    items.push([{
      label: 'Level Up',
      icon: 'i-heroicons-arrow-trending-up',
      onSelect: handleLevelUpClick
    }])
  }

  // Draft: Continue editing
  if (!props.character.is_complete) {
    items.push([{
      label: 'Continue Editing',
      icon: 'i-heroicons-pencil',
      to: `/characters/${props.character.public_id}/edit`
    }])
  }

  // Edit character (complete only)
  if (props.character.is_complete) {
    items.push([{
      label: 'Edit Character',
      icon: 'i-heroicons-pencil-square',
      onSelect: handleEditClick
    }])
  }

  // Export (always)
  items.push([{
    label: 'Export Character',
    icon: 'i-heroicons-arrow-down-tray',
    onSelect: handleExport
  }])

  return items
})
</script>

<template>
  <div class="space-y-6">
    <!-- Top Bar: Back Link + Play Mode Toggle -->
    <div class="flex items-center justify-between">
      <UButton
        :to="backTo"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        {{ backLabel }}
      </UButton>

      <!-- Play Mode Toggle (only for complete characters) -->
      <div
        v-if="character.is_complete"
        class="flex items-center gap-2"
      >
        <span class="text-sm text-gray-500 dark:text-gray-400">Play Mode</span>
        <USwitch
          v-model="isPlayMode"
          data-testid="play-mode-toggle"
        />
      </div>
    </div>

    <!-- Character Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Portrait and Name Section -->
      <div class="flex items-center gap-4">
        <!-- Portrait - glows when inspired, clickable in play mode -->
        <div
          data-testid="portrait-container"
          :role="canToggleInspiration ? 'button' : undefined"
          :aria-label="portraitAriaLabel"
          :tabindex="canToggleInspiration ? 0 : -1"
          class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300"
          :class="{
            'inspiration-glow': displayCharacter.has_inspiration,
            'cursor-pointer hover:scale-105': canToggleInspiration
          }"
          @click="canToggleInspiration && handleToggleInspiration()"
          @keydown.enter.space.prevent="canToggleInspiration && handleToggleInspiration()"
        >
          <img
            v-if="portraitSrc"
            data-testid="portrait-image"
            :src="portraitSrc"
            :alt="`${character.name} portrait`"
            class="w-full h-full object-cover"
          >
          <UIcon
            v-else
            data-testid="portrait-fallback"
            name="i-heroicons-user-circle-solid"
            class="w-full h-full text-gray-400 dark:text-gray-600"
          />
        </div>

        <!-- Name and info -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ character.name }}
          </h1>
          <p class="mt-1 text-lg text-gray-600 dark:text-gray-400">
            <span v-if="character.race">{{ character.race.name }}<span v-if="character.size"> ({{ character.size }})</span></span>
            <span v-if="character.race && character.classes?.length"> &bull; </span>
            <span>{{ classesDisplay }}</span>
            <span v-if="character.background"> &bull; {{ character.background.name }}</span>
            <span v-if="character.alignment"> &bull; {{ character.alignment }}</span>
          </p>
        </div>
      </div>

      <!-- Right: Badges and actions -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Inspiration Badge -->
        <UBadge
          v-if="displayCharacter.has_inspiration"
          data-testid="inspiration-badge"
          color="warning"
          variant="solid"
          size="lg"
        >
          <UIcon
            name="i-heroicons-star-solid"
            class="w-4 h-4 mr-1"
          />
          Inspired
        </UBadge>

        <!-- Draft Badge -->
        <UBadge
          v-if="!character.is_complete"
          color="warning"
          variant="subtle"
          size="lg"
        >
          Draft
        </UBadge>

        <!-- Actions Dropdown -->
        <UDropdownMenu
          :items="actionMenuItems"
          :ui="{ content: 'min-w-40' }"
        >
          <UButton
            data-testid="actions-dropdown"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-heroicons-ellipsis-vertical"
            trailing-icon="i-heroicons-chevron-down"
          >
            Actions
          </UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Tab Navigation -->
    <CharacterTabNavigation
      :public-id="character.public_id"
      :is-spellcaster="isSpellcaster"
    />
  </div>

  <!-- Level Up Confirmation Modal -->
  <CharacterSheetLevelUpConfirmModal
    v-model:open="showLevelUpModal"
    :character-public-id="character.public_id"
    :current-level="totalLevel"
  />

  <!-- Add Condition Modal -->
  <CharacterSheetAddConditionModal
    v-model:open="showAddConditionModal"
    :available-conditions="availableConditions ?? []"
    @add="handleAddCondition"
  />

  <!-- Edit Character Modal -->
  <CharacterSheetEditModal
    v-model:open="showEditModal"
    :character="character"
    :loading="isEditing"
    :error="editError"
    @save="handleEditSave"
    @remove-portrait="handleRemovePortrait"
  />
</template>

<style scoped>
.inspiration-glow {
  box-shadow:
    0 0 10px 2px rgba(251, 191, 36, 0.6),
    0 0 20px 4px rgba(251, 191, 36, 0.4),
    0 0 30px 6px rgba(251, 191, 36, 0.2);
  border-color: rgb(251, 191, 36) !important;
  animation: inspiration-pulse 2s ease-in-out infinite;
}

@keyframes inspiration-pulse {
  0%, 100% {
    box-shadow:
      0 0 10px 2px rgba(251, 191, 36, 0.6),
      0 0 20px 4px rgba(251, 191, 36, 0.4),
      0 0 30px 6px rgba(251, 191, 36, 0.2);
  }
  50% {
    box-shadow:
      0 0 15px 4px rgba(251, 191, 36, 0.8),
      0 0 25px 6px rgba(251, 191, 36, 0.5),
      0 0 40px 10px rgba(251, 191, 36, 0.3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .inspiration-glow {
    animation: none;
  }
}
</style>

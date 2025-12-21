<!-- app/components/character/PageHeader.vue -->
<script setup lang="ts">
/**
 * Self-contained Character Page Header
 *
 * Unified header for all character sub-pages (Overview, Inventory, Spells, etc.)
 * Uses useCharacterPageActions composable for action handling.
 *
 * Features:
 * - Back button (configurable destination)
 * - Play mode toggle (persisted to localStorage)
 * - Character info with portrait and inspiration glow
 * - Actions dropdown with all actions handled via composable
 */

import type { Character } from '~/types/character'
import type { Condition } from '~/types'
import { storeToRefs } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import { useCharacterXp } from '~/composables/useCharacterXp'
import { useCharacterPageActions } from '~/composables/useCharacterPageActions'

const props = withDefaults(defineProps<{
  character: Character
  isSpellcaster?: boolean
  backTo?: string
  backLabel?: string
}>(), {
  isSpellcaster: false,
  backTo: '/characters',
  backLabel: 'Back to Characters'
})

const emit = defineEmits<{
  updated: []
}>()

const playStateStore = useCharacterPlayStateStore()

// ============================================================================
// Character Actions (via composable)
// ============================================================================

const characterRef = computed(() => props.character)

const {
  localHasInspiration,
  localName,
  isEditing,
  canToggleInspiration,
  toggleInspiration,
  exportCharacter,
  revive,
  editCharacter,
  removePortrait,
  addCondition
} = useCharacterPageActions(characterRef, {
  onUpdated: () => emit('updated')
})

// ============================================================================
// XP Management
// ============================================================================

const characterPublicId = computed(() => props.character.public_id)
const { xpData, updateXp } = useCharacterXp(characterPublicId)

const showXpEditModal = ref(false)
const isUpdatingXp = ref(false)
const toast = useToast()

function handleXpEditClick() {
  showXpEditModal.value = true
}

async function handleXpUpdate(newXp: number) {
  if (isUpdatingXp.value) return
  isUpdatingXp.value = true

  try {
    await updateXp(newXp)
    toast.add({ title: 'XP updated', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to update XP', color: 'error' })
  } finally {
    isUpdatingXp.value = false
  }
}

// ============================================================================
// Play Mode (via store)
// ============================================================================

const { isPlayMode } = storeToRefs(playStateStore)

watch(() => props.character.is_complete, (isComplete) => {
  if (!isComplete && isPlayMode.value) {
    playStateStore.setPlayMode(false)
  }
}, { immediate: true })

function handlePlayModeToggle(enabled: boolean) {
  playStateStore.setPlayMode(enabled)
}

// ============================================================================
// Modals
// ============================================================================

const showLevelUpModal = ref(false)
const showAddConditionModal = ref(false)
const showEditModal = ref(false)
const editError = ref<string | null>(null)

// Fetch available conditions
const { data: availableConditions } = useReferenceData<Condition>('/conditions')

function handleLevelUpClick() {
  showLevelUpModal.value = true
}

function handleAddConditionClick() {
  showAddConditionModal.value = true
}

function handleEditClick() {
  editError.value = null
  showEditModal.value = true
}

async function handleAddCondition(payload: { condition: string, source: string, duration: string, level?: number }) {
  await addCondition(payload)
}

async function handleEditSave(payload: Parameters<typeof editCharacter>[0]) {
  const result = await editCharacter(payload)
  if (result.success) {
    showEditModal.value = false
  } else {
    editError.value = result.error ?? null
  }
}

async function handleRemovePortrait() {
  await removePortrait()
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

    if (playStateStore.isDead) {
      playModeActions.push({
        label: 'Revive Character',
        icon: 'i-heroicons-sparkles',
        onSelect: revive
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
    onSelect: exportCharacter
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

      <div
        v-if="character.is_complete"
        class="flex items-center gap-2"
      >
        <span class="text-sm text-gray-500 dark:text-gray-400">Play Mode</span>
        <USwitch
          :model-value="isPlayMode"
          data-testid="play-mode-toggle"
          @update:model-value="handlePlayModeToggle"
        />
      </div>
    </div>

    <!-- Character Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Portrait and Name Section -->
      <div class="flex items-center gap-4">
        <!-- Portrait -->
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
          @click="canToggleInspiration && toggleInspiration()"
          @keydown.enter.space.prevent="canToggleInspiration && toggleInspiration()"
        >
          <img
            v-if="portraitSrc"
            data-testid="portrait-image"
            :src="portraitSrc"
            :alt="`${localName} portrait`"
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
            {{ localName }}
          </h1>
          <p class="mt-1 text-lg text-gray-600 dark:text-gray-400">
            <span v-if="character.race">{{ character.race.name }}<span v-if="character.size"> ({{ character.size }})</span></span>
            <span v-if="character.race && character.classes?.length"> &bull; </span>
            <span>{{ classesDisplay }}</span>
            <span v-if="character.background"> &bull; {{ character.background.name }}</span>
            <span v-if="character.alignment"> &bull; {{ character.alignment }}</span>
          </p>
          <!-- XP Progress Bar -->
          <CharacterSheetXpBar
            v-if="character.is_complete"
            :xp-data="xpData"
            :is-play-mode="isPlayMode"
            :character-id="character.public_id"
            @edit="handleXpEditClick"
          />
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

  <!-- XP Edit Modal -->
  <CharacterSheetXpEditModal
    v-model:open="showXpEditModal"
    :current-xp="xpData?.experience_points ?? 0"
    :next-level-xp="xpData?.next_level_xp ?? null"
    @apply="handleXpUpdate"
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

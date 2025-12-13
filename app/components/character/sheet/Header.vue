<!-- app/components/character/sheet/Header.vue -->
<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  character: Character
  isPlayMode?: boolean
}>()

const emit = defineEmits<{
  'add-condition': []
  'level-up': []
  'revive': []
  'export': []
}>()

/**
 * Format classes display string
 * Shows each class with its level and subclass (if any), separated by " / "
 *
 * Examples:
 * - "Cleric 1 (Life Domain)" - single class with subclass
 * - "Warlock 1 (The Fiend)" - subclass at level 1
 * - "Fighter 3" - no subclass yet (gets subclass at level 3)
 * - "Fighter 5 (Champion) / Wizard 2" - multiclass
 */
const classesDisplay = computed(() => {
  if (!props.character.classes?.length) {
    return props.character.class?.name ?? 'No class'
  }
  return props.character.classes
    // Filter out dangling class references (sourcebook removed)
    .filter(c => c.class !== null)
    .map((c) => {
      const className = c.class!.name
      const level = c.level
      const subclassName = c.subclass?.name

      if (subclassName) {
        return `${className} ${level} (${subclassName})`
      }
      return `${className} ${level}`
    })
    .join(' / ') || 'No class'
})

/**
 * Determine the best portrait image source
 * Prefer thumb, fallback to medium, return null if neither available
 */
const portraitSrc = computed(() => {
  if (!props.character.portrait) return null
  return props.character.portrait.thumb || props.character.portrait.medium || null
})

/**
 * Calculate total character level from classes
 */
const totalLevel = computed(() => {
  if (!props.character.classes?.length) return 1
  return props.character.classes.reduce((sum, c) => sum + (c.level || 0), 0)
})

/**
 * Can this character level up?
 * - Must be complete (not a draft)
 * - Must be under max level (20)
 */
const canLevelUp = computed(() => {
  return props.character.is_complete && totalLevel.value < 20
})

/**
 * Build dropdown menu items based on character state
 * Uses onSelect for click handlers (NuxtUI 4 syntax)
 */
const actionMenuItems = computed(() => {
  const items: Array<Array<{ label: string, icon: string, to?: string, onSelect?: () => void, disabled?: boolean }>> = []

  // Play mode actions (only for complete characters in play mode)
  if (props.character.is_complete && props.isPlayMode) {
    const playModeActions: Array<{ label: string, icon: string, onSelect: () => void }> = []

    // Revive action (only for dead characters)
    if (props.character.is_dead) {
      playModeActions.push({
        label: 'Revive Character',
        icon: 'i-heroicons-sparkles',
        onSelect: () => emit('revive')
      })
    }

    // Add condition (always available in play mode, unless dead)
    if (!props.character.is_dead) {
      playModeActions.push({
        label: 'Add Condition',
        icon: 'i-heroicons-exclamation-triangle',
        onSelect: () => emit('add-condition')
      })
    }

    if (playModeActions.length > 0) {
      items.push(playModeActions)
    }
  }

  // Character progression (only for complete characters under max level)
  if (props.character.is_complete && totalLevel.value < 20) {
    items.push([
      {
        label: 'Level Up',
        icon: 'i-heroicons-arrow-trending-up',
        onSelect: () => emit('level-up')
      }
    ])
  }

  // Draft actions
  if (!props.character.is_complete) {
    items.push([
      {
        label: 'Continue Editing',
        icon: 'i-heroicons-pencil',
        to: `/characters/${props.character.public_id}/edit`
      }
    ])
  }

  // Export (always available)
  items.push([
    {
      label: 'Export Character',
      icon: 'i-heroicons-arrow-down-tray',
      onSelect: () => emit('export')
    }
  ])

  return items
})
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <!-- Portrait and Name Section -->
    <div class="flex items-center gap-4">
      <!-- Portrait -->
      <div
        data-testid="portrait-container"
        class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md"
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
        v-if="character.has_inspiration"
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

      <!-- Draft Badge (only show when NOT complete) -->
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
</template>

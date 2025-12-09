<!-- app/components/character/sheet/Header.vue -->
<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  character: Character
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

      <!-- Status Badge -->
      <UBadge
        :color="character.is_complete ? 'success' : 'warning'"
        variant="subtle"
        size="lg"
      >
        {{ character.is_complete ? 'Complete' : 'Draft' }}
      </UBadge>

      <!-- Edit Button (for incomplete characters) -->
      <UButton
        v-if="!character.is_complete"
        data-testid="edit-button"
        :to="`/characters/${character.public_id}/edit`"
        variant="outline"
        size="sm"
        icon="i-heroicons-pencil"
      >
        Edit
      </UButton>
    </div>
  </div>
</template>

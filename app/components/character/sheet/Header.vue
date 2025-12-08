<!-- app/components/character/sheet/Header.vue -->
<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  character: Character
}>()

/**
 * Format classes display string
 * Shows each class with its level, separated by " / "
 */
const classesDisplay = computed(() => {
  if (!props.character.classes?.length) {
    return props.character.class?.name ?? 'No class'
  }
  return props.character.classes
    // Filter out dangling class references (sourcebook removed)
    .filter(c => c.class !== null)
    .map(c => `${c.class!.name} ${c.level}`)
    .join(' / ') || 'No class'
})
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <!-- Left: Name and info -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ character.name }}
      </h1>
      <p class="mt-1 text-lg text-gray-600 dark:text-gray-400">
        <span v-if="character.race">{{ character.race.name }}<span v-if="character.size"> ({{ character.size }})</span></span>
        <span v-if="character.race && character.classes?.length"> &bull; </span>
        <span>{{ classesDisplay }}</span>
        <span v-if="character.background"> &bull; {{ character.background.name }}</span>
      </p>
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

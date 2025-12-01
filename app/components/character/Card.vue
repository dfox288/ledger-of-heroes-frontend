<!-- app/components/character/Card.vue -->
<script setup lang="ts">
import type { CharacterSummary } from '~/types'

const props = defineProps<{
  character: CharacterSummary
}>()

defineEmits<{
  delete: []
}>()

const statusColor = computed(() =>
  props.character.is_complete ? 'success' : 'warning'
)

const statusText = computed(() =>
  props.character.is_complete ? 'Complete' : 'Draft'
)
</script>

<template>
  <UCard class="hover:shadow-md transition-shadow">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg truncate">
          {{ character.name }}
        </h3>
        <UBadge
          :color="statusColor"
          variant="subtle"
          size="sm"
        >
          {{ statusText }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-globe-alt"
          class="w-4 h-4"
        />
        <span>{{ character.race?.name ?? 'No race selected' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-shield-check"
          class="w-4 h-4"
        />
        <span>{{ character.class?.name ?? 'No class selected' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-arrow-trending-up"
          class="w-4 h-4"
        />
        <span>Level {{ character.level }}</span>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <UButton
          :to="`/characters/${character.id}`"
          variant="ghost"
          size="sm"
        >
          View
        </UButton>
        <UButton
          variant="ghost"
          color="error"
          size="sm"
          icon="i-heroicons-trash"
          @click="$emit('delete')"
        />
      </div>
    </template>
  </UCard>
</template>

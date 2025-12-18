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

/**
 * Get portrait URL for background image
 * Uses medium size for better quality on cards
 */
const backgroundImage = computed(() => {
  return props.character.portrait?.medium ?? null
})

/**
 * Format class display with levels
 * Single class: "Level 5 Fighter"
 * Multiclass: "Level 8: Fighter 5 / Wizard 3" (total level + breakdown)
 */
const classDisplay = computed(() => {
  const classes = props.character.classes
  if (!classes || classes.length === 0) {
    return 'No class selected'
  }

  // Sort: primary first, then by level descending
  const sorted = [...classes].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return b.level - a.level
  })

  const classBreakdown = sorted.map(c => `${c.name} ${c.level}`).join(' / ')

  if (classes.length === 1 && sorted[0]) {
    // Single class: "Level 5 Fighter"
    return `Level ${props.character.level} ${sorted[0].name}`
  }

  // Multiclass: "Level 8: Fighter 5 / Wizard 3"
  return `Level ${props.character.level}: ${classBreakdown}`
})
</script>

<template>
  <div class="group h-full">
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-primary-300 dark:border-primary-700 hover:border-primary-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <template #header>
        <div class="relative z-10 flex items-center justify-between">
          <h3 class="font-semibold text-lg truncate">
            {{ character.name }}
          </h3>
          <UBadge
            :color="statusColor"
            variant="subtle"
            size="md"
          >
            {{ statusText }}
          </UBadge>
        </div>
      </template>

      <div class="relative z-10 space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
          <span>{{ classDisplay }}</span>
        </div>
      </div>

      <template #footer>
        <div class="relative z-10 flex justify-between items-center">
          <div class="flex gap-2">
            <UButton
              :to="`/characters/${character.public_id}`"
              variant="ghost"
              size="sm"
            >
              View
            </UButton>
            <UButton
              v-if="character.level === 1 && !character.is_complete"
              :to="`/characters/${character.public_id}/edit`"
              variant="soft"
              color="primary"
              size="sm"
            >
              Continue
            </UButton>
          </div>
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
  </div>
</template>

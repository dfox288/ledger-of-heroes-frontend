<!-- app/components/character/BackgroundCard.vue -->
<script setup lang="ts">
import type { Background } from '~/types'

interface Props {
  background: Background
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [background: Background]
  'view-details': []
}>()

/**
 * Extract skill names from proficiencies
 */
const skillNames = computed(() => {
  if (!props.background.proficiencies) return []
  return props.background.proficiencies
    .filter(p => p.proficiency_type === 'skill')
    .map(p => p.skill?.name)
    .filter(Boolean)
})

/**
 * Count languages
 */
const languageCount = computed(() => {
  return props.background.languages?.length ?? 0
})

/**
 * Handle select event from EntityPickerCard
 */
function handleSelect() {
  emit('select', props.background)
}

/**
 * Handle view-details event from EntityPickerCard
 */
function handleViewDetails() {
  emit('view-details')
}
</script>

<template>
  <CharacterEntityPickerCard
    :entity="background"
    :selected="selected"
    color="background"
    image-type="backgrounds"
    @select="handleSelect"
    @view-details="handleViewDetails"
  >
    <template #badges>
      <UBadge
        v-if="background.feature_name"
        color="background"
        variant="subtle"
        size="md"
      >
        {{ background.feature_name }}
      </UBadge>
    </template>

    <template #stats>
      <div
        v-if="skillNames.length > 0"
        class="flex items-center gap-1"
      >
        <UIcon
          name="i-heroicons-academic-cap"
          class="w-4 h-4"
        />
        <span>{{ skillNames.join(', ') }}</span>
      </div>
      <div
        v-if="languageCount > 0"
        class="flex items-center gap-1"
      >
        <UIcon
          name="i-heroicons-language"
          class="w-4 h-4"
        />
        <span>{{ languageCount }} {{ languageCount === 1 ? 'Language' : 'Languages' }}</span>
      </div>
    </template>
  </CharacterEntityPickerCard>
</template>

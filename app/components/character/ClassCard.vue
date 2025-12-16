<!-- app/components/character/ClassCard.vue -->
<script setup lang="ts">
import type { CharacterClass } from '~/types'

interface Props {
  characterClass: CharacterClass
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [characterClass: CharacterClass]
  'view-details': []
}>()

/**
 * Format hit die for display
 */
const hitDieText = computed(() => {
  return `d${props.characterClass.hit_die}`
})

/**
 * Check if class is a spellcaster
 */
const isCaster = computed(() => {
  return props.characterClass.spellcasting_ability !== null
    && props.characterClass.spellcasting_ability !== undefined
})

/**
 * Handle select event from EntityPickerCard
 */
function handleSelect() {
  emit('select', props.characterClass)
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
    :entity="characterClass"
    :selected="selected"
    color="class"
    image-type="classes"
    @select="handleSelect"
    @view-details="handleViewDetails"
  >
    <template #badges>
      <UBadge
        color="class"
        variant="subtle"
        size="md"
      >
        Hit Die: {{ hitDieText }}
      </UBadge>
      <UBadge
        v-if="characterClass.primary_ability"
        color="class"
        variant="subtle"
        size="md"
      >
        {{ characterClass.primary_ability }}
      </UBadge>
      <UBadge
        v-if="isCaster"
        color="spell"
        variant="subtle"
        size="md"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="w-3 h-3 mr-1"
        />
        {{ characterClass.spellcasting_ability?.name }}
      </UBadge>
    </template>
  </CharacterEntityPickerCard>
</template>

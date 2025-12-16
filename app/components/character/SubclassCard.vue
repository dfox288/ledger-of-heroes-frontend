<!-- app/components/character/SubclassCard.vue -->
<script setup lang="ts">
interface Props {
  subclass: {
    id: number
    name: string
    /** Source-prefixed slug (e.g., "phb:evoker") - see #506 */
    slug: string
    source?: { code: string, name: string }
    description?: string
  }
  /** Parent class slug for background image */
  parentClassSlug?: string
  selected?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [subclass: Props['subclass']]
  'view-details': []
}>()

/**
 * Handle select event from EntityPickerCard
 */
function handleSelect() {
  emit('select', props.subclass)
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
    :entity="subclass"
    :selected="selected ?? false"
    color="class"
    image-type="classes"
    :image-slug="parentClassSlug"
    @select="handleSelect"
    @view-details="handleViewDetails"
  >
    <template #badges>
      <UBadge
        v-if="subclass.source"
        color="info"
        variant="subtle"
        size="md"
      >
        {{ subclass.source.code }}
      </UBadge>
    </template>
  </CharacterEntityPickerCard>
</template>

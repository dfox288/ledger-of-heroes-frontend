<!-- app/components/character/builder/ClassPickerCard.vue -->
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
 * Handle card click - emit select
 */
function handleCardClick() {
  emit('select', props.characterClass)
}

/**
 * Handle View Details click - emit event, stop propagation
 */
function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('classes', props.characterClass.slug, 256)
})
</script>

<template>
  <div
    data-testid="picker-card"
    class="relative cursor-pointer transition-all"
    :class="[
      selected ? 'ring-2 ring-class-500 ring-offset-2' : ''
    ]"
    @click="handleCardClick"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-class-300 dark:border-class-700 hover:border-class-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Selected Checkmark -->
      <div
        v-if="selected"
        class="absolute top-2 right-2 z-20"
      >
        <UBadge
          color="success"
          variant="solid"
          size="md"
        >
          <UIcon
            name="i-heroicons-check"
            class="w-4 h-4"
          />
        </UBadge>
      </div>

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <div class="space-y-3 flex-1">
          <!-- Badges Row -->
          <div class="flex items-center gap-2 flex-wrap">
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
          </div>

          <!-- Class Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ characterClass.name }}
          </h3>

          <!-- Description Preview -->
          <p
            v-if="characterClass.description"
            class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
          >
            {{ characterClass.description }}
          </p>
        </div>

        <!-- View Details Button -->
        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <UButton
            data-testid="view-details-btn"
            variant="ghost"
            color="class"
            size="sm"
            block
            @click="handleViewDetails"
          >
            <UIcon
              name="i-heroicons-eye"
              class="w-4 h-4 mr-1"
            />
            View Details
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

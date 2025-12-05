<!-- app/components/character/builder/BackgroundPickerCard.vue -->
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

// Get background image path (256px variant)
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('backgrounds', props.background.slug, 256)
})

// Extract skill names from proficiencies
const skillNames = computed(() => {
  if (!props.background.proficiencies) return []
  return props.background.proficiencies
    .filter(p => p.proficiency_type === 'skill')
    .map(p => p.skill?.name)
    .filter(Boolean)
})

// Count languages
const languageCount = computed(() => {
  return props.background.languages?.length ?? 0
})

function handleSelect() {
  emit('select', props.background)
}

function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}
</script>

<template>
  <div
    data-testid="picker-card"
    class="relative cursor-pointer transition-all"
    :class="[
      selected ? 'ring-2 ring-background-500 ring-offset-2' : ''
    ]"
    @click="handleSelect"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-background-300 dark:border-background-700 hover:border-background-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Selected Checkmark -->
      <div
        v-if="selected"
        data-testid="selected-check"
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
          <!-- Feature Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              v-if="background.feature_name"
              color="background"
              variant="subtle"
              size="md"
            >
              {{ background.feature_name }}
            </UBadge>
          </div>

          <!-- Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ background.name }}
          </h3>

          <!-- Skills -->
          <div
            v-if="skillNames.length > 0"
            class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"
          >
            <UIcon
              name="i-heroicons-academic-cap"
              class="w-4 h-4"
            />
            <span>{{ skillNames.join(', ') }}</span>
          </div>

          <!-- Languages -->
          <div
            v-if="languageCount > 0"
            class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"
          >
            <UIcon
              name="i-heroicons-language"
              class="w-4 h-4"
            />
            <span>{{ languageCount }} {{ languageCount === 1 ? 'Language' : 'Languages' }}</span>
          </div>
        </div>

        <!-- View Details Button -->
        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <UButton
            data-testid="view-details-btn"
            variant="ghost"
            color="background"
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

<script setup lang="ts">
import type { Background } from '~/types'

interface Props {
  background: Background
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [background: Background]
  viewDetails: []
}>()

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
  emit('viewDetails')
}
</script>

<template>
  <div class="relative">
    <button
      data-test="card-button"
      type="button"
      class="w-full text-left"
      @click="handleSelect"
    >
      <UCard
        class="h-full transition-all"
        :class="[
          selected
            ? 'ring-2 ring-background-500 bg-background-50 dark:bg-background-900/30'
            : 'hover:ring-2 hover:ring-background-300'
        ]"
      >
        <!-- Selected Checkmark -->
        <div
          v-if="selected"
          data-test="selected-check"
          class="absolute top-2 right-2 w-6 h-6 bg-background-500 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-check"
            class="w-4 h-4 text-white"
          />
        </div>

        <div class="space-y-2">
          <!-- Feature Badge -->
          <UBadge
            v-if="background.feature_name"
            color="background"
            variant="subtle"
            size="md"
          >
            {{ background.feature_name }}
          </UBadge>

          <!-- Name -->
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
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
        <template #footer>
          <UButton
            data-test="view-details-btn"
            variant="ghost"
            color="neutral"
            size="sm"
            block
            @click="handleViewDetails"
          >
            View Details
          </UButton>
        </template>
      </UCard>
    </button>
  </div>
</template>

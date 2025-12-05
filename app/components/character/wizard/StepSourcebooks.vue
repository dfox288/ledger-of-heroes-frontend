<!-- app/components/character/wizard/StepSourcebooks.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Source } from '~/types'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardNavigation } from '~/composables/useWizardSteps'

const store = useCharacterWizardStore()
const { selectedSources } = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// API client
const { apiFetch } = useApi()

// Fetch all sources
const { data: sources, pending: loadingSources } = await useAsyncData(
  'builder-sources',
  () => apiFetch<{ data: Source[] }>('/sources?per_page=100'),
  { transform: (response: { data: Source[] }) => response.data }
)

// Initialize selected sources if empty (default: all selected)
watch(sources, (newSources) => {
  if (newSources && newSources.length > 0 && selectedSources.value.length === 0) {
    store.setSelectedSources(newSources.map(s => s.code))
  }
}, { immediate: true })

// Group sources by category
const sourcesByCategory = computed(() => {
  if (!sources.value) return new Map<string, Source[]>()

  const groups = new Map<string, Source[]>()
  for (const source of sources.value) {
    const category = source.category || 'Other'
    const existing = groups.get(category) ?? []
    groups.set(category, [...existing, source])
  }
  return groups
})

// Toggle a single source
function toggleSource(code: string) {
  const current = new Set(selectedSources.value)
  if (current.has(code)) {
    current.delete(code)
  } else {
    current.add(code)
  }
  store.setSelectedSources([...current])
}

// Check if source is selected
function isSelected(code: string): boolean {
  return selectedSources.value.includes(code)
}

// Select all sources
function selectAll() {
  if (!sources.value) return
  store.setSelectedSources(sources.value.map(s => s.code))
}

// Deselect all sources
function deselectAll() {
  store.setSelectedSources([])
}

// Selection count
const selectionCount = computed(() => selectedSources.value.length)
const totalCount = computed(() => sources.value?.length ?? 0)

// Validation: can proceed if at least one source selected
const canProceed = computed(() => selectedSources.value.length > 0)

// Confirm selection and proceed
function confirmSelection() {
  if (!canProceed.value) return
  nextStep()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Sourcebooks
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select which D&D books to include in character creation
      </p>
    </div>

    <!-- Action Buttons & Count -->
    <div class="flex items-center justify-between max-w-2xl mx-auto">
      <div class="flex gap-2">
        <UButton
          variant="outline"
          size="sm"
          @click="selectAll"
        >
          Select All
        </UButton>
        <UButton
          variant="outline"
          size="sm"
          @click="deselectAll"
        >
          Deselect All
        </UButton>
      </div>
      <UBadge
        color="primary"
        variant="subtle"
        size="md"
      >
        {{ selectionCount }} of {{ totalCount }} selected
      </UBadge>
    </div>

    <!-- Loading State -->
    <div
      v-if="loadingSources"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Sources by Category -->
    <div
      v-else
      class="max-w-2xl mx-auto space-y-6"
    >
      <div
        v-for="[category, categorySources] in sourcesByCategory"
        :key="category"
        class="space-y-3"
      >
        <!-- Category Header -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          {{ category }}
        </h3>

        <!-- Source Items -->
        <div class="space-y-2">
          <div
            v-for="source in categorySources"
            :key="source.code"
            class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            @click="toggleSource(source.code)"
          >
            <div class="flex items-center gap-3">
              <UCheckbox
                :model-value="isSelected(source.code)"
                @update:model-value="toggleSource(source.code)"
                @click.stop
              />
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ source.name }}
                </div>
                <div
                  v-if="source.publication_year"
                  class="text-sm text-gray-500 dark:text-gray-400"
                >
                  {{ source.publication_year }}
                </div>
              </div>
            </div>
            <UBadge
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ source.code }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (no sources) -->
    <div
      v-if="!loadingSources && (!sources || sources.length === 0)"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-book-open"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No sourcebooks available
      </p>
    </div>

    <!-- Validation Message -->
    <div
      v-if="!canProceed && !loadingSources"
      class="text-center"
    >
      <UAlert
        color="warning"
        icon="i-heroicons-exclamation-triangle"
        title="Select at least one sourcebook to continue"
      />
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        size="lg"
        :disabled="!canProceed"
        @click="confirmSelection"
      >
        Continue
      </UButton>
    </div>
  </div>
</template>

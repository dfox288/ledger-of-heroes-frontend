<!-- app/components/character/builder/StepLanguages.vue -->
<script setup lang="ts">
import type { LanguageOption } from '~/types/languageChoices'
import { useWizardNavigation } from '~/composables/useWizardSteps'

const store = useCharacterBuilderStore()
const {
  languageChoices,
  pendingLanguageSelections,
  allLanguageChoicesComplete,
  isLoading,
  selectedRace,
  selectedBackground
} = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// Check if there are any choices to make
const hasAnyChoices = computed(() => {
  if (!languageChoices.value) return false
  const { race, background } = languageChoices.value.data
  return race.choices !== null || background.choices !== null
})

// Organize data by source for display
const sourceData = computed(() => {
  if (!languageChoices.value) return []

  const sources: Array<{
    source: 'race' | 'background'
    label: string
    entityName: string
    known: Array<{ id: number, name: string }>
    choices: {
      quantity: number
      selected: number[]
      options: LanguageOption[]
    } | null
  }> = []

  const { race, background } = languageChoices.value.data

  // Race source (always show if has known languages or choices)
  if (race.known.length > 0 || race.choices) {
    sources.push({
      source: 'race',
      label: 'From Race',
      entityName: selectedRace.value?.name ?? 'Unknown',
      known: race.known,
      choices: race.choices
    })
  }

  // Background source (only show if has choices - backgrounds don't grant fixed languages)
  if (background.choices) {
    sources.push({
      source: 'background',
      label: 'From Background',
      entityName: selectedBackground.value?.name ?? 'Unknown',
      known: background.known,
      choices: background.choices
    })
  }

  return sources
})

/**
 * Initialize pending selections from API's selected arrays
 * Called on mount to pre-populate when editing existing character
 */
function initializePendingSelections() {
  if (!languageChoices.value) return

  const { race, background } = languageChoices.value.data

  // Only initialize if not already in pending selections
  if (race.choices && race.choices.selected.length > 0 && !pendingLanguageSelections.value.has('race')) {
    store.initializeLanguageSelections()
  }

  if (background.choices && background.choices.selected.length > 0 && !pendingLanguageSelections.value.has('background')) {
    store.initializeLanguageSelections()
  }
}

// Initialize on mount
onMounted(() => {
  initializePendingSelections()
})

// Re-initialize if languageChoices changes (e.g., after refetch)
watch(languageChoices, () => {
  initializePendingSelections()
}, { immediate: false })

// Get selected count for a source
function getSelectedCount(source: 'race' | 'background'): number {
  return pendingLanguageSelections.value.get(source)?.size ?? 0
}

// Check if a language is selected (pending state)
function isLanguageSelected(source: 'race' | 'background', languageId: number): boolean {
  return pendingLanguageSelections.value.get(source)?.has(languageId) ?? false
}

// Handle language toggle
function handleLanguageToggle(source: 'race' | 'background', languageId: number, quantity: number) {
  const current = getSelectedCount(source)
  const isSelected = isLanguageSelected(source, languageId)

  // Don't allow selecting more than quantity (unless deselecting)
  if (!isSelected && current >= quantity) return

  store.toggleLanguageSelection(source, languageId)
}

/**
 * Continue to next step - saves language choices first
 */
async function handleContinue() {
  await store.saveLanguageChoices()
  nextStep()
}
</script>

<template>
  <div class="step-languages">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-primary">
        Choose Your Languages
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Your race and background grant the following languages
      </p>
    </div>

    <!-- No choices needed -->
    <div
      v-if="!hasAnyChoices"
      class="text-center py-8"
    >
      <UIcon
        name="i-heroicons-check-circle"
        class="w-12 h-12 text-success mx-auto mb-4"
      />
      <p class="text-lg">
        No language choices needed
      </p>
      <p class="text-gray-600 dark:text-gray-400">
        All your languages have been automatically assigned
      </p>
    </div>

    <!-- Language choices by source -->
    <div
      v-else
      class="space-y-8"
    >
      <div
        v-for="data in sourceData"
        :key="data.source"
        class="choice-source"
      >
        <!-- Source header -->
        <h3 class="text-lg font-semibold mb-4">
          {{ data.label }}: {{ data.entityName }}
        </h3>

        <!-- Known languages (automatic) -->
        <div
          v-if="data.known.length > 0"
          data-test="known-languages"
          class="mb-4"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Automatic languages:
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="lang in data.known"
              :key="lang.id"
              color="success"
              variant="subtle"
              size="md"
            >
              <UIcon
                name="i-heroicons-check"
                class="w-4 h-4 mr-1"
              />
              {{ lang.name }}
            </UBadge>
          </div>
        </div>

        <!-- Language choices -->
        <div
          v-if="data.choices"
          class="mb-6"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">
              Choose {{ data.choices.quantity }} language{{ data.choices.quantity > 1 ? 's' : '' }}:
            </span>
            <UBadge
              :color="getSelectedCount(data.source) === data.choices.quantity ? 'success' : 'neutral'"
              size="md"
            >
              {{ getSelectedCount(data.source) }}/{{ data.choices.quantity }} selected
            </UBadge>
          </div>

          <!-- Language options grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="option in data.choices.options"
              :key="option.id"
              type="button"
              class="language-option p-3 rounded-lg border text-left transition-all"
              :class="{
                'border-primary bg-primary/10': isLanguageSelected(data.source, option.id),
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isLanguageSelected(data.source, option.id)
              }"
              @click="handleLanguageToggle(data.source, option.id, data.choices!.quantity)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isLanguageSelected(data.source, option.id) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
                  class="w-5 h-5"
                  :class="{
                    'text-primary': isLanguageSelected(data.source, option.id),
                    'text-gray-400': !isLanguageSelected(data.source, option.id)
                  }"
                />
                <span class="font-medium">{{ option.name }}</span>
              </div>
              <p
                v-if="option.script"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7"
              >
                Script: {{ option.script }}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="flex justify-center pt-6">
      <UButton
        data-test="continue-btn"
        size="lg"
        :disabled="!allLanguageChoicesComplete || isLoading"
        :loading="isLoading"
        @click="handleContinue"
      >
        Continue with Languages
      </UButton>
    </div>
  </div>
</template>

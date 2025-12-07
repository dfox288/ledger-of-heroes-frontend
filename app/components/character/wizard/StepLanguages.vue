<!-- app/components/character/wizard/StepLanguages.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'

type PendingChoice = components['schemas']['PendingChoiceResource']

const store = useCharacterWizardStore()
const {
  isLoading
} = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// ══════════════════════════════════════════════════════════════
// Fetch language choices using unified API
// ══════════════════════════════════════════════════════════════

const {
  choicesByType,
  pending,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => store.characterId))

// Fetch language choices on mount
onMounted(async () => {
  await fetchChoices('language')
})

// Local selections: Map<choiceId, Set<slug>> - stored as strings for API compatibility
const localSelections = ref<Map<string, Set<string>>>(new Map())

// Get language choices grouped by source
const languageChoicesBySource = computed(() => {
  const choices = choicesByType.value.languages
  return {
    race: choices.filter(c => c.source === 'race'),
    background: choices.filter(c => c.source === 'background')
  }
})

// Check if there are any choices to make
const hasAnyChoices = computed(() => {
  return choicesByType.value.languages.length > 0
})

// Organize data by source for display
interface SourceDisplayData {
  choice: PendingChoice
  label: string
  entityName: string
  knownLanguages: Array<{ id: number, name: string }>
}

const sourceData = computed((): SourceDisplayData[] => {
  const sources: SourceDisplayData[] = []

  // Race choices
  for (const choice of languageChoicesBySource.value.race) {
    sources.push({
      choice,
      label: 'From Race',
      entityName: choice.source_name,
      knownLanguages: choice.selected.map((id) => {
        const option = (choice.options as Array<{ id: number, name: string }>)?.find(o => o.id === Number(id))
        return option ?? { id: Number(id), name: `Language ${id}` }
      })
    })
  }

  // Background choices
  for (const choice of languageChoicesBySource.value.background) {
    sources.push({
      choice,
      label: 'From Background',
      entityName: choice.source_name,
      knownLanguages: choice.selected.map((id) => {
        const option = (choice.options as Array<{ id: number, name: string }>)?.find(o => o.id === Number(id))
        return option ?? { id: Number(id), name: `Language ${id}` }
      })
    })
  }

  return sources
})

// Get selected count for a choice
function getSelectedCount(choiceId: string): number {
  return localSelections.value.get(choiceId)?.size ?? 0
}

// Check if a language is selected in this choice
function isLanguageSelected(choiceId: string, slug: string): boolean {
  return localSelections.value.get(choiceId)?.has(slug) ?? false
}

// Check if a language is selected in ANY OTHER choice (cross-choice conflict)
function isLanguageSelectedElsewhere(choiceId: string, slug: string): boolean {
  for (const [otherChoiceId, selectedSlugs] of localSelections.value.entries()) {
    if (otherChoiceId !== choiceId && selectedSlugs.has(slug)) {
      return true
    }
  }
  return false
}

// Handle language toggle
function handleLanguageToggle(choice: PendingChoice, slug: string) {
  const current = getSelectedCount(choice.id)
  const isSelected = isLanguageSelected(choice.id, slug)

  // Don't allow selecting more than quantity (unless deselecting)
  if (!isSelected && current >= choice.quantity) return

  // Don't allow selecting a language already chosen from another choice
  if (!isSelected && isLanguageSelectedElsewhere(choice.id, slug)) return

  // Toggle the selection
  const selections = localSelections.value.get(choice.id) ?? new Set<string>()
  const updated = new Set(selections)

  if (updated.has(slug)) {
    updated.delete(slug)
  } else {
    updated.add(slug)
  }

  localSelections.value.set(choice.id, updated)
}

// Check if all language choices are complete
const allLanguageChoicesComplete = computed(() => {
  for (const data of sourceData.value) {
    if (getSelectedCount(data.choice.id) < data.choice.quantity) {
      return false
    }
  }
  return true
})

/**
 * Continue to next step - resolve all choices
 */
async function handleContinue() {
  isLoading.value = true

  try {
    // Resolve each choice
    for (const [choiceId, selectedSlugs] of localSelections.value.entries()) {
      if (selectedSlugs.size > 0) {
        await resolveChoice(choiceId, {
          selected: Array.from(selectedSlugs)
        })
      }
    }

    // Clear local selections
    localSelections.value.clear()

    // Sync store with backend to update hasLanguageChoices
    await store.syncWithBackend()

    await nextStep()
  } catch (e) {
    console.error('Failed to save language choices:', e)
    toast.add({
      title: 'Failed to save languages',
      description: 'Please try again',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isLoading.value = false
  }
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

    <!-- Error State -->
    <UAlert
      v-if="choicesError"
      color="error"
      icon="i-heroicons-exclamation-circle"
      title="Failed to load language choices"
      :description="choicesError"
      class="mb-6"
    />

    <!-- Loading State -->
    <div
      v-if="pending && !choicesError"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
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
        :key="data.choice.id"
        class="choice-source"
      >
        <!-- Source header -->
        <h3 class="text-lg font-semibold mb-4">
          {{ data.label }}: {{ data.entityName }}
        </h3>

        <!-- Known languages (already selected/resolved) -->
        <div
          v-if="data.knownLanguages.length > 0"
          data-testid="known-languages"
          class="mb-4"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Already selected:
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="lang in data.knownLanguages"
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
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">
              Choose {{ data.choice.quantity }} language{{ data.choice.quantity > 1 ? 's' : '' }}:
            </span>
            <UBadge
              :color="getSelectedCount(data.choice.id) === data.choice.quantity ? 'success' : 'neutral'"
              size="md"
            >
              {{ getSelectedCount(data.choice.id) }}/{{ data.choice.quantity }} selected
            </UBadge>
          </div>

          <!-- Language options grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="option in (data.choice.options as Array<{ id: number, slug: string, name: string, script?: string }>)"
              :key="option.slug"
              type="button"
              class="language-option p-3 rounded-lg border text-left transition-all"
              :class="{
                'border-primary bg-primary/10': isLanguageSelected(data.choice.id, option.slug),
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isLanguageSelected(data.choice.id, option.slug) && !isLanguageSelectedElsewhere(data.choice.id, option.slug),
                'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': isLanguageSelectedElsewhere(data.choice.id, option.slug)
              }"
              :disabled="isLanguageSelectedElsewhere(data.choice.id, option.slug)"
              @click="handleLanguageToggle(data.choice, option.slug)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isLanguageSelectedElsewhere(data.choice.id, option.slug)
                    ? 'i-heroicons-no-symbol'
                    : isLanguageSelected(data.choice.id, option.slug)
                      ? 'i-heroicons-check-circle-solid'
                      : 'i-heroicons-circle'"
                  class="w-5 h-5"
                  :class="{
                    'text-primary': isLanguageSelected(data.choice.id, option.slug),
                    'text-gray-400': !isLanguageSelected(data.choice.id, option.slug) && !isLanguageSelectedElsewhere(data.choice.id, option.slug),
                    'text-gray-300 dark:text-gray-600': isLanguageSelectedElsewhere(data.choice.id, option.slug)
                  }"
                />
                <span class="font-medium">{{ option.name }}</span>
              </div>
              <p
                v-if="isLanguageSelectedElsewhere(data.choice.id, option.slug)"
                class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-7"
              >
                Already selected from {{ data.choice.source === 'race' ? 'background' : 'race' }}
              </p>
              <p
                v-else-if="option.script"
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
        data-testid="continue-btn"
        size="lg"
        :disabled="!allLanguageChoicesComplete || pending || isLoading"
        :loading="pending || isLoading"
        @click="handleContinue"
      >
        Continue with Languages
      </UButton>
    </div>
  </div>
</template>

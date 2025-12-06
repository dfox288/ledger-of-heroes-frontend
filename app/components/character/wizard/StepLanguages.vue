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

// ══════════════════════════════════════════════════════════════
// Fetch language choices using unified API
// ══════════════════════════════════════════════════════════════

const {
  choicesByType,
  pending,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => store.characterId))

// Fetch language choices on mount
onMounted(async () => {
  await fetchChoices('language')
})

// Local selections: Map<choiceId, Set<number>>
const localSelections = ref<Map<string, Set<number>>>(new Map())

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
function isLanguageSelected(choiceId: string, languageId: number): boolean {
  return localSelections.value.get(choiceId)?.has(languageId) ?? false
}

// Check if a language is selected in ANY OTHER choice (cross-choice conflict)
function isLanguageSelectedElsewhere(choiceId: string, languageId: number): boolean {
  for (const [otherChoiceId, selectedIds] of localSelections.value.entries()) {
    if (otherChoiceId !== choiceId && selectedIds.has(languageId)) {
      return true
    }
  }
  return false
}

// Handle language toggle
function handleLanguageToggle(choice: PendingChoice, languageId: number) {
  const current = getSelectedCount(choice.id)
  const isSelected = isLanguageSelected(choice.id, languageId)

  // Don't allow selecting more than quantity (unless deselecting)
  if (!isSelected && current >= choice.quantity) return

  // Don't allow selecting a language already chosen from another choice
  if (!isSelected && isLanguageSelectedElsewhere(choice.id, languageId)) return

  // Toggle the selection
  const selections = localSelections.value.get(choice.id) ?? new Set<number>()
  const updated = new Set(selections)

  if (updated.has(languageId)) {
    updated.delete(languageId)
  } else {
    updated.add(languageId)
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
    for (const [choiceId, selectedIds] of localSelections.value.entries()) {
      if (selectedIds.size > 0) {
        await resolveChoice(choiceId, {
          selected: Array.from(selectedIds)
        })
      }
    }

    // Clear local selections
    localSelections.value.clear()

    nextStep()
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
          data-test="known-languages"
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
              v-for="option in (data.choice.options as Array<{ id: number, name: string, script?: string }>)"
              :key="option.id"
              type="button"
              class="language-option p-3 rounded-lg border text-left transition-all"
              :class="{
                'border-primary bg-primary/10': isLanguageSelected(data.choice.id, option.id),
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isLanguageSelected(data.choice.id, option.id) && !isLanguageSelectedElsewhere(data.choice.id, option.id),
                'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': isLanguageSelectedElsewhere(data.choice.id, option.id)
              }"
              :disabled="isLanguageSelectedElsewhere(data.choice.id, option.id)"
              @click="handleLanguageToggle(data.choice, option.id)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isLanguageSelectedElsewhere(data.choice.id, option.id)
                    ? 'i-heroicons-no-symbol'
                    : isLanguageSelected(data.choice.id, option.id)
                      ? 'i-heroicons-check-circle-solid'
                      : 'i-heroicons-circle'"
                  class="w-5 h-5"
                  :class="{
                    'text-primary': isLanguageSelected(data.choice.id, option.id),
                    'text-gray-400': !isLanguageSelected(data.choice.id, option.id) && !isLanguageSelectedElsewhere(data.choice.id, option.id),
                    'text-gray-300 dark:text-gray-600': isLanguageSelectedElsewhere(data.choice.id, option.id)
                  }"
                />
                <span class="font-medium">{{ option.name }}</span>
              </div>
              <p
                v-if="isLanguageSelectedElsewhere(data.choice.id, option.id)"
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
        data-test="continue-btn"
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

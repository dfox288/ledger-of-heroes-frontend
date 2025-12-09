<!-- app/components/character/wizard/StepLanguages.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'
import type { CharacterLanguage } from '~/types/character'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'
import { wizardErrors } from '~/utils/wizardErrors'

type PendingChoice = components['schemas']['PendingChoiceResource']

const store = useCharacterWizardStore()
const { isLoading } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// API client
const { apiFetch } = useApi()

// ══════════════════════════════════════════════════════════════
// Fetch already-known languages (fixed from race, class, background)
// ══════════════════════════════════════════════════════════════

const { data: knownLanguagesData, pending: knownLanguagesPending } = await useAsyncData(
  `wizard-known-languages-${store.characterId}`,
  async () => {
    if (!store.characterId) return []
    const response = await apiFetch<{ data: CharacterLanguage[] }>(
      `/characters/${store.characterId}/languages`
    )
    return response.data
  },
  { watch: [computed(() => store.characterId)] }
)

// Group known languages by source
const knownLanguagesBySource = computed(() => {
  const languages = knownLanguagesData.value ?? []
  return {
    race: languages.filter(l => l.source === 'race'),
    class: languages.filter(l => l.source === 'class'),
    background: languages.filter(l => l.source === 'background')
  }
})

// Get all known language slugs for already-granted validation
const knownLanguageSlugs = computed(() => {
  const languages = knownLanguagesData.value ?? []
  return new Set(languages.map(l => l.language_slug))
})

// Check if we have any known languages to display
const hasKnownLanguages = computed(() => {
  return (knownLanguagesData.value?.length ?? 0) > 0
})

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

// Use choice selection composable for core selection logic
const {
  localSelections,
  isSaving,
  getSelectedCount,
  isOptionSelected,
  isOptionDisabled,
  getDisabledReason,
  allComplete: allLanguageChoicesComplete,
  handleToggle,
  saveAllChoices
} = useWizardChoiceSelection(
  computed(() => choicesByType.value.languages),
  {
    resolveChoice,
    alreadyGrantedIds: knownLanguageSlugs
  }
)

// Check if there are any choices to make
const hasAnyChoices = computed(() => {
  return choicesByType.value.languages.length > 0
})

// ══════════════════════════════════════════════════════════════
// Language-specific: Group by source & learnable filter
// ══════════════════════════════════════════════════════════════

// Type for language options from the API
interface LanguageOption {
  id: number
  full_slug?: string
  slug: string
  name: string
  script?: string
  is_learnable?: boolean
}

/**
 * Filter language options to only include learnable languages.
 * Non-learnable languages (Thieves' Cant, Druidic) are class features
 * and should not appear in general language selection.
 */
function getLearnableOptions(options: unknown): LanguageOption[] {
  if (!Array.isArray(options)) return []
  return (options as LanguageOption[]).filter(opt => opt.is_learnable !== false)
}

// Get language choices grouped by source
const languageChoicesBySource = computed(() => {
  const choices = choicesByType.value.languages
  return {
    race: choices.filter(c => c.source === 'race'),
    background: choices.filter(c => c.source === 'background')
  }
})

// Organize data by source for display
interface SourceDisplayData {
  choice: PendingChoice
  label: string
  entityName: string
  knownLanguages: Array<{ id: number; name: string }>
}

const sourceData = computed((): SourceDisplayData[] => {
  const sources: SourceDisplayData[] = []

  // Race choices
  for (const choice of languageChoicesBySource.value.race) {
    sources.push({
      choice,
      label: 'From Race',
      entityName: choice.source_name,
      knownLanguages: choice.selected.map((slug) => {
        const options = choice.options as LanguageOption[] | null
        const option = options?.find(o => (o.full_slug ?? o.slug) === String(slug))
        return option ?? { id: 0, name: String(slug) }
      })
    })
  }

  // Background choices
  for (const choice of languageChoicesBySource.value.background) {
    sources.push({
      choice,
      label: 'From Background',
      entityName: choice.source_name,
      knownLanguages: choice.selected.map((slug) => {
        const options = choice.options as LanguageOption[] | null
        const option = options?.find(o => (o.full_slug ?? o.slug) === String(slug))
        return option ?? { id: 0, name: String(slug) }
      })
    })
  }

  return sources
})

// ══════════════════════════════════════════════════════════════
// Language-specific helpers for template
// ══════════════════════════════════════════════════════════════

function isLanguageAlreadyKnown(slug: string): boolean {
  return knownLanguageSlugs.value.has(slug)
}

function isLanguageSelectedElsewhere(choiceId: string, slug: string): boolean {
  for (const [otherChoiceId, selectedSlugs] of localSelections.value.entries()) {
    if (otherChoiceId !== choiceId && selectedSlugs.has(slug)) {
      return true
    }
  }
  return false
}

// ══════════════════════════════════════════════════════════════
// Navigation
// ══════════════════════════════════════════════════════════════

async function handleContinue() {
  isLoading.value = true

  try {
    await saveAllChoices()

    // Clear local selections after save
    localSelections.value.clear()

    // Sync store with backend to update hasLanguageChoices
    await store.syncWithBackend()

    await nextStep()
  } catch (e) {
    wizardErrors.choiceResolveFailed(e, toast, 'language')
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
      v-if="(pending || knownLanguagesPending || isLoading) && !choicesError"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Known Languages Section -->
    <div
      v-if="hasKnownLanguages && !knownLanguagesPending"
      class="mb-8"
    >
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <UIcon
          name="i-heroicons-check-circle"
          class="w-5 h-5 text-success"
        />
        Languages You Know
      </h3>
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <!-- From Race -->
        <div v-if="knownLanguagesBySource.race.length > 0">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            From Race ({{ store.selections.race?.name }}):
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="lang in knownLanguagesBySource.race"
              :key="lang.id"
              color="race"
              variant="subtle"
              size="md"
            >
              {{ lang.language?.name || lang.language_slug }}
            </UBadge>
          </div>
        </div>

        <!-- From Class -->
        <div v-if="knownLanguagesBySource.class.length > 0">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            From Class ({{ store.selections.class?.name }}):
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="lang in knownLanguagesBySource.class"
              :key="lang.id"
              color="class"
              variant="subtle"
              size="md"
            >
              {{ lang.language?.name || lang.language_slug }}
            </UBadge>
          </div>
        </div>

        <!-- From Background -->
        <div v-if="knownLanguagesBySource.background.length > 0">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            From Background ({{ store.selections.background?.name }}):
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="lang in knownLanguagesBySource.background"
              :key="lang.id"
              color="background"
              variant="subtle"
              size="md"
            >
              {{ lang.language?.name || lang.language_slug }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- No choices needed -->
    <div
      v-if="!hasAnyChoices && !pending && !knownLanguagesPending"
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
      v-else-if="hasAnyChoices && !isLoading && !pending"
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

          <!-- Language options grid (filtered to only show learnable languages) -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="option in getLearnableOptions(data.choice.options)"
              :key="option.full_slug ?? option.slug"
              type="button"
              class="language-option p-3 rounded-lg border text-left transition-all"
              :class="{
                'border-primary bg-primary/10': isOptionSelected(data.choice.id, option.full_slug ?? option.slug),
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isOptionSelected(data.choice.id, option.full_slug ?? option.slug) && !isOptionDisabled(data.choice.id, option.full_slug ?? option.slug),
                'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': isOptionDisabled(data.choice.id, option.full_slug ?? option.slug)
              }"
              :disabled="isOptionDisabled(data.choice.id, option.full_slug ?? option.slug)"
              @click="handleToggle(data.choice, option.full_slug ?? option.slug)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isLanguageAlreadyKnown(option.full_slug ?? option.slug)
                    ? 'i-heroicons-check-circle-solid'
                    : isLanguageSelectedElsewhere(data.choice.id, option.full_slug ?? option.slug)
                      ? 'i-heroicons-no-symbol'
                      : isOptionSelected(data.choice.id, option.full_slug ?? option.slug)
                        ? 'i-heroicons-check-circle-solid'
                        : 'i-heroicons-circle'"
                  class="w-5 h-5"
                  :class="{
                    'text-success': isLanguageAlreadyKnown(option.full_slug ?? option.slug),
                    'text-primary': !isLanguageAlreadyKnown(option.full_slug ?? option.slug) && isOptionSelected(data.choice.id, option.full_slug ?? option.slug),
                    'text-gray-400': !isOptionSelected(data.choice.id, option.full_slug ?? option.slug) && !isOptionDisabled(data.choice.id, option.full_slug ?? option.slug),
                    'text-gray-300 dark:text-gray-600': isOptionDisabled(data.choice.id, option.full_slug ?? option.slug) && !isLanguageAlreadyKnown(option.full_slug ?? option.slug)
                  }"
                />
                <span
                  class="font-medium"
                  :class="{ 'text-gray-400 dark:text-gray-500': isOptionDisabled(data.choice.id, option.full_slug ?? option.slug) }"
                >
                  {{ option.name }}
                </span>
              </div>
              <p
                v-if="getDisabledReason(data.choice.id, option.full_slug ?? option.slug)"
                class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-7"
              >
                {{ getDisabledReason(data.choice.id, option.full_slug ?? option.slug) }}
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

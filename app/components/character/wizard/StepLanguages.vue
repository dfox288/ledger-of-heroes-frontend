<!-- app/components/character/wizard/StepLanguages.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'
import type { CharacterLanguage } from '~/types/character'
import type { GrantedGroup } from './WizardGrantedItemsSection.vue'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'
import { wizardErrors } from '~/utils/wizardErrors'

type PendingChoice = components['schemas']['PendingChoiceResource']

// Props for store-agnostic usage (enables use in both creation and level-up wizards)
const props = withDefaults(defineProps<{
  characterId?: number
  nextStep?: () => void
  refreshAfterSave?: () => Promise<void>
}>(), {
  characterId: undefined,
  nextStep: undefined,
  refreshAfterSave: undefined
})

// Fallback to store if props not provided (backward compatibility)
const store = useCharacterWizardStore()
const { isLoading } = storeToRefs(store)
const wizardNav = useCharacterWizard()

// Use prop or store value
const effectiveCharacterId = computed(() => props.characterId ?? store.characterId)
const effectiveNextStep = computed(() => props.nextStep ?? wizardNav.nextStep)

// Toast for user feedback
const toast = useToast()

// API client
const { apiFetch } = useApi()

// ══════════════════════════════════════════════════════════════
// Fetch already-known languages (fixed from race, class, background)
// ══════════════════════════════════════════════════════════════

const { data: knownLanguagesData, pending: knownLanguagesPending } = await useAsyncData(
  `wizard-known-languages-${effectiveCharacterId.value}`,
  async () => {
    if (!effectiveCharacterId.value) return []
    const response = await apiFetch<{ data: CharacterLanguage[] }>(
      `/characters/${effectiveCharacterId.value}/languages`
    )
    return response.data
  },
  { watch: [effectiveCharacterId] }
)

// Group known languages by source for GrantedItemsSection
const knownLanguageGroups = computed((): GrantedGroup[] => {
  const languages = knownLanguagesData.value ?? []
  const groups: GrantedGroup[] = []

  // Group by source
  const bySource = {
    race: languages.filter(l => l.source === 'race'),
    class: languages.filter(l => l.source === 'class'),
    background: languages.filter(l => l.source === 'background'),
    subclass_feature: languages.filter(l => l.source === 'subclass_feature')
  }

  if (bySource.race.length > 0) {
    groups.push({
      label: `From Race (${store.selections.race?.name})`,
      color: 'race',
      items: bySource.race.map(l => ({
        id: l.id,
        name: l.language?.name || l.language_slug
      }))
    })
  }

  if (bySource.class.length > 0) {
    groups.push({
      label: `From Class (${store.selections.class?.name})`,
      color: 'class',
      items: bySource.class.map(l => ({
        id: l.id,
        name: l.language?.name || l.language_slug
      }))
    })
  }

  if (bySource.background.length > 0) {
    groups.push({
      label: `From Background (${store.selections.background?.name})`,
      color: 'background',
      items: bySource.background.map(l => ({
        id: l.id,
        name: l.language?.name || l.language_slug
      }))
    })
  }

  if (bySource.subclass_feature.length > 0) {
    groups.push({
      label: 'From Subclass',
      color: 'class',
      items: bySource.subclass_feature.map(l => ({
        id: l.id,
        name: l.language?.name || l.language_slug
      }))
    })
  }

  return groups
})

// Get all known language slugs for already-granted validation
const knownLanguageSlugs = computed(() => {
  const languages = knownLanguagesData.value ?? []
  return new Set(languages.map(l => l.language_slug))
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
} = useUnifiedChoices(effectiveCharacterId)

// Fetch language choices on mount
onMounted(async () => {
  await fetchChoices('language')
})

// Use choice selection composable for core selection logic
const {
  localSelections,
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
    background: choices.filter(c => c.source === 'background'),
    class: choices.filter(c => c.source === 'class'),
    subclass_feature: choices.filter(c => c.source === 'subclass_feature')
  }
})

// Organize data by source for display
interface SourceDisplayData {
  choice: PendingChoice
  label: string
  entityName: string
  knownLanguages: Array<{ id: number, name: string }>
}

// Helper to get source label
function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    race: 'From Race',
    background: 'From Background',
    class: 'From Class',
    subclass_feature: 'From Subclass'
  }
  return labels[source] ?? `From ${source}`
}

const sourceData = computed((): SourceDisplayData[] => {
  const sources: SourceDisplayData[] = []

  // Helper to add choices from a source
  const addSourceChoices = (sourceChoices: typeof choicesByType.value.languages, source: string) => {
    for (const choice of sourceChoices) {
      sources.push({
        choice,
        label: getSourceLabel(source),
        entityName: choice.source_name,
        knownLanguages: choice.selected.map((slug) => {
          const options = choice.options as LanguageOption[] | null
          const option = options?.find(o => o.slug === String(slug))
          return option ?? { id: 0, name: String(slug) }
        })
      })
    }
  }

  // Add choices from each source type
  addSourceChoices(languageChoicesBySource.value.race, 'race')
  addSourceChoices(languageChoicesBySource.value.background, 'background')
  addSourceChoices(languageChoicesBySource.value.class, 'class')
  addSourceChoices(languageChoicesBySource.value.subclass_feature, 'subclass_feature')

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

// Custom icon helpers for language-specific states
function getCustomIcon(choiceId: string, slug: string): string | undefined {
  if (isLanguageAlreadyKnown(slug)) {
    return 'i-heroicons-check-circle-solid'
  }
  if (isLanguageSelectedElsewhere(choiceId, slug)) {
    return 'i-heroicons-no-symbol'
  }
  return undefined
}

function getCustomIconClass(choiceId: string, slug: string): string | undefined {
  if (isLanguageAlreadyKnown(slug)) {
    return 'text-success'
  }
  if (isLanguageSelectedElsewhere(choiceId, slug)) {
    return 'text-gray-300 dark:text-gray-600'
  }
  return undefined
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

    // Refresh choices - use prop if provided (level-up), otherwise sync wizard store
    if (props.refreshAfterSave) {
      await props.refreshAfterSave()
    } else {
      await store.syncWithBackend()
    }

    effectiveNextStep.value()
  } catch (e) {
    wizardErrors.choiceResolveFailed(e, toast, 'language')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="step-languages">
    <!-- Header -->
    <CharacterWizardStepHeader
      title="Choose Your Languages"
      description="Your race and background grant the following languages"
      class="mb-8"
    />

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
    <CharacterWizardLoadingState
      v-if="(pending || knownLanguagesPending || isLoading) && !choicesError"
    />

    <!-- Known Languages Section (using shared component) -->
    <CharacterWizardGrantedItemsSection
      v-if="!knownLanguagesPending"
      title="Languages You Know"
      :groups="knownLanguageGroups"
    />

    <!-- No choices needed -->
    <CharacterWizardEmptyState
      v-if="!hasAnyChoices && !pending && !knownLanguagesPending"
      icon="i-heroicons-check-circle"
      icon-color="success"
      title="No language choices needed"
      description="All your languages have been automatically assigned"
    />

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

        <!-- Language choices (using shared grid component) -->
        <CharacterWizardChoiceSelectionGrid
          :label="`Choose ${data.choice.quantity} language${data.choice.quantity > 1 ? 's' : ''}`"
          :quantity="data.choice.quantity"
          :selected-count="getSelectedCount(data.choice.id)"
        >
          <!-- Language-specific option buttons with custom icon logic -->
          <CharacterWizardChoiceToggleButton
            v-for="option in getLearnableOptions(data.choice.options)"
            :key="option.slug"
            :name="option.name"
            :selected="isOptionSelected(data.choice.id, option.slug)"
            :disabled="isOptionDisabled(data.choice.id, option.slug)"
            :disabled-reason="getDisabledReason(data.choice.id, option.slug) ?? undefined"
            :custom-icon="getCustomIcon(data.choice.id, option.slug)"
            :custom-icon-class="getCustomIconClass(data.choice.id, option.slug)"
            @toggle="handleToggle(data.choice, option.slug)"
          >
            <template #subtitle>
              <p
                v-if="option.script && !getDisabledReason(data.choice.id, option.slug)"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                Script: {{ option.script }}
              </p>
            </template>
          </CharacterWizardChoiceToggleButton>
        </CharacterWizardChoiceSelectionGrid>
      </div>
    </div>

    <!-- Continue Button -->
    <CharacterWizardContinueButton
      text="Continue with Languages"
      :disabled="!allLanguageChoicesComplete || pending || isLoading"
      :loading="pending || isLoading"
      @click="handleContinue"
    />
  </div>
</template>

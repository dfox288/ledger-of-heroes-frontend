<!-- app/components/character/wizard/StepProficiencies.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardChoiceSelection } from '~/composables/useWizardChoiceSelection'
import { wizardErrors } from '~/utils/wizardErrors'

type ProficiencyResource = components['schemas']['ProficiencyResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

const store = useCharacterWizardStore()
const { apiFetch } = useApi()
const { selections } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Toast for user feedback
const toast = useToast()

// ══════════════════════════════════════════════════════════════
// Fetch proficiency choices from unified API
// ══════════════════════════════════════════════════════════════

const {
  choicesByType,
  pending: loadingChoices,
  error: choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => store.characterId))

// Fetch on mount
onMounted(async () => {
  if (store.characterId) {
    await fetchChoices('proficiency')
  }
})

// Use choice selection composable for core selection logic
const {
  localSelections,
  isSaving,
  getSelectedCount,
  isOptionSelected,
  isOptionDisabled,
  getDisabledReason,
  allComplete: allProficiencyChoicesComplete,
  handleToggle: handleOptionToggle,
  saveAllChoices,
  fetchOptionsIfNeeded,
  getDisplayOptions,
  isOptionsLoading
} = useWizardChoiceSelection(
  computed(() => choicesByType.value.proficiencies),
  { resolveChoice }
)

// ══════════════════════════════════════════════════════════════
// Granted Proficiencies (Step-specific display logic)
// ══════════════════════════════════════════════════════════════

interface GrantedProficiencyGroup {
  type: string
  label: string
  icon: string
  items: ProficiencyResource[]
}

interface GrantedProficienciesBySource {
  source: 'class' | 'race' | 'background'
  entityName: string
  groups: GrantedProficiencyGroup[]
}

function getProficiencyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    armor: 'Armor',
    weapon: 'Weapons',
    tool: 'Tools',
    saving_throw: 'Saving Throws',
    skill: 'Skills'
  }
  return labels[type] ?? type
}

function getProficiencyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    armor: 'i-heroicons-shield-check',
    weapon: 'i-heroicons-bolt',
    tool: 'i-heroicons-wrench-screwdriver',
    saving_throw: 'i-heroicons-heart',
    skill: 'i-heroicons-academic-cap'
  }
  return icons[type] ?? 'i-heroicons-check-circle'
}

function groupGrantedProficiencies(proficiencies: ProficiencyResource[] | undefined): GrantedProficiencyGroup[] {
  if (!proficiencies) return []

  const granted = proficiencies.filter(p => !p.is_choice)

  const grouped = new Map<string, ProficiencyResource[]>()
  for (const prof of granted) {
    const type = prof.proficiency_type ?? 'other'
    const existing = grouped.get(type) ?? []
    grouped.set(type, [...existing, prof])
  }

  const typeOrder = ['saving_throw', 'armor', 'weapon', 'tool', 'skill']
  const result: GrantedProficiencyGroup[] = []

  for (const type of typeOrder) {
    const items = grouped.get(type)
    if (items && items.length > 0) {
      result.push({
        type,
        label: getProficiencyTypeLabel(type),
        icon: getProficiencyTypeIcon(type),
        items
      })
    }
  }

  for (const [type, items] of grouped) {
    if (!typeOrder.includes(type) && items.length > 0) {
      result.push({
        type,
        label: getProficiencyTypeLabel(type),
        icon: getProficiencyTypeIcon(type),
        items
      })
    }
  }

  return result
}

function getGrantedProficiencyName(prof: ProficiencyResource): string {
  return prof.proficiency_name ?? prof.proficiency_type_detail?.name ?? 'Unknown'
}

const grantedBySource = computed<GrantedProficienciesBySource[]>(() => {
  const sources: GrantedProficienciesBySource[] = []

  if (selections.value.class) {
    const groups = groupGrantedProficiencies(selections.value.class.proficiencies)
    if (groups.length > 0) {
      sources.push({
        source: 'class',
        entityName: selections.value.class.name,
        groups
      })
    }
  }

  if (selections.value.race) {
    const groups = groupGrantedProficiencies(selections.value.race.proficiencies)
    if (groups.length > 0) {
      sources.push({
        source: 'race',
        entityName: selections.value.race.name,
        groups
      })
    }
  }

  if (selections.value.background) {
    const groups = groupGrantedProficiencies(selections.value.background.proficiencies)
    if (groups.length > 0) {
      sources.push({
        source: 'background',
        entityName: selections.value.background.name,
        groups
      })
    }
  }

  return sources
})

const hasAnyGranted = computed(() => grantedBySource.value.length > 0)

// ══════════════════════════════════════════════════════════════
// Proficiency Choices - Group by source
// ══════════════════════════════════════════════════════════════

interface ChoicesBySource {
  source: 'class' | 'race' | 'background'
  label: string
  entityName: string
  choices: PendingChoice[]
}

const proficiencyChoicesBySource = computed<ChoicesBySource[]>(() => {
  const choices = choicesByType.value.proficiencies
  if (!choices || choices.length === 0) return []

  const sources: ChoicesBySource[] = []

  // Group by source
  const bySource = {
    class: choices.filter(c => c.source === 'class'),
    race: choices.filter(c => c.source === 'race'),
    background: choices.filter(c => c.source === 'background')
  }

  if (bySource.class.length > 0) {
    sources.push({
      source: 'class',
      label: 'From Class',
      entityName: bySource.class[0]?.source_name ?? selections.value.class?.name ?? 'Unknown',
      choices: bySource.class
    })
  }

  if (bySource.race.length > 0) {
    sources.push({
      source: 'race',
      label: 'From Race',
      entityName: bySource.race[0]?.source_name ?? selections.value.race?.name ?? 'Unknown',
      choices: bySource.race
    })
  }

  if (bySource.background.length > 0) {
    sources.push({
      source: 'background',
      label: 'From Background',
      entityName: bySource.background[0]?.source_name ?? selections.value.background?.name ?? 'Unknown',
      choices: bySource.background
    })
  }

  return sources
})

const hasAnyChoices = computed(() => {
  return proficiencyChoicesBySource.value.length > 0
})

// Load options for all choices on mount
watch(proficiencyChoicesBySource, async (sources) => {
  for (const source of sources) {
    for (const choice of source.choices) {
      await fetchOptionsIfNeeded(choice)
    }
  }
}, { immediate: true })

// ══════════════════════════════════════════════════════════════
// Choice label helper
// ══════════════════════════════════════════════════════════════

function getChoiceLabel(choice: PendingChoice): string {
  const subtype = choice.subtype ?? 'proficiency'
  const quantity = choice.quantity

  switch (subtype) {
    case 'skill':
      return `Choose ${quantity} skill${quantity > 1 ? 's' : ''}`
    case 'tool':
      return `Choose ${quantity} tool${quantity > 1 ? 's' : ''}`
    case 'weapon':
      return `Choose ${quantity} weapon${quantity > 1 ? 's' : ''}`
    case 'armor':
      return `Choose ${quantity} armor type${quantity > 1 ? 's' : ''}`
    default:
      return `Choose ${quantity} proficienc${quantity > 1 ? 'ies' : 'y'}`
  }
}

// ══════════════════════════════════════════════════════════════
// Navigation
// ══════════════════════════════════════════════════════════════

async function handleContinue() {
  if (!allProficiencyChoicesComplete.value) return

  try {
    await saveAllChoices()

    // Sync store with backend to update hasProficiencyChoices
    await store.syncWithBackend()

    // Move to next step
    await nextStep()
  } catch (err) {
    wizardErrors.choiceResolveFailed(err, toast, 'proficiency')
  }
}
</script>

<template>
  <div class="step-proficiencies space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-primary">
        Your Proficiencies
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Review your proficiencies from class, race, and background
      </p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="choicesError"
      color="error"
      icon="i-heroicons-exclamation-circle"
      title="Failed to load proficiency choices"
      :description="choicesError"
      class="mb-6"
    />

    <!-- Loading State -->
    <div
      v-if="loadingChoices && !choicesError"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Granted Proficiencies -->
    <div
      v-if="hasAnyGranted"
      class="space-y-6 mb-8"
    >
      <div
        v-for="sourceData in grantedBySource"
        :key="sourceData.source"
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
          From Your {{ sourceData.source === 'class' ? 'Class' : sourceData.source === 'race' ? 'Race' : 'Background' }} ({{ sourceData.entityName }})
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="group in sourceData.groups"
            :key="group.type"
            class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-2 mb-3">
              <UIcon
                :name="group.icon"
                class="w-5 h-5 text-primary"
              />
              <span class="font-medium text-gray-900 dark:text-white">{{ group.label }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="prof in group.items"
                :key="prof.id"
                class="inline-flex items-center gap-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-check"
                  class="w-3 h-3 text-success"
                />
                {{ getGrantedProficiencyName(prof) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Proficiency Choices -->
    <div
      v-if="hasAnyChoices"
      class="space-y-8"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        Additional Choices
      </h3>
      <div
        v-for="sourceData in proficiencyChoicesBySource"
        :key="sourceData.source"
        class="choice-source"
      >
        <h3 class="text-lg font-semibold mb-4">
          {{ sourceData.label }}: {{ sourceData.entityName }}
        </h3>

        <div
          v-for="choice in sourceData.choices"
          :key="choice.id"
          class="mb-6"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">
              {{ getChoiceLabel(choice) }}:
            </span>
            <UBadge
              :color="getSelectedCount(choice.id) === choice.quantity ? 'success' : 'neutral'"
              size="md"
            >
              {{ getSelectedCount(choice.id) }}/{{ choice.quantity }} selected
            </UBadge>
          </div>

          <div
            v-if="isOptionsLoading(choice)"
            class="flex items-center gap-2 p-4 text-gray-500"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-5 h-5 animate-spin"
            />
            <span>Loading options...</span>
          </div>

          <div
            v-else
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <button
              v-for="option in getDisplayOptions(choice)"
              :key="option.id"
              type="button"
              class="skill-option p-3 rounded-lg border text-left transition-all"
              :class="{
                'border-primary bg-primary/10': isOptionSelected(choice.id, option.id),
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isOptionSelected(choice.id, option.id) && !isOptionDisabled(choice.id, option.id),
                'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': isOptionDisabled(choice.id, option.id)
              }"
              :disabled="isOptionDisabled(choice.id, option.id)"
              @click="handleOptionToggle(choice, option.id)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isOptionSelected(choice.id, option.id) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
                  class="w-5 h-5"
                  :class="{
                    'text-primary': isOptionSelected(choice.id, option.id),
                    'text-gray-400': !isOptionSelected(choice.id, option.id)
                  }"
                />
                <span class="font-medium">{{ option.name }}</span>
              </div>
              <p
                v-if="getDisabledReason(choice.id, option.id)"
                class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-7"
              >
                {{ getDisabledReason(choice.id, option.id) }}
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
        :disabled="(hasAnyChoices && !allProficiencyChoicesComplete) || loadingChoices || isSaving"
        :loading="loadingChoices || isSaving"
        @click="handleContinue"
      >
        {{ hasAnyChoices ? 'Continue with Proficiencies' : 'Continue' }}
      </UButton>
    </div>
  </div>
</template>

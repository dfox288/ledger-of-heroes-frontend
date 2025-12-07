<!-- app/components/character/wizard/StepProficiencies.vue -->
<script setup lang="ts">
import type { components } from '~/types/api/generated'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { normalizeEndpoint } from '~/composables/useApi'

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

// Local state for tracking selections (before save)
const localSelections = ref<Map<string, Set<string>>>(new Map())

// Initialize local selections from already-resolved choices
watch(() => choicesByType.value.proficiencies, (choices) => {
  if (!choices) return
  for (const choice of choices) {
    if (choice.selected && choice.selected.length > 0) {
      localSelections.value.set(choice.id, new Set(choice.selected))
    }
  }
}, { immediate: true })

// ══════════════════════════════════════════════════════════════
// Options fetching for dynamic endpoints
// ══════════════════════════════════════════════════════════════

const optionsCache = ref<Map<string, unknown[]>>(new Map())
const loadingOptions = ref<Set<string>>(new Set())

async function fetchOptionsIfNeeded(choice: PendingChoice): Promise<void> {
  // If options are already provided, no need to fetch
  if (choice.options && choice.options.length > 0) return

  // If no endpoint provided, nothing to fetch
  if (!choice.options_endpoint) return

  // Check cache
  if (optionsCache.value.has(choice.id)) return

  // Already loading
  if (loadingOptions.value.has(choice.id)) return

  loadingOptions.value.add(choice.id)

  try {
    // Normalize endpoint: backend returns /api/v1/... but Nitro expects /...
    const endpoint = normalizeEndpoint(choice.options_endpoint)
    const response = await apiFetch<{ data: unknown[] }>(endpoint)
    if (response?.data) {
      optionsCache.value.set(choice.id, response.data)
    }
  } catch (err) {
    console.warn(`Failed to fetch options for choice ${choice.id}:`, err)
  } finally {
    loadingOptions.value.delete(choice.id)
  }
}

function getEffectiveOptions(choice: PendingChoice): unknown[] {
  if (choice.options && choice.options.length > 0) {
    return choice.options
  }
  return optionsCache.value.get(choice.id) ?? []
}

function isOptionsLoading(choice: PendingChoice): boolean {
  return loadingOptions.value.has(choice.id)
}

// ══════════════════════════════════════════════════════════════
// Granted Proficiencies
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
      entityName: selections.value.class?.name ?? 'Unknown',
      choices: bySource.class
    })
  }

  if (bySource.race.length > 0) {
    sources.push({
      source: 'race',
      label: 'From Race',
      entityName: selections.value.race?.name ?? 'Unknown',
      choices: bySource.race
    })
  }

  if (bySource.background.length > 0) {
    sources.push({
      source: 'background',
      label: 'From Background',
      entityName: selections.value.background?.name ?? 'Unknown',
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
// Selection Logic
// ══════════════════════════════════════════════════════════════

function getSelectedCount(choiceId: string): number {
  return localSelections.value.get(choiceId)?.size ?? 0
}

function isOptionSelected(choiceId: string, optionId: string | number): boolean {
  const selected = localSelections.value.get(choiceId)
  if (!selected) return false
  return selected.has(String(optionId))
}

function handleOptionToggle(choice: PendingChoice, optionId: string | number) {
  const id = String(optionId)
  const current = localSelections.value.get(choice.id) ?? new Set<string>()
  const updated = new Set(current)

  if (updated.has(id)) {
    updated.delete(id)
  } else {
    // Don't allow selection if quantity limit reached
    if (updated.size >= choice.quantity) return
    updated.add(id)
  }

  localSelections.value.set(choice.id, updated)
}

// ══════════════════════════════════════════════════════════════
// Option Display Helpers
// ══════════════════════════════════════════════════════════════

interface OptionDisplay {
  id: string | number
  name: string
}

function getDisplayOptions(choice: PendingChoice): OptionDisplay[] {
  const options = getEffectiveOptions(choice)
  return options.map((rawOpt: unknown) => {
    const opt = rawOpt as Record<string, unknown>
    // Handle skill options
    if (opt.skill) {
      const skill = opt.skill as { id: number, name: string }
      return { id: skill.id, name: skill.name }
    }
    // Handle proficiency_type options
    if (opt.proficiency_type) {
      const profType = opt.proficiency_type as { id: number, name: string }
      return { id: profType.id, name: profType.name }
    }
    // Fallback
    return { id: (opt.id as number) ?? 0, name: (opt.name as string) ?? 'Unknown' }
  })
}

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
// Save Logic
// ══════════════════════════════════════════════════════════════

const allProficiencyChoicesComplete = computed(() => {
  const choices = choicesByType.value.proficiencies
  if (!choices || choices.length === 0) return true

  for (const choice of choices) {
    const selectedCount = getSelectedCount(choice.id)
    if (selectedCount < choice.quantity) {
      return false
    }
  }

  return true
})

const isSaving = ref(false)

async function handleContinue() {
  if (!allProficiencyChoicesComplete.value) return

  isSaving.value = true

  try {
    // Resolve each choice with local selections
    const choices = choicesByType.value.proficiencies ?? []
    for (const choice of choices) {
      const selected = localSelections.value.get(choice.id)
      if (!selected || selected.size === 0) continue

      // Only resolve if there are new selections (different from already selected)
      const currentSelected = new Set(choice.selected)
      const hasChanges = selected.size !== currentSelected.size
        || [...selected].some(id => !currentSelected.has(id))

      if (hasChanges) {
        await resolveChoice(choice.id, { selected: Array.from(selected) })
      }
    }

    // Sync store with backend to update hasProficiencyChoices
    await store.syncWithBackend()

    // Move to next step
    await nextStep()
  } catch (err) {
    console.error('Failed to save proficiency choices:', err)
    toast.add({
      title: 'Failed to save proficiencies',
      description: 'Please try again',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="step-proficiencies">
    <div class="text-center mb-8">
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
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isOptionSelected(choice.id, option.id)
              }"
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

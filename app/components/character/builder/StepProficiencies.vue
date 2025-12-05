<!-- app/components/character/builder/StepProficiencies.vue -->
<script setup lang="ts">
import type { ProficiencyOption, ProficiencyTypeOption, ProficiencyTypeLookupResponse } from '~/types/proficiencies'
import type { components } from '~/types/api/generated'
import { useWizardNavigation } from '~/composables/useWizardSteps'

type ProficiencyResource = components['schemas']['ProficiencyResource']

const store = useCharacterBuilderStore()
const { apiFetch } = useApi()
const { proficiencyChoices, pendingProficiencySelections, allProficiencyChoicesComplete, isLoading, selectedClass, selectedRace, selectedBackground } = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// ══════════════════════════════════════════════════════════════
// Subcategory Options Fetching
// ══════════════════════════════════════════════════════════════

/**
 * Cache for fetched subcategory options
 * Key: "{category}:{subcategory}" -> ProficiencyOption[]
 */
const subcategoryOptionsCache = ref<Map<string, ProficiencyOption[]>>(new Map())
const loadingSubcategories = ref<Set<string>>(new Set())

/**
 * Fetch options for a subcategory-based choice
 */
async function fetchSubcategoryOptions(category: string, subcategory: string): Promise<ProficiencyOption[]> {
  const cacheKey = `${category}:${subcategory}`

  // Return cached if available
  if (subcategoryOptionsCache.value.has(cacheKey)) {
    return subcategoryOptionsCache.value.get(cacheKey)!
  }

  // Mark as loading
  loadingSubcategories.value.add(cacheKey)

  try {
    const response = await apiFetch<ProficiencyTypeLookupResponse>('/proficiency-types', {
      query: { category, subcategory }
    })

    // Handle case where response.data might be undefined (in tests, etc.)
    if (!response?.data) {
      return []
    }

    // Transform lookup response to ProficiencyOption format
    const options: ProficiencyOption[] = response.data.map(item => ({
      type: 'proficiency_type' as const,
      proficiency_type_id: item.id,
      proficiency_type: {
        id: item.id,
        name: item.name,
        slug: item.slug
      }
    }))

    // Cache the result
    subcategoryOptionsCache.value.set(cacheKey, options)
    return options
  }
  catch {
    // API errors (test environment, network issues) - return empty array
    console.warn(`Failed to fetch proficiency types for ${category}:${subcategory}`)
    return []
  }
  finally {
    loadingSubcategories.value.delete(cacheKey)
  }
}

/**
 * Check if a subcategory is currently loading
 */
function isSubcategoryLoading(category: string | null, subcategory: string | null): boolean {
  if (!category || !subcategory) return false
  return loadingSubcategories.value.has(`${category}:${subcategory}`)
}

// ══════════════════════════════════════════════════════════════
// Granted Proficiencies (non-choice, automatically assigned)
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

/**
 * Get display label for proficiency type
 */
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

/**
 * Get icon for proficiency type
 */
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

/**
 * Group proficiencies by type and filter to only granted (non-choice) ones
 */
function groupGrantedProficiencies(proficiencies: ProficiencyResource[] | undefined): GrantedProficiencyGroup[] {
  if (!proficiencies) return []

  // Filter to only non-choice proficiencies
  const granted = proficiencies.filter(p => !p.is_choice)

  // Group by type
  const grouped = new Map<string, ProficiencyResource[]>()
  for (const prof of granted) {
    const type = prof.proficiency_type ?? 'other'
    const existing = grouped.get(type) ?? []
    grouped.set(type, [...existing, prof])
  }

  // Convert to array with labels and icons, in display order
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

  // Add any remaining types not in our order
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

/**
 * Get display name for a proficiency
 */
function getGrantedProficiencyName(prof: ProficiencyResource): string {
  return prof.proficiency_name ?? prof.proficiency_type_detail?.name ?? 'Unknown'
}

/**
 * Granted proficiencies organized by source
 */
const grantedBySource = computed<GrantedProficienciesBySource[]>(() => {
  const sources: GrantedProficienciesBySource[] = []

  if (selectedClass.value) {
    const groups = groupGrantedProficiencies(selectedClass.value.proficiencies)
    if (groups.length > 0) {
      sources.push({
        source: 'class',
        entityName: selectedClass.value.name,
        groups
      })
    }
  }

  if (selectedRace.value) {
    const groups = groupGrantedProficiencies(selectedRace.value.proficiencies)
    if (groups.length > 0) {
      sources.push({
        source: 'race',
        entityName: selectedRace.value.name,
        groups
      })
    }
  }

  if (selectedBackground.value) {
    const groups = groupGrantedProficiencies(selectedBackground.value.proficiencies)
    if (groups.length > 0) {
      sources.push({
        source: 'background',
        entityName: selectedBackground.value.name,
        groups
      })
    }
  }

  return sources
})

const hasAnyGranted = computed(() => grantedBySource.value.length > 0)

// ══════════════════════════════════════════════════════════════
// Proficiency Choices (player selectable)
// ══════════════════════════════════════════════════════════════

const hasAnyChoices = computed(() => {
  if (!proficiencyChoices.value) return false
  const { class: cls, race, background } = proficiencyChoices.value.data
  return Object.keys(cls).length > 0
    || Object.keys(race).length > 0
    || Object.keys(background).length > 0
})

// Extended group interface with subcategory support
interface ChoiceGroup {
  groupName: string
  quantity: number
  remaining: number
  selectedSkills: number[]
  selectedProficiencyTypes: number[]
  options: ProficiencyOption[]
  proficiencyType: string | null
  proficiencySubcategory: string | null
}

interface ChoiceSource {
  source: 'class' | 'race' | 'background'
  label: string
  entityName: string
  groups: ChoiceGroup[]
}

// Organize choices by source for display
const choicesBySource = computed<ChoiceSource[]>(() => {
  if (!proficiencyChoices.value) return []

  const sources: ChoiceSource[] = []
  const { class: cls, race, background } = proficiencyChoices.value.data

  const mapGroups = (groups: typeof cls): ChoiceGroup[] =>
    Object.entries(groups).map(([groupName, group]) => ({
      groupName,
      quantity: group.quantity,
      remaining: group.remaining,
      selectedSkills: group.selected_skills ?? [],
      selectedProficiencyTypes: group.selected_proficiency_types ?? [],
      options: group.options,
      proficiencyType: group.proficiency_type ?? null,
      proficiencySubcategory: group.proficiency_subcategory ?? null
    }))

  if (Object.keys(cls).length > 0) {
    sources.push({
      source: 'class',
      label: 'From Class',
      entityName: selectedClass.value?.name ?? 'Unknown',
      groups: mapGroups(cls)
    })
  }

  if (Object.keys(race).length > 0) {
    sources.push({
      source: 'race',
      label: 'From Race',
      entityName: selectedRace.value?.name ?? 'Unknown',
      groups: mapGroups(race)
    })
  }

  if (Object.keys(background).length > 0) {
    sources.push({
      source: 'background',
      label: 'From Background',
      entityName: selectedBackground.value?.name ?? 'Unknown',
      groups: mapGroups(background)
    })
  }

  return sources
})

/**
 * Get effective options for a choice group
 * If the group has a subcategory and no inline options, fetch from lookup
 */
function getEffectiveOptions(group: ChoiceGroup): ProficiencyOption[] {
  // If options are provided inline, use them
  if (group.options.length > 0) {
    return group.options
  }

  // If subcategory is set, check cache
  if (group.proficiencyType && group.proficiencySubcategory) {
    const cacheKey = `${group.proficiencyType}:${group.proficiencySubcategory}`
    return subcategoryOptionsCache.value.get(cacheKey) ?? []
  }

  return []
}

/**
 * Trigger fetch for subcategory options when needed
 */
async function loadSubcategoryOptionsIfNeeded(group: ChoiceGroup): Promise<void> {
  if (group.options.length === 0 && group.proficiencyType && group.proficiencySubcategory) {
    const cacheKey = `${group.proficiencyType}:${group.proficiencySubcategory}`
    if (!subcategoryOptionsCache.value.has(cacheKey) && !loadingSubcategories.value.has(cacheKey)) {
      await fetchSubcategoryOptions(group.proficiencyType, group.proficiencySubcategory)
    }
  }
}

// Fetch subcategory options on mount for any groups that need them
onMounted(async () => {
  for (const source of choicesBySource.value) {
    for (const group of source.groups) {
      await loadSubcategoryOptionsIfNeeded(group)
    }
  }
})

// Re-fetch if choices change
watch(choicesBySource, async (sources) => {
  for (const source of sources) {
    for (const group of source.groups) {
      await loadSubcategoryOptionsIfNeeded(group)
    }
  }
}, { immediate: false })

/**
 * Initialize pending selections from API's selected_skills/selected_proficiency_types
 * This pre-populates the selections when editing an existing character
 */
function initializePendingSelections() {
  if (!proficiencyChoices.value) return

  const { class: cls, race, background } = proficiencyChoices.value.data

  // Helper to initialize a source's selections
  const initSource = (source: 'class' | 'race' | 'background', groups: typeof cls) => {
    for (const [groupName, group] of Object.entries(groups)) {
      const key = `${source}:${groupName}`

      // Only initialize if not already in pending selections
      if (!pendingProficiencySelections.value.has(key)) {
        const selectedIds = new Set<number>()

        // Add previously selected skills
        for (const skillId of group.selected_skills ?? []) {
          selectedIds.add(skillId)
        }

        // Note: proficiency_type selections would need separate tracking
        // For now, we focus on skills which are the most common

        if (selectedIds.size > 0) {
          store.initializeProficiencySelections(source, groupName, selectedIds)
        }
      }
    }
  }

  initSource('class', cls)
  initSource('race', race)
  initSource('background', background)
}

// Initialize on mount
onMounted(() => {
  initializePendingSelections()
})

// Re-initialize if proficiencyChoices changes (e.g., after refetch)
watch(proficiencyChoices, () => {
  initializePendingSelections()
}, { immediate: false })

// Get selected count for a choice group
function getSelectedCount(source: string, groupName: string): number {
  const key = `${source}:${groupName}`
  return pendingProficiencySelections.value.get(key)?.size ?? 0
}

// Check if a skill is selected (either pending or from API)
function isSkillSelected(source: string, groupName: string, skillId: number): boolean {
  const key = `${source}:${groupName}`
  return pendingProficiencySelections.value.get(key)?.has(skillId) ?? false
}

// Handle skill toggle
function handleSkillToggle(source: 'class' | 'race' | 'background', groupName: string, skillId: number, quantity: number) {
  const key = `${source}:${groupName}`
  const current = pendingProficiencySelections.value.get(key)?.size ?? 0
  const isSelected = isSkillSelected(source, groupName, skillId)

  // Don't allow selecting more than quantity (unless deselecting)
  if (!isSelected && current >= quantity) return

  store.toggleProficiencySelection(source, groupName, skillId)
}

/**
 * Get display name for an option (handles both skill and proficiency_type)
 */
function getOptionName(option: ProficiencyOption): string {
  if (option.type === 'skill') {
    return option.skill.name
  } else {
    return option.proficiency_type.name
  }
}

/**
 * Get option ID for keying and selection
 */
function getOptionId(option: ProficiencyOption): number {
  if (option.type === 'skill') {
    return option.skill_id
  } else {
    return option.proficiency_type_id
  }
}

/**
 * Get human-readable label for a proficiency type category
 */
function getLabelForProficiencyType(type: string, quantity: number): string {
  switch (type) {
    case 'skill':
      return `Choose ${quantity} skill${quantity > 1 ? 's' : ''}`
    case 'tool':
      return `Choose ${quantity} tool${quantity > 1 ? 's' : ''}`
    case 'weapon':
      return `Choose ${quantity} weapon${quantity > 1 ? 's' : ''}`
    case 'armor':
      return `Choose ${quantity} armor type${quantity > 1 ? 's' : ''}`
    case 'language':
      return `Choose ${quantity} language${quantity > 1 ? 's' : ''}`
    default:
      return `Choose ${quantity} proficienc${quantity > 1 ? 'ies' : 'y'}`
  }
}

/**
 * Get the label for a choice group based on option types or proficiency_type field
 * Returns "skill", "proficiency", or the specific type name
 */
function getChoiceLabel(group: ChoiceGroup): string {
  const options = getEffectiveOptions(group)
  const quantity = group.quantity

  // If we have a proficiency_type set from the API, use it directly
  // This handles subcategory-based choices where options may be empty initially
  if (group.proficiencyType) {
    return getLabelForProficiencyType(group.proficiencyType, quantity)
  }

  const firstOption = options[0]
  if (!firstOption) return `Choose ${quantity}`

  // Check if all options are the same type
  const firstType = firstOption.type
  const allSameType = options.every(opt => opt.type === firstType)

  if (allSameType && firstType === 'skill') {
    return `Choose ${quantity} skill${quantity > 1 ? 's' : ''}`
  }

  if (allSameType && firstType === 'proficiency_type') {
    // Try to get a more specific label from the proficiency type category
    const proficiencyOption = firstOption as ProficiencyTypeOption
    const name = proficiencyOption.proficiency_type.name

    // Check for common patterns to provide better labels
    if (name.toLowerCase().includes('tool')) {
      return `Choose ${quantity} tool${quantity > 1 ? 's' : ''}`
    }
    if (name.toLowerCase().includes('weapon')) {
      return `Choose ${quantity} weapon${quantity > 1 ? 's' : ''}`
    }
    if (name.toLowerCase().includes('armor')) {
      return `Choose ${quantity} armor type${quantity > 1 ? 's' : ''}`
    }
    if (name.toLowerCase().includes('language')) {
      return `Choose ${quantity} language${quantity > 1 ? 's' : ''}`
    }

    return `Choose ${quantity} proficienc${quantity > 1 ? 'ies' : 'y'}`
  }

  // Mixed types
  return `Choose ${quantity} option${quantity > 1 ? 's' : ''}`
}

/**
 * Continue to next step - saves proficiency choices first
 */
async function handleContinue() {
  await store.saveProficiencyChoices()
  nextStep()
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

    <!-- Granted Proficiencies (always shown) -->
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

        <!-- Proficiency groups by type -->
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

    <!-- Proficiency Choices Section -->
    <div
      v-if="hasAnyChoices"
      class="space-y-8"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        Additional Choices
      </h3>
      <div
        v-for="sourceData in choicesBySource"
        :key="sourceData.source"
        class="choice-source"
      >
        <!-- Source header -->
        <h3 class="text-lg font-semibold mb-4">
          {{ sourceData.label }}: {{ sourceData.entityName }}
        </h3>

        <!-- Choice groups within source -->
        <div
          v-for="group in sourceData.groups"
          :key="group.groupName"
          class="mb-6"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">
              {{ getChoiceLabel(group) }}:
            </span>
            <UBadge
              :color="getSelectedCount(sourceData.source, group.groupName) === group.quantity ? 'success' : 'neutral'"
              size="md"
            >
              {{ getSelectedCount(sourceData.source, group.groupName) }}/{{ group.quantity }} selected
            </UBadge>
          </div>

          <!-- Loading state for subcategory options -->
          <div
            v-if="isSubcategoryLoading(group.proficiencyType, group.proficiencySubcategory)"
            class="flex items-center gap-2 p-4 text-gray-500"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-5 h-5 animate-spin"
            />
            <span>Loading options...</span>
          </div>

          <!-- Skill options grid -->
          <div
            v-else
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <button
              v-for="option in getEffectiveOptions(group)"
              :key="getOptionId(option)"
              type="button"
              class="skill-option p-3 rounded-lg border text-left transition-all"
              :class="{
                'border-primary bg-primary/10': isSkillSelected(sourceData.source, group.groupName, getOptionId(option)),
                'border-gray-200 dark:border-gray-700 hover:border-primary/50': !isSkillSelected(sourceData.source, group.groupName, getOptionId(option))
              }"
              @click="handleSkillToggle(sourceData.source, group.groupName, getOptionId(option), group.quantity)"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isSkillSelected(sourceData.source, group.groupName, getOptionId(option)) ? 'i-heroicons-check-circle-solid' : 'i-heroicons-circle'"
                  class="w-5 h-5"
                  :class="{
                    'text-primary': isSkillSelected(sourceData.source, group.groupName, getOptionId(option)),
                    'text-gray-400': !isSkillSelected(sourceData.source, group.groupName, getOptionId(option))
                  }"
                />
                <span class="font-medium">{{ getOptionName(option) }}</span>
              </div>
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
        :disabled="(hasAnyChoices && !allProficiencyChoicesComplete) || isLoading"
        :loading="isLoading"
        @click="handleContinue"
      >
        {{ hasAnyChoices ? 'Continue with Proficiencies' : 'Continue' }}
      </UButton>
    </div>
  </div>
</template>

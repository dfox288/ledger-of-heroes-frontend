<!-- app/components/character/wizard/StepProficiencies.vue -->
<script setup lang="ts">
import type { ProficiencyOption, ProficiencyTypeOption, ProficiencyTypeLookupResponse } from '~/types/proficiencies'
import type { components } from '~/types/api/generated'
import { useWizardNavigation } from '~/composables/useWizardSteps'
import { useCharacterWizardStore } from '~/stores/characterWizard'

type ProficiencyResource = components['schemas']['ProficiencyResource']

const store = useCharacterWizardStore()
const { apiFetch } = useApi()
const { selections, pendingChoices, isLoading } = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// ══════════════════════════════════════════════════════════════
// Fetch proficiency choices from backend
// ══════════════════════════════════════════════════════════════

interface ProficiencyChoiceGroup {
  quantity: number
  remaining: number
  selected_skills?: number[]
  selected_proficiency_types?: number[]
  options: ProficiencyOption[]
  proficiency_type?: string | null
  proficiency_subcategory?: string | null
}

interface ProficiencyChoicesResponse {
  data: {
    class: Record<string, ProficiencyChoiceGroup>
    race: Record<string, ProficiencyChoiceGroup>
    background: Record<string, ProficiencyChoiceGroup>
  }
}

const { data: proficiencyChoices, pending: loadingChoices } = await useAsyncData(
  `wizard-proficiency-choices-${store.characterId}`,
  () => apiFetch<ProficiencyChoicesResponse>(`/characters/${store.characterId}/proficiency-choices`),
  { watch: [() => store.characterId] }
)

// ══════════════════════════════════════════════════════════════
// Subcategory Options Fetching
// ══════════════════════════════════════════════════════════════

const subcategoryOptionsCache = ref<Map<string, ProficiencyOption[]>>(new Map())
const loadingSubcategories = ref<Set<string>>(new Set())

async function fetchSubcategoryOptions(category: string, subcategory: string): Promise<ProficiencyOption[]> {
  const cacheKey = `${category}:${subcategory}`

  if (subcategoryOptionsCache.value.has(cacheKey)) {
    return subcategoryOptionsCache.value.get(cacheKey)!
  }

  loadingSubcategories.value.add(cacheKey)

  try {
    const response = await apiFetch<ProficiencyTypeLookupResponse>('/proficiency-types', {
      query: { category, subcategory }
    })

    if (!response?.data) {
      return []
    }

    const options: ProficiencyOption[] = response.data.map(item => ({
      type: 'proficiency_type' as const,
      proficiency_type_id: item.id,
      proficiency_type: {
        id: item.id,
        name: item.name,
        slug: item.slug
      }
    }))

    subcategoryOptionsCache.value.set(cacheKey, options)
    return options
  }
  catch {
    console.warn(`Failed to fetch proficiency types for ${category}:${subcategory}`)
    return []
  }
  finally {
    loadingSubcategories.value.delete(cacheKey)
  }
}

function isSubcategoryLoading(category: string | null, subcategory: string | null): boolean {
  if (!category || !subcategory) return false
  return loadingSubcategories.value.has(`${category}:${subcategory}`)
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
// Proficiency Choices
// ══════════════════════════════════════════════════════════════

const hasAnyChoices = computed(() => {
  if (!proficiencyChoices.value) return false
  const { class: cls, race, background } = proficiencyChoices.value.data
  return Object.keys(cls).length > 0
    || Object.keys(race).length > 0
    || Object.keys(background).length > 0
})

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
      entityName: selections.value.class?.name ?? 'Unknown',
      groups: mapGroups(cls)
    })
  }

  if (Object.keys(race).length > 0) {
    sources.push({
      source: 'race',
      label: 'From Race',
      entityName: selections.value.race?.name ?? 'Unknown',
      groups: mapGroups(race)
    })
  }

  if (Object.keys(background).length > 0) {
    sources.push({
      source: 'background',
      label: 'From Background',
      entityName: selections.value.background?.name ?? 'Unknown',
      groups: mapGroups(background)
    })
  }

  return sources
})

function getEffectiveOptions(group: ChoiceGroup): ProficiencyOption[] {
  if (group.options.length > 0) {
    return group.options
  }

  if (group.proficiencyType && group.proficiencySubcategory) {
    const cacheKey = `${group.proficiencyType}:${group.proficiencySubcategory}`
    return subcategoryOptionsCache.value.get(cacheKey) ?? []
  }

  return []
}

async function loadSubcategoryOptionsIfNeeded(group: ChoiceGroup): Promise<void> {
  if (group.options.length === 0 && group.proficiencyType && group.proficiencySubcategory) {
    const cacheKey = `${group.proficiencyType}:${group.proficiencySubcategory}`
    if (!subcategoryOptionsCache.value.has(cacheKey) && !loadingSubcategories.value.has(cacheKey)) {
      await fetchSubcategoryOptions(group.proficiencyType, group.proficiencySubcategory)
    }
  }
}

onMounted(async () => {
  for (const source of choicesBySource.value) {
    for (const group of source.groups) {
      await loadSubcategoryOptionsIfNeeded(group)
    }
  }
})

watch(choicesBySource, async (sources) => {
  for (const source of sources) {
    for (const group of source.groups) {
      await loadSubcategoryOptionsIfNeeded(group)
    }
  }
}, { immediate: false })

function getSelectedCount(source: string, groupName: string): number {
  const key = `${source}:${groupName}`
  return pendingChoices.value.proficiencies.get(key)?.size ?? 0
}

function isSkillSelected(source: string, groupName: string, skillId: number): boolean {
  const key = `${source}:${groupName}`
  return pendingChoices.value.proficiencies.get(key)?.has(skillId) ?? false
}

function handleSkillToggle(source: 'class' | 'race' | 'background', groupName: string, skillId: number, quantity: number) {
  const key = `${source}:${groupName}`
  const current = getSelectedCount(source, groupName)
  const isSelected = isSkillSelected(source, groupName, skillId)

  if (!isSelected && current >= quantity) return

  store.toggleProficiencyChoice(key, skillId)
}

function getOptionName(option: ProficiencyOption): string {
  if (option.type === 'skill') {
    return option.skill.name
  } else {
    return option.proficiency_type.name
  }
}

function getOptionId(option: ProficiencyOption): number {
  if (option.type === 'skill') {
    return option.skill_id
  } else {
    return option.proficiency_type_id
  }
}

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

function getChoiceLabel(group: ChoiceGroup): string {
  const options = getEffectiveOptions(group)
  const quantity = group.quantity

  if (group.proficiencyType) {
    return getLabelForProficiencyType(group.proficiencyType, quantity)
  }

  const firstOption = options[0]
  if (!firstOption) return `Choose ${quantity}`

  const firstType = firstOption.type
  const allSameType = options.every(opt => opt.type === firstType)

  if (allSameType && firstType === 'skill') {
    return `Choose ${quantity} skill${quantity > 1 ? 's' : ''}`
  }

  if (allSameType && firstType === 'proficiency_type') {
    const proficiencyOption = firstOption as ProficiencyTypeOption
    const name = proficiencyOption.proficiency_type.name

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

  return `Choose ${quantity} option${quantity > 1 ? 's' : ''}`
}

const allProficiencyChoicesComplete = computed(() => {
  if (!proficiencyChoices.value) return true

  for (const source of choicesBySource.value) {
    for (const group of source.groups) {
      if (getSelectedCount(source.source, group.groupName) < group.quantity) {
        return false
      }
    }
  }

  return true
})

async function handleContinue() {
  // TODO: Save proficiency choices to backend when API is ready
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
        v-for="sourceData in choicesBySource"
        :key="sourceData.source"
        class="choice-source"
      >
        <h3 class="text-lg font-semibold mb-4">
          {{ sourceData.label }}: {{ sourceData.entityName }}
        </h3>

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

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Spell } from '~/types'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'
import { useWizardNavigation } from '~/composables/useWizardSteps'

const store = useCharacterBuilderStore()
const {
  characterId,
  name,
  selectedRace,
  selectedClass,
  selectedBackground,
  abilityScores,
  isCaster,
  hasPendingChoices,
  proficiencyChoices,
  pendingProficiencySelections,
  pendingSpellIds,
  fixedEquipment,
  equipmentByChoiceGroup,
  equipmentChoices,
  isLoading
} = storeToRefs(store)
const { goToStep } = useWizardNavigation()

// Fetch available spells for display in review (only for casters)
const { apiFetch } = useApi()
const { data: availableSpells } = await useAsyncData(
  `review-available-spells-${characterId.value}`,
  () => isCaster.value
    ? apiFetch<{ data: Spell[] }>(`/characters/${characterId.value}/available-spells?max_level=1&include_known=true`)
    : Promise.resolve({ data: [] }),
  { transform: (response: { data: Spell[] }) => response.data }
)

// Fetch saved proficiencies for display (skill names)
interface CharacterProficiency {
  id: number
  source: string
  skill?: { id: number, name: string, slug: string }
  proficiency_type?: { id: number, name: string, slug: string, category: string }
}

const { data: savedProficiencies } = await useAsyncData(
  `review-proficiencies-${characterId.value}`,
  () => apiFetch<{ data: CharacterProficiency[] }>(`/characters/${characterId.value}/proficiencies`),
  { transform: (response: { data: CharacterProficiency[] }) => response.data }
)

// Get selected spells by filtering available spells by pending IDs
const selectedSpellsForDisplay = computed(() => {
  if (!availableSpells.value) return []
  return availableSpells.value.filter(spell => pendingSpellIds.value.has(spell.id))
})

/**
 * Get the selected item for a choice group
 */
function getSelectedEquipmentItem(group: string) {
  const selectedId = equipmentChoices.value.get(group)
  if (!selectedId) return null

  const items = equipmentByChoiceGroup.value.get(group) ?? []
  return items.find(item => item.id === selectedId)
}

/**
 * Get display name for equipment item
 */
function getItemDisplayName(item: { item?: { name?: string } | null, description?: string | null }): string {
  if (item.item?.name) return item.item.name
  if (item.description) return item.description
  return 'Unknown item'
}

/**
 * Navigate to edit a specific step by name
 */
function editStep(stepName: string) {
  goToStep(stepName)
}

/**
 * Finish character creation and navigate to characters list
 */
function finishCreation() {
  navigateTo('/characters')
}

/**
 * Ability score labels
 */
const abilityLabels = [
  { key: 'strength', label: 'STR' },
  { key: 'dexterity', label: 'DEX' },
  { key: 'constitution', label: 'CON' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'WIS' },
  { key: 'charisma', label: 'CHA' }
] as const

/**
 * Get selected skill names from pending proficiency selections
 */
const selectedSkillNames = computed(() => {
  const skills: string[] = []

  for (const [key, skillIds] of pendingProficiencySelections.value) {
    const [source, groupName] = key.split(':') as ['class' | 'race' | 'background', string]
    const sourceData = proficiencyChoices.value?.data[source]
    if (!sourceData || !groupName) continue

    const group = sourceData[groupName]

    if (group) {
      for (const skillId of skillIds) {
        // Handle both skill and proficiency_type options
        const option = group.options.find((o) => {
          if (o.type === 'skill') return o.skill_id === skillId
          if (o.type === 'proficiency_type') return o.proficiency_type_id === skillId
          return false
        })
        if (option) {
          if (option.type === 'skill') {
            skills.push(option.skill.name)
          } else if (option.type === 'proficiency_type') {
            skills.push(option.proficiency_type.name)
          }
        }
      }
    }
  }

  return skills
})

/**
 * Check if there are any saved proficiency choices (remaining < quantity)
 */
const hasExistingProficiencyChoices = computed(() => {
  if (!proficiencyChoices.value) return false
  const { class: cls, race, background } = proficiencyChoices.value.data

  for (const group of Object.values(cls)) {
    if (group.remaining < group.quantity) return true
  }
  for (const group of Object.values(race)) {
    if (group.remaining < group.quantity) return true
  }
  for (const group of Object.values(background)) {
    if (group.remaining < group.quantity) return true
  }

  return false
})

/**
 * Get saved skill proficiency names from the proficiencies endpoint
 * Filters to only skill proficiencies (those with a skill object, not proficiency_type)
 */
const savedSkillProficiencies = computed((): string[] => {
  if (!savedProficiencies.value) return []
  return savedProficiencies.value
    .filter(p => p.skill !== undefined && p.skill !== null)
    .map(p => p.skill!.name)
})

/**
 * Get level 1 class features
 */
const classFeatures = computed(() => {
  if (!selectedClass.value?.features) return []
  // Filter to level 1 features only (for level 1 character creation)
  return selectedClass.value.features.filter(f => f.level === 1)
})

/**
 * Get racial traits
 */
const racialTraits = computed(() => {
  return selectedRace.value?.traits ?? []
})

/**
 * Check if any features exist to display
 */
const hasFeatures = computed(() => {
  return classFeatures.value.length > 0
    || racialTraits.value.length > 0
    || !!selectedBackground.value?.feature_name
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Review Your Character
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Make sure everything looks right before finishing
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="space-y-4">
      <!-- Name -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Character Name
            </h3>
            <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {{ name }}
            </p>
          </div>
          <UButton
            data-test="edit-name"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('name')"
          />
        </div>
      </div>

      <!-- Race -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Race
            </h3>
            <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedRace?.name ?? 'Not selected' }}
            </p>
          </div>
          <UButton
            data-test="edit-race"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('race')"
          />
        </div>
      </div>

      <!-- Class -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Class
            </h3>
            <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedClass?.name ?? 'Not selected' }}
            </p>
            <p
              v-if="selectedClass?.hit_die"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              Hit Die: d{{ selectedClass.hit_die }}
            </p>
          </div>
          <UButton
            data-test="edit-class"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('class')"
          />
        </div>
      </div>

      <!-- Ability Scores -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Ability Scores
          </h3>
          <UButton
            data-test="edit-abilities"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('abilities')"
          />
        </div>
        <div class="grid grid-cols-6 gap-2">
          <div
            v-for="ability in abilityLabels"
            :key="ability.key"
            class="text-center"
          >
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
              {{ ability.label }}
            </div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">
              {{ abilityScores[ability.key] }}
            </div>
          </div>
        </div>
      </div>

      <!-- Background -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Background
            </h3>
            <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedBackground?.name ?? 'Not selected' }}
            </p>
            <p
              v-if="selectedBackground?.feature_name"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              Feature: {{ selectedBackground.feature_name }}
            </p>
          </div>
          <UButton
            data-test="edit-background"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('background')"
          />
        </div>
      </div>

      <!-- Proficiencies (shown if pending selections OR already saved choices) -->
      <div
        v-if="selectedSkillNames.length > 0 || hasExistingProficiencyChoices"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Skill Proficiencies
          </h3>
          <!-- Edit button only shown if step exists -->
          <UButton
            v-if="hasPendingChoices"
            data-test="edit-proficiencies"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('proficiencies')"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <!-- Show pending selections if any -->
          <UBadge
            v-for="skill in selectedSkillNames"
            :key="skill"
            color="primary"
            variant="subtle"
            size="md"
          >
            {{ skill }}
          </UBadge>
          <!-- Show saved choices if no pending selections -->
          <template v-if="selectedSkillNames.length === 0">
            <UBadge
              v-for="skill in savedSkillProficiencies"
              :key="skill"
              color="primary"
              variant="subtle"
              size="md"
            >
              {{ skill }}
            </UBadge>
          </template>
        </div>
      </div>

      <!-- Features & Traits (read-only, no edit button) -->
      <div
        v-if="hasFeatures"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Features & Traits
        </h3>
        <div class="space-y-4">
          <!-- Class Features -->
          <div v-if="classFeatures.length > 0">
            <h4 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Class Features
            </h4>
            <ul class="space-y-1">
              <li
                v-for="feature in classFeatures"
                :key="`class-${feature.id}`"
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-star"
                  class="w-4 h-4 text-yellow-500 flex-shrink-0"
                />
                <span>{{ feature.feature_name }}</span>
              </li>
            </ul>
          </div>

          <!-- Racial Traits -->
          <div v-if="racialTraits.length > 0">
            <h4 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Racial Traits
            </h4>
            <ul class="space-y-1">
              <li
                v-for="trait in racialTraits"
                :key="`race-${trait.id}`"
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-sparkles"
                  class="w-4 h-4 text-indigo-500 flex-shrink-0"
                />
                <span>{{ trait.name }}</span>
              </li>
            </ul>
          </div>

          <!-- Background Feature -->
          <div v-if="selectedBackground?.feature_name">
            <h4 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Background Feature
            </h4>
            <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <UIcon
                name="i-heroicons-book-open"
                class="w-4 h-4 text-emerald-500 flex-shrink-0"
              />
              <span>{{ selectedBackground.feature_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment -->
      <div
        v-if="fixedEquipment.length > 0 || equipmentByChoiceGroup.size > 0"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Equipment
          </h3>
          <UButton
            data-test="edit-equipment"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('equipment')"
          />
        </div>
        <ul class="space-y-1 text-gray-700 dark:text-gray-300">
          <!-- Fixed equipment -->
          <li
            v-for="item in fixedEquipment"
            :key="`fixed-${item.id}`"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-heroicons-check"
              class="w-4 h-4 text-green-500"
            />
            <span>{{ getItemDisplayName(item) }}</span>
            <span
              v-if="item.quantity > 1"
              class="text-gray-500"
            >(×{{ item.quantity }})</span>
          </li>
          <!-- Chosen equipment -->
          <template
            v-for="[group] in equipmentByChoiceGroup"
            :key="`choice-${group}`"
          >
            <li
              v-if="getSelectedEquipmentItem(group)"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-heroicons-check"
                class="w-4 h-4 text-green-500"
              />
              <span>{{ getItemDisplayName(getSelectedEquipmentItem(group)!) }}</span>
              <span
                v-if="getSelectedEquipmentItem(group)!.quantity > 1"
                class="text-gray-500"
              >(×{{ getSelectedEquipmentItem(group)!.quantity }})</span>
            </li>
          </template>
        </ul>
      </div>

      <!-- Spells (for casters) -->
      <div
        v-if="isCaster && selectedSpellsForDisplay.length > 0"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Spells
          </h3>
          <UButton
            data-test="edit-spells"
            variant="ghost"
            size="sm"
            icon="i-heroicons-pencil"
            @click="editStep('spells')"
          />
        </div>
        <ul class="space-y-1 text-gray-700 dark:text-gray-300">
          <li
            v-for="spell in selectedSpellsForDisplay"
            :key="spell.id"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="w-4 h-4 text-purple-500"
            />
            <span>{{ spell.name }}</span>
            <UBadge
              size="xs"
              color="neutral"
              variant="subtle"
            >
              {{ spell.level === 0 ? 'Cantrip' : `Level ${spell.level}` }}
            </UBadge>
          </li>
        </ul>
      </div>
    </div>

    <!-- Finish Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-test="finish-btn"
        size="lg"
        color="primary"
        :loading="isLoading"
        @click="finishCreation"
      >
        <UIcon
          name="i-heroicons-check-circle"
          class="w-5 h-5 mr-2"
        />
        Finish & View Characters
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

const store = useCharacterBuilderStore()
const {
  name,
  selectedRace,
  selectedClass,
  selectedBackground,
  abilityScores,
  isCaster,
  selectedSpells,
  fixedEquipment,
  equipmentByChoiceGroup,
  equipmentChoices,
  isLoading
} = storeToRefs(store)

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
 * Navigate to edit a specific step
 */
function editStep(step: number) {
  store.goToStep(step)
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
            @click="editStep(1)"
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
            @click="editStep(2)"
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
            @click="editStep(3)"
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
            @click="editStep(4)"
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
            @click="editStep(5)"
          />
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
            @click="editStep(6)"
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
        v-if="isCaster && selectedSpells.length > 0"
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
            @click="editStep(7)"
          />
        </div>
        <ul class="space-y-1 text-gray-700 dark:text-gray-300">
          <li
            v-for="charSpell in selectedSpells"
            :key="charSpell.id"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="w-4 h-4 text-purple-500"
            />
            <span>{{ charSpell.spell?.name }}</span>
            <UBadge
              size="xs"
              color="neutral"
              variant="subtle"
            >
              {{ charSpell.spell?.level === 0 ? 'Cantrip' : `Level ${charSpell.spell?.level}` }}
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

<!-- app/components/character/wizard/StepEquipment.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useWizardNavigation } from '~/composables/useWizardSteps'

type EntityItemResource = components['schemas']['EntityItemResource']
type PackContentResource = components['schemas']['PackContentResource']

const store = useCharacterWizardStore()
const {
  selections,
  pendingChoices,
  isLoading
} = storeToRefs(store)
const { nextStep } = useWizardNavigation()

// Track which fixed pack contents are expanded (by item.id)
const expandedFixedPacks = ref<Set<number>>(new Set())

// Separate equipment by source
const classFixedEquipment = computed(() =>
  selections.value.class?.equipment?.filter(eq => !eq.is_choice) ?? []
)

const backgroundFixedEquipment = computed(() =>
  selections.value.background?.equipment?.filter(eq => !eq.is_choice) ?? []
)

// Get choice groups by source
const classChoiceGroups = computed(() => {
  const groups = new Map()
  for (const item of selections.value.class?.equipment ?? []) {
    if (item.is_choice && item.choice_group) {
      const existing = groups.get(item.choice_group) ?? []
      groups.set(item.choice_group, [...existing, item])
    }
  }
  return groups
})

const backgroundChoiceGroups = computed(() => {
  const groups = new Map()
  for (const item of selections.value.background?.equipment ?? []) {
    if (item.is_choice && item.choice_group) {
      const existing = groups.get(item.choice_group) ?? []
      groups.set(item.choice_group, [...existing, item])
    }
  }
  return groups
})

/**
 * Handle equipment choice selection
 * Clear any previous item selections for this group when option changes
 */
function handleChoiceSelect(choiceGroup: string, id: number) {
  // Clear item selections when changing options
  clearEquipmentItemSelections(choiceGroup)
  store.setEquipmentChoice(choiceGroup, id)
}

/**
 * Handle item selection within a compound choice
 */
function handleItemSelect(choiceGroup: string, choiceOption: number, choiceItemIndex: number, itemId: number) {
  setEquipmentItemSelection(choiceGroup, choiceOption, choiceItemIndex, itemId)
}

/**
 * Clear all equipment item selections for a choice group
 */
function clearEquipmentItemSelections(choiceGroup: string) {
  const keysToDelete: string[] = []
  for (const key of pendingChoices.value.equipmentItems.keys()) {
    if (key.startsWith(`${choiceGroup}:`)) {
      keysToDelete.push(key)
    }
  }
  for (const key of keysToDelete) {
    pendingChoices.value.equipmentItems.delete(key)
  }
}

/**
 * Set equipment item selection
 */
function setEquipmentItemSelection(choiceGroup: string, choiceOption: number, choiceItemIndex: number, itemId: number) {
  const key = `${choiceGroup}:${choiceOption}:${choiceItemIndex}`
  pendingChoices.value.equipmentItems = new Map(
    pendingChoices.value.equipmentItems.set(key, itemId)
  )
}

/**
 * Build itemSelections map for a specific choice group
 * Extracts selections from the full map and formats for EquipmentChoiceGroup
 */
function buildItemSelectionsMap(choiceGroup: string): Map<string, number> {
  const map = new Map<string, number>()
  for (const [key, value] of pendingChoices.value.equipmentItems) {
    if (key.startsWith(`${choiceGroup}:`)) {
      // Extract "choiceOption:index" from "choiceGroup:choiceOption:index"
      const parts = key.split(':')
      const shortKey = `${parts[1]}:${parts[2]}`
      map.set(shortKey, value)
    }
  }
  return map
}

/**
 * Format choice group name for display
 * Converts "choice_1" to "Equipment Choice 1"
 */
function formatGroupName(group: string): string {
  // Extract number from "choice_1", "choice_2", etc.
  const match = group.match(/choice[_-]?(\d+)/i)
  if (match) {
    return `Equipment Choice ${match[1]}`
  }
  return group
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Get display name for equipment item
 * Uses item name if available, otherwise falls back to description
 */
function getItemDisplayName(item: { item?: { name?: string } | null, description?: string | null }): string {
  if (item.item?.name) {
    return item.item.name
  }
  if (item.description) {
    return item.description
  }
  return 'Unknown item'
}

/**
 * Check if all equipment choices are made
 */
const allEquipmentChoicesMade = computed(() => {
  // Check class choice groups
  for (const [group] of classChoiceGroups.value) {
    if (!pendingChoices.value.equipment.has(group)) {
      return false
    }
  }
  // Check background choice groups
  for (const [group] of backgroundChoiceGroups.value) {
    if (!pendingChoices.value.equipment.has(group)) {
      return false
    }
  }
  return true
})

/**
 * Continue to next step
 */
async function handleContinue() {
  // TODO: Save equipment choices to backend when API is ready
  nextStep()
}

/**
 * Check if a fixed equipment item has pack contents
 * Checks both direct item contents and choice_items path (for single-item fixed equipment)
 */
function hasPackContents(item: EntityItemResource): boolean {
  // Check direct item contents first
  if (item.item?.contents && item.item.contents.length > 0) {
    return true
  }
  // Check choice_items - if there's exactly one fixed item, check its contents
  const firstChoiceItem = item.choice_items?.[0]
  if (item.choice_items?.length === 1 && firstChoiceItem?.item?.contents) {
    return firstChoiceItem.item.contents.length > 0
  }
  return false
}

/**
 * Get pack contents for an item
 * For choice_items structure, contents are in choice_items[0].item.contents
 */
function getPackContents(item: EntityItemResource): PackContentResource[] {
  // Check direct item contents first
  if (item.item?.contents && item.item.contents.length > 0) {
    return item.item.contents
  }
  // Check choice_items path
  const firstChoiceItem = item.choice_items?.[0]
  if (firstChoiceItem?.item?.contents) {
    return firstChoiceItem.item.contents
  }
  return []
}

/**
 * Toggle fixed pack contents visibility
 */
function toggleFixedPackContents(itemId: number) {
  if (expandedFixedPacks.value.has(itemId)) {
    expandedFixedPacks.value.delete(itemId)
  } else {
    expandedFixedPacks.value.add(itemId)
  }
}

/**
 * Check if fixed pack contents are expanded
 */
function isFixedPackExpanded(itemId: number): boolean {
  return expandedFixedPacks.value.has(itemId)
}

/**
 * Format pack content item display with quantity
 * Handles string quantities from API, with NaN fallback to 1
 */
function formatPackContentItem(content: PackContentResource): string {
  const parsed = Number.parseInt(content.quantity, 10)
  const quantity = Number.isNaN(parsed) ? 1 : parsed
  // item is typed as { [key: string]: unknown } from OpenAPI, cast to access name
  const name = (content.item as { name?: string } | null)?.name ?? 'Unknown'
  if (quantity > 1) {
    return `${quantity} ${name}`
  }
  return name
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Choose Your Starting Equipment
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Select your starting gear from your class and background
      </p>
    </div>

    <!-- Class Equipment -->
    <div
      v-if="selections.class"
      class="space-y-4"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        From Your Class ({{ selections.class.name }})
      </h3>

      <!-- Fixed Items -->
      <div
        v-if="classFixedEquipment.length > 0"
        class="space-y-2"
      >
        <div
          v-for="item in classFixedEquipment"
          :key="item.id"
        >
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-green-500 flex-shrink-0"
            />
            <span>{{ getItemDisplayName(item) }}</span>
            <span
              v-if="item.quantity > 1"
              class="text-gray-500"
            >(×{{ item.quantity }})</span>

            <!-- Pack contents toggle for fixed items -->
            <button
              v-if="hasPackContents(item)"
              :data-test="`fixed-pack-contents-toggle-${item.id}`"
              type="button"
              :aria-expanded="isFixedPackExpanded(item.id)"
              :aria-label="`${isFixedPackExpanded(item.id) ? 'Hide' : 'Show'} contents of ${getItemDisplayName(item)}`"
              class="ml-auto flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded transition-colors"
              @click="toggleFixedPackContents(item.id)"
            >
              <UIcon
                :name="isFixedPackExpanded(item.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
              <span>{{ isFixedPackExpanded(item.id) ? 'Hide' : 'Show' }} contents</span>
            </button>
          </div>

          <!-- Pack contents list (when expanded) -->
          <div
            v-if="hasPackContents(item) && isFixedPackExpanded(item.id)"
            :data-test="`fixed-pack-contents-list-${item.id}`"
            class="ml-7 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Pack Contents
            </p>
            <ul class="space-y-1">
              <li
                v-for="(content, idx) in getPackContents(item)"
                :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-4 h-4 text-gray-400 flex-shrink-0"
                />
                <span>{{ formatPackContentItem(content) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Choice Groups -->
      <CharacterBuilderEquipmentChoiceGroup
        v-for="[group, items] in classChoiceGroups"
        :key="group"
        :group-name="formatGroupName(group)"
        :items="items"
        :selected-id="pendingChoices.equipment.get(group) ?? null"
        :item-selections="buildItemSelectionsMap(group)"
        @select="(id) => handleChoiceSelect(group, id)"
        @item-select="(opt, idx, itemId) => handleItemSelect(group, opt, idx, itemId)"
      />
    </div>

    <!-- Background Equipment -->
    <div
      v-if="selections.background"
      class="space-y-4"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        From Your Background ({{ selections.background.name }})
      </h3>

      <!-- Fixed Items -->
      <div
        v-if="backgroundFixedEquipment.length > 0"
        class="space-y-2"
      >
        <div
          v-for="item in backgroundFixedEquipment"
          :key="item.id"
        >
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-green-500 flex-shrink-0"
            />
            <span>{{ getItemDisplayName(item) }}</span>
            <span
              v-if="item.quantity > 1"
              class="text-gray-500"
            >(×{{ item.quantity }})</span>

            <!-- Pack contents toggle for fixed items -->
            <button
              v-if="hasPackContents(item)"
              :data-test="`fixed-pack-contents-toggle-${item.id}`"
              type="button"
              :aria-expanded="isFixedPackExpanded(item.id)"
              :aria-label="`${isFixedPackExpanded(item.id) ? 'Hide' : 'Show'} contents of ${getItemDisplayName(item)}`"
              class="ml-auto flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded transition-colors"
              @click="toggleFixedPackContents(item.id)"
            >
              <UIcon
                :name="isFixedPackExpanded(item.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
              <span>{{ isFixedPackExpanded(item.id) ? 'Hide' : 'Show' }} contents</span>
            </button>
          </div>

          <!-- Pack contents list (when expanded) -->
          <div
            v-if="hasPackContents(item) && isFixedPackExpanded(item.id)"
            :data-test="`fixed-pack-contents-list-${item.id}`"
            class="ml-7 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Pack Contents
            </p>
            <ul class="space-y-1">
              <li
                v-for="(content, idx) in getPackContents(item)"
                :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-4 h-4 text-gray-400 flex-shrink-0"
                />
                <span>{{ formatPackContentItem(content) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Choice Groups -->
      <CharacterBuilderEquipmentChoiceGroup
        v-for="[group, items] in backgroundChoiceGroups"
        :key="group"
        :group-name="formatGroupName(group)"
        :items="items"
        :selected-id="pendingChoices.equipment.get(group) ?? null"
        :item-selections="buildItemSelectionsMap(group)"
        @select="(id) => handleChoiceSelect(group, id)"
        @item-select="(opt, idx, itemId) => handleItemSelect(group, opt, idx, itemId)"
      />
    </div>

    <!-- Continue Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-test="continue-btn"
        size="lg"
        :disabled="!allEquipmentChoicesMade || isLoading"
        :loading="isLoading"
        @click="handleContinue"
      >
        Continue with Equipment
      </UButton>
    </div>
  </div>
</template>

<!-- app/components/character/wizard/StepEquipment.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { components } from '~/types/api/generated'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'

type EntityItemResource = components['schemas']['EntityItemResource']
type PackContentResource = components['schemas']['PackContentResource']
type PendingChoice = components['schemas']['PendingChoiceResource']

interface EquipmentOption {
  option: string
  label: string
  items: Array<{ id: number, name: string, quantity: number }>
}

const store = useCharacterWizardStore()
const { selections } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// Use unified choices composable
const {
  choicesByType,
  pending,
  error: _choicesError,
  fetchChoices,
  resolveChoice
} = useUnifiedChoices(computed(() => store.characterId))

// Track which fixed pack contents are expanded (by item.id)
const expandedFixedPacks = ref<Set<number>>(new Set())

// Track local selections (choiceId → selected option letter)
const localSelections = ref<Map<string, string>>(new Map())

// Track item selections for compound choices (choiceId:itemKey → itemId)
const itemSelections = ref<Map<string, number>>(new Map())

// Fetch equipment choices on mount
onMounted(async () => {
  if (store.characterId) {
    await fetchChoices('equipment')
  }
})

// Separate equipment by source
const classFixedEquipment = computed(() =>
  selections.value.class?.equipment?.filter(eq => !eq.is_choice) ?? []
)

const backgroundFixedEquipment = computed(() =>
  selections.value.background?.equipment?.filter(eq => !eq.is_choice) ?? []
)

// Get equipment choices by source
const classEquipmentChoices = computed(() =>
  (choicesByType.value.equipment || []).filter(c => c.source === 'class')
)

const backgroundEquipmentChoices = computed(() =>
  (choicesByType.value.equipment || []).filter(c => c.source === 'background')
)

/**
 * Get typed options for an equipment choice
 */
function getEquipmentOptions(choice: PendingChoice): EquipmentOption[] {
  return (choice.options as EquipmentOption[] | null) ?? []
}

/**
 * Handle equipment choice selection
 */
function handleChoiceSelect(choiceId: string, optionLetter: string) {
  localSelections.value.set(choiceId, optionLetter)
  // Clear any item selections for this choice when changing options
  clearItemSelectionsForChoice(choiceId)
}

/**
 * Clear item selections for a specific choice
 */
function clearItemSelectionsForChoice(choiceId: string) {
  const keysToDelete: string[] = []
  for (const key of itemSelections.value.keys()) {
    if (key.startsWith(`${choiceId}:`)) {
      keysToDelete.push(key)
    }
  }
  for (const key of keysToDelete) {
    itemSelections.value.delete(key)
  }
}

/**
 * Get display name for equipment item
 * Uses custom_name if set, otherwise item name, then description
 */
function getItemDisplayName(item: { custom_name?: string | null, item?: { name?: string } | null, description?: string | null }): string {
  if (item.custom_name) {
    return item.custom_name
  }
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
  const equipmentChoices = choicesByType.value.equipment || []
  return equipmentChoices.every((choice) => {
    // Check if there's a local selection
    return localSelections.value.has(choice.id) || choice.remaining === 0
  })
})

/**
 * Continue to next step - resolve all choices
 */
async function handleContinue() {
  try {
    // Resolve each equipment choice
    for (const [choiceId, optionLetter] of localSelections.value) {
      // Build item_selections if any exist for this choice
      const itemSelectionsForChoice: Record<string, number> = {}
      for (const [key, itemId] of itemSelections.value) {
        if (key.startsWith(`${choiceId}:`)) {
          const itemKey = key.substring(choiceId.length + 1) // Remove "choiceId:" prefix
          itemSelectionsForChoice[itemKey] = itemId
        }
      }

      const payload: Record<string, unknown> = {
        selected: [optionLetter]
      }

      if (Object.keys(itemSelectionsForChoice).length > 0) {
        payload.item_selections = itemSelectionsForChoice
      }

      await resolveChoice(choiceId, payload)
    }

    nextStep()
  } catch (e) {
    console.error('Failed to save equipment choices:', e)
  }
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
      <div
        v-for="choice in classEquipmentChoices"
        :key="choice.id"
        class="space-y-2"
      >
        <h4 class="font-medium text-gray-700 dark:text-gray-300">
          {{ choice.source_name }} Equipment Choice
        </h4>

        <div class="space-y-2">
          <button
            v-for="option in getEquipmentOptions(choice)"
            :key="option.option"
            :data-test="`option-${option.option}`"
            type="button"
            class="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
            :class="[
              localSelections.get(choice.id) === option.option
                ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            ]"
            @click="handleChoiceSelect(choice.id, option.option)"
          >
            <!-- Radio indicator -->
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              :class="[
                localSelections.get(choice.id) === option.option
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-400'
              ]"
            >
              <div
                v-if="localSelections.get(choice.id) === option.option"
                class="w-2 h-2 rounded-full bg-white"
              />
            </div>

            <!-- Option label and items -->
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ option.label }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span
                  v-for="(item, idx) in option.items"
                  :key="item.id"
                >
                  {{ item.name }}
                  <span v-if="item.quantity > 1">(×{{ item.quantity }})</span>
                  <span v-if="idx < option.items.length - 1">, </span>
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
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
      <div
        v-for="choice in backgroundEquipmentChoices"
        :key="choice.id"
        class="space-y-2"
      >
        <h4 class="font-medium text-gray-700 dark:text-gray-300">
          {{ choice.source_name }} Equipment Choice
        </h4>

        <div class="space-y-2">
          <button
            v-for="option in getEquipmentOptions(choice)"
            :key="option.option"
            :data-test="`option-${option.option}`"
            type="button"
            class="w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3"
            :class="[
              localSelections.get(choice.id) === option.option
                ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            ]"
            @click="handleChoiceSelect(choice.id, option.option)"
          >
            <!-- Radio indicator -->
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              :class="[
                localSelections.get(choice.id) === option.option
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-400'
              ]"
            >
              <div
                v-if="localSelections.get(choice.id) === option.option"
                class="w-2 h-2 rounded-full bg-white"
              />
            </div>

            <!-- Option label and items -->
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ option.label }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span
                  v-for="(item, idx) in option.items"
                  :key="item.id"
                >
                  {{ item.name }}
                  <span v-if="item.quantity > 1">(×{{ item.quantity }})</span>
                  <span v-if="idx < option.items.length - 1">, </span>
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-test="continue-btn"
        size="lg"
        :disabled="!allEquipmentChoicesMade || pending"
        :loading="pending"
        @click="handleContinue"
      >
        Continue with Equipment
      </UButton>
    </div>
  </div>
</template>

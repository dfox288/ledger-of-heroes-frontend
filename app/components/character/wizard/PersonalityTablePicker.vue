<script setup lang="ts">
import type { components } from '~/types/api/generated'

type EntityDataTableResource = components['schemas']['EntityDataTableResource']
type EntityDataTableEntryResource = components['schemas']['EntityDataTableEntryResource']

interface Props {
  table: EntityDataTableResource
  maxSelections: number
}

const props = defineProps<Props>()

const modelValue = defineModel<string[]>({ default: () => [] })

/**
 * Check if an entry is currently selected
 */
function isSelected(entry: EntityDataTableEntryResource): boolean {
  return entry.result_text ? modelValue.value.includes(entry.result_text) : false
}

/**
 * Check if an entry should be disabled (max reached and not selected)
 * In single-select mode (maxSelections=1), items are never disabled - clicking replaces
 */
function isDisabled(entry: EntityDataTableEntryResource): boolean {
  if (props.maxSelections === 1) return false // Single-select allows replacement
  if (isSelected(entry)) return false
  return modelValue.value.length >= props.maxSelections
}

/**
 * Handle clicking on an entry option
 */
function handleSelect(entry: EntityDataTableEntryResource) {
  if (!entry.result_text) return
  if (isDisabled(entry)) return

  const text = entry.result_text

  if (isSelected(entry)) {
    // Deselect
    modelValue.value = modelValue.value.filter(v => v !== text)
  } else if (props.maxSelections === 1) {
    // Single select mode - always replace
    modelValue.value = [text]
  } else if (modelValue.value.length < props.maxSelections) {
    // Multi select mode - add
    modelValue.value = [...modelValue.value, text]
  }
}

/**
 * Roll random selections based on dice type
 */
function handleRoll() {
  const entries = props.table.entries || []
  if (entries.length === 0) return

  const results: string[] = []
  const usedIndices = new Set<number>()

  for (let i = 0; i < props.maxSelections; i++) {
    let attempts = 0
    let index: number

    // Find a unique index (avoid duplicates)
    do {
      index = Math.floor(Math.random() * entries.length)
      attempts++
    } while (usedIndices.has(index) && attempts < 100)

    usedIndices.add(index)
    const entry = entries[index]
    if (entry?.result_text) {
      results.push(entry.result_text)
    }
  }

  modelValue.value = results
}

/**
 * Format roll number display (e.g., "1" or "1-2" for ranges)
 */
function formatRoll(entry: EntityDataTableEntryResource): string {
  if (entry.roll_min === entry.roll_max) {
    return String(entry.roll_min)
  }
  return `${entry.roll_min}-${entry.roll_max}`
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h4 class="font-semibold text-gray-900 dark:text-white">
            {{ table.table_name }}
          </h4>
          <UBadge
            v-if="table.dice_type"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ table.dice_type }}
          </UBadge>
          <span class="text-sm text-gray-500">
            {{ modelValue.length }} of {{ maxSelections }}
          </span>
        </div>
        <UButton
          data-testid="roll-button"
          variant="ghost"
          color="primary"
          size="sm"
          icon="i-heroicons-cube"
          @click="handleRoll"
        >
          Roll
        </UButton>
      </div>
    </template>

    <div class="space-y-2">
      <div
        v-for="entry in table.entries"
        :key="entry.id"
        data-testid="entry-option"
        class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors"
        :class="[
          isSelected(entry)
            ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent',
          isDisabled(entry) ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        @click="!isDisabled(entry) && handleSelect(entry)"
      >
        <!-- Selection indicator -->
        <div class="flex-shrink-0 mt-0.5">
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            :class="[
              isSelected(entry)
                ? 'border-primary-500 bg-primary-500'
                : 'border-gray-300 dark:border-gray-600'
            ]"
          >
            <UIcon
              v-if="isSelected(entry)"
              name="i-heroicons-check"
              class="w-3 h-3 text-white"
            />
          </div>
        </div>

        <!-- Roll number -->
        <span class="flex-shrink-0 w-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ formatRoll(entry) }}.
        </span>

        <!-- Entry text -->
        <span class="text-sm text-gray-700 dark:text-gray-300">
          {{ entry.result_text }}
        </span>
      </div>
    </div>
  </UCard>
</template>

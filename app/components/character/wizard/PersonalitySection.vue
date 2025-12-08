<script setup lang="ts">
import type { components } from '~/types/api/generated'

type EntityDataTableResource = components['schemas']['EntityDataTableResource']

export interface PersonalitySelections {
  traits: string[]
  ideal: string | null
  bond: string | null
  flaw: string | null
}

interface Props {
  dataTables: EntityDataTableResource[]
  backgroundName: string
}

const props = defineProps<Props>()

const selections = defineModel<PersonalitySelections>('selections', {
  default: () => ({
    traits: [],
    ideal: null,
    bond: null,
    flaw: null
  })
})

// Personality table names we care about (in display order)
const PERSONALITY_TABLE_NAMES = ['Personality Trait', 'Ideal', 'Bond', 'Flaw']

/**
 * Filter and sort to only personality-related tables
 */
const personalityTables = computed(() => {
  return props.dataTables
    .filter(table => PERSONALITY_TABLE_NAMES.includes(table.table_name))
    .sort((a, b) => {
      const aIndex = PERSONALITY_TABLE_NAMES.indexOf(a.table_name)
      const bIndex = PERSONALITY_TABLE_NAMES.indexOf(b.table_name)
      return aIndex - bIndex
    })
})

/**
 * Check if we have any personality tables to show
 */
const hasPersonalityTables = computed(() => personalityTables.value.length > 0)

/**
 * Get max selections for a table type
 */
function getMaxSelections(tableName: string): number {
  return tableName === 'Personality Trait' ? 2 : 1
}

/**
 * Get selection key for v-model binding
 */
function getSelectionKey(tableName: string): keyof PersonalitySelections {
  const map: Record<string, keyof PersonalitySelections> = {
    'Personality Trait': 'traits',
    'Ideal': 'ideal',
    'Bond': 'bond',
    'Flaw': 'flaw'
  }
  return map[tableName] || 'traits'
}

/**
 * Get current selections for a table as string array (for v-model)
 */
function getSelectionsArray(tableName: string): string[] {
  const key = getSelectionKey(tableName)
  const value = selections.value[key]
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

/**
 * Update selections from child component
 */
function updateSelections(tableName: string, newValue: string[]) {
  const key = getSelectionKey(tableName)
  if (key === 'traits') {
    selections.value = { ...selections.value, traits: newValue }
  } else {
    selections.value = { ...selections.value, [key]: newValue[0] || null }
  }
}

/**
 * Roll all tables at once
 */
function rollAll() {
  const newSelections: PersonalitySelections = {
    traits: [],
    ideal: null,
    bond: null,
    flaw: null
  }

  for (const table of personalityTables.value) {
    const entries = table.entries || []
    if (entries.length === 0) continue

    const key = getSelectionKey(table.table_name)
    const maxSelections = getMaxSelections(table.table_name)

    if (key === 'traits') {
      // Roll 2 unique traits
      const usedIndices = new Set<number>()
      const traits: string[] = []
      for (let i = 0; i < maxSelections && i < entries.length; i++) {
        let index: number
        let attempts = 0
        do {
          index = Math.floor(Math.random() * entries.length)
          attempts++
        } while (usedIndices.has(index) && attempts < 100)
        usedIndices.add(index)
        const entry = entries[index]
        if (entry?.result_text) {
          traits.push(entry.result_text)
        }
      }
      newSelections.traits = traits
    } else {
      // Roll 1 for ideal/bond/flaw
      const index = Math.floor(Math.random() * entries.length)
      newSelections[key] = entries[index]?.result_text || null
    }
  }

  selections.value = newSelections
}

/**
 * Clear all selections
 */
function clearAll() {
  selections.value = {
    traits: [],
    ideal: null,
    bond: null,
    flaw: null
  }
}
</script>

<template>
  <div
    v-if="hasPersonalityTables"
    class="space-y-4"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Personality
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Optional characteristics from {{ backgroundName }}
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          data-testid="roll-all-button"
          variant="soft"
          color="primary"
          size="sm"
          icon="i-heroicons-cube"
          @click="rollAll"
        >
          Roll All
        </UButton>
        <UButton
          data-testid="clear-all-button"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-heroicons-x-mark"
          @click="clearAll"
        >
          Clear
        </UButton>
      </div>
    </div>

    <!-- Personality Tables Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CharacterWizardPersonalityTablePicker
        v-for="table in personalityTables"
        :key="table.id"
        :table="table"
        :max-selections="getMaxSelections(table.table_name)"
        :model-value="getSelectionsArray(table.table_name)"
        @update:model-value="updateSelections(table.table_name, $event)"
      />
    </div>
  </div>
</template>

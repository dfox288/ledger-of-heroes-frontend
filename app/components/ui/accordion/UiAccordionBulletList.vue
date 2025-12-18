<script setup lang="ts">
import type { components } from '~/types/api/generated'
import type { EntityChoice } from '~/types'

// Use API ProficiencyResource type - has id: number and proficiency_name: string | null
type ProficiencyResource = components['schemas']['ProficiencyResource']

interface Props {
  items: ProficiencyResource[]
  choices?: EntityChoice[]
}

const props = withDefaults(defineProps<Props>(), {
  choices: () => []
})

/**
 * Get display name for a proficiency item
 * Tries multiple fallback strategies to handle various nested structures
 */
function getDisplayName(item: ProficiencyResource): string {
  // Prefer proficiency_name if available
  if (item.proficiency_name) return item.proficiency_name

  // Fallback to nested detail structures
  if (item.proficiency_type_detail?.name) return item.proficiency_type_detail.name
  if (item.skill?.name) return item.skill.name
  if (item.item?.name) return item.item.name
  if (item.ability_score?.name) return item.ability_score?.name

  // Last resort fallback
  return 'Unknown'
}

/**
 * Format proficiency type for display
 * Converts snake_case to Title Case
 */
function formatProficiencyType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Define type order for consistent display
const TYPE_ORDER = ['armor', 'weapon', 'tool', 'saving_throw', 'skill']

// Group all proficiencies by type (all are now "regular" - choices come separately)
const proficienciesByType = computed(() => {
  const typeMap = new Map<string, ProficiencyResource[]>()

  // Group by type
  for (const item of props.items) {
    const type = item.proficiency_type

    if (!typeMap.has(type)) {
      typeMap.set(type, [])
    }
    typeMap.get(type)!.push(item)
  }

  // Convert to sorted array
  const result = Array.from(typeMap.entries())
    .map(([type, items]) => ({
      type,
      typeName: formatProficiencyType(type),
      items
    }))

  // Sort by defined order, then alphabetically
  return result.sort((a, b) => {
    const aIndex = TYPE_ORDER.indexOf(a.type)
    const bIndex = TYPE_ORDER.indexOf(b.type)

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    return a.type.localeCompare(b.type)
  })
})

// Filter choices to only show proficiency choices
const proficiencyChoices = computed(() =>
  props.choices.filter(c => c.choice_type === 'proficiency')
)

// Helper to generate choice description from EntityChoice
const getChoiceDescription = (choice: EntityChoice): string => {
  const profType = choice.proficiency_type
    ? formatProficiencyType(choice.proficiency_type)
    : 'proficiency'

  if (choice.quantity > 1) {
    return `Choose ${choice.quantity} ${profType}${choice.quantity > 1 ? 's' : ''}`
  }
  return `Choose 1 ${profType}`
}
</script>

<template>
  <div
    v-if="items.length === 0 && proficiencyChoices.length === 0"
    class="p-4 text-center text-gray-500 dark:text-gray-400"
  >
    No proficiencies
  </div>
  <div
    v-else
    class="p-4 space-y-4"
  >
    <!-- Group by proficiency type -->
    <div
      v-for="typeGroup in proficienciesByType"
      :key="typeGroup.type"
      class="space-y-2"
    >
      <!-- Type headline -->
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        {{ typeGroup.typeName }}
      </h4>

      <!-- Proficiencies within this type -->
      <div class="space-y-1">
        <div
          v-for="item in typeGroup.items"
          :key="item.id"
          class="text-gray-700 dark:text-gray-300"
        >
          • {{ getDisplayName(item) }}
        </div>
      </div>
    </div>

    <!-- Proficiency choices (from EntityChoice array) -->
    <div
      v-if="proficiencyChoices.length > 0"
      class="space-y-2"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Choices
      </h4>
      <div
        v-for="choice in proficiencyChoices"
        :key="`choice-${choice.id}`"
        class="p-2 rounded bg-info-50 dark:bg-info-900/20 border border-dashed border-info-300 dark:border-info-700"
      >
        <div class="text-sm text-info-700 dark:text-info-300">
          {{ getChoiceDescription(choice) }}
        </div>
        <div
          v-if="choice.description"
          class="text-xs text-gray-600 dark:text-gray-400 mt-1"
        >
          {{ choice.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { components } from '~/types/api/generated'

// Use API ProficiencyResource type - has id: number and proficiency_name: string | null
type ProficiencyResource = components['schemas']['ProficiencyResource']

interface Props {
  items: ProficiencyResource[]
}

const props = defineProps<Props>()

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

// Group all proficiencies by type, then by regular/choice within each type
const proficienciesByType = computed(() => {
  const typeMap = new Map<string, { regular: ProficiencyResource[], choiceGroups: Map<string, ProficiencyResource[]> }>()

  // Group by type first
  for (const item of props.items) {
    const type = item.proficiency_type

    if (!typeMap.has(type)) {
      typeMap.set(type, { regular: [], choiceGroups: new Map() })
    }

    const typeGroup = typeMap.get(type)!

    if (!item.choice_group) {
      // Regular proficiency
      typeGroup.regular.push(item)
    }
    else {
      // Choice-based proficiency
      if (!typeGroup.choiceGroups.has(item.choice_group)) {
        typeGroup.choiceGroups.set(item.choice_group, [])
      }
      typeGroup.choiceGroups.get(item.choice_group)!.push(item)
    }
  }

  // Convert to sorted array with formatted choice groups
  const result = Array.from(typeMap.entries())
    .map(([type, { regular, choiceGroups }]) => {
      const formattedChoiceGroups = Array.from(choiceGroups.entries())
        .map(([key, items]) => {
          // Sort items by choice_option if present
          const sortedItems = [...items].sort((a, b) => {
            if (a.choice_option != null && b.choice_option != null) {
              return a.choice_option - b.choice_option
            }
            return 0
          })

          return {
            choiceGroup: key,
            quantity: sortedItems[0]?.quantity || null,
            items: sortedItems,
          }
        })

      return {
        type,
        typeName: formatProficiencyType(type),
        regular,
        choiceGroups: formattedChoiceGroups,
      }
    })

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

// Helper to format choice letters (a, b, c, etc.)
// Use choice_option if present, otherwise fall back to array index
const getChoiceLetter = (item: ProficiencyResource, index: number): string => {
  const optionNum = item.choice_option != null ? item.choice_option - 1 : index
  return String.fromCharCode(97 + optionNum) // 97 is 'a' in ASCII
}

// Helper to generate choice description
const getChoiceDescription = (group: { quantity: number | null, items: ProficiencyResource[] }): string => {
  if (group.quantity && group.quantity > 1) {
    return `Choose ${group.quantity}:`
  }
  return 'Choose one:'
}
</script>

<template>
  <div v-if="items.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
    No proficiencies
  </div>
  <div v-else class="p-4 space-y-4">
    <!-- Group by proficiency type -->
    <div v-for="typeGroup in proficienciesByType" :key="typeGroup.type" class="space-y-2">
      <!-- Type headline -->
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        {{ typeGroup.typeName }}
      </h4>

      <!-- Regular proficiencies within this type -->
      <div v-if="typeGroup.regular.length > 0" class="space-y-1">
        <div
          v-for="item in typeGroup.regular"
          :key="item.id"
          class="text-gray-700 dark:text-gray-300"
        >
          • {{ getDisplayName(item) }}
        </div>
      </div>

      <!-- Choice-based proficiencies within this type -->
      <div v-for="(group, groupIndex) in typeGroup.choiceGroups" :key="groupIndex" class="space-y-1">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {{ getChoiceDescription(group) }}
        </div>
        <div
          v-for="(item, itemIndex) in group.items"
          :key="item.id"
          class="text-gray-700 dark:text-gray-300 ml-2"
        >
          ({{ getChoiceLetter(item, itemIndex) }}) {{ getDisplayName(item) }}
        </div>
      </div>
    </div>
  </div>
</template>

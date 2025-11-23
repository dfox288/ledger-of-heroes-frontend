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

// Separate proficiencies into regular and choice-based
const regularProficiencies = computed(() => {
  return props.items.filter(item => !item.choice_group)
})

// Group proficiencies by choice_group
const proficiencyGroups = computed(() => {
  const groups = new Map<string, ProficiencyResource[]>()

  for (const item of props.items) {
    if (!item.choice_group) continue // Skip regular proficiencies

    if (!groups.has(item.choice_group)) {
      groups.set(item.choice_group, [])
    }
    groups.get(item.choice_group)!.push(item)
  }

  return Array.from(groups.entries())
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
        // Get quantity from first item (only first one should have it)
        quantity: sortedItems[0]?.quantity || null,
        items: sortedItems,
      }
    })
    .filter(group => group.items.length > 0)
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
  <div v-else class="p-4 space-y-3">
    <!-- Regular proficiencies (no choice) -->
    <div v-if="regularProficiencies.length > 0" class="space-y-1">
      <div
        v-for="item in regularProficiencies"
        :key="item.id"
        class="text-gray-700 dark:text-gray-300"
      >
        • {{ getDisplayName(item) }}
      </div>
    </div>

    <!-- Choice-based proficiencies -->
    <div v-for="(group, groupIndex) in proficiencyGroups" :key="groupIndex" class="space-y-1">
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
</template>

<script setup lang="ts">
import type { components } from '~/types/api/generated'

type Equipment = components['schemas']['EntityItemResource']

interface Props {
  equipment: Equipment[]
  type?: 'class' | 'background'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'class',
})

// Helper to check if an equipment entry is hit points
const isHitPoints = (item: Equipment): boolean => {
  return item.description?.toLowerCase().includes('hit points') ?? false
}

// Helper to check if an equipment entry is proficiencies
const isProficiencies = (item: Equipment): boolean => {
  const desc = item.description?.toLowerCase() ?? ''
  return desc.includes('armor:') || desc.includes('weapons:') || desc.includes('tools:') || desc.includes('skills:')
}

// Separate equipment into sections
const hitPointsItem = computed(() => {
  if (props.type !== 'class') return null
  return props.equipment.find(isHitPoints)
})

const proficienciesItem = computed(() => {
  if (props.type !== 'class') return null
  return props.equipment.find(isProficiencies)
})

const regularEquipment = computed(() => {
  return props.equipment.filter(item =>
    !isHitPoints(item) && !isProficiencies(item)
  )
})

// Group equipment by choice_group (preferred) or choice_description (fallback)
const equipmentGroups = computed(() => {
  const groups = new Map<string | null, Equipment[]>()

  for (const item of regularEquipment.value) {
    // Use choice_group if present, otherwise fall back to choice_description
    const key = item.choice_group || item.choice_description
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  }

  return Array.from(groups.entries())
    .map(([key, items]) => {
      // Sort items by choice_option if present, otherwise maintain insertion order
      const sortedItems = [...items].sort((a, b) => {
        if (a.choice_option != null && b.choice_option != null) {
          return a.choice_option - b.choice_option
        }
        return 0
      })

      return {
        // Use choice_description from first item for the headline (more descriptive than choice_group)
        choiceDescription: sortedItems[0]?.choice_description || key,
        items: sortedItems,
      }
    })
    .filter(group => group.items.length > 0)
})

// Helper to get item display text
const getItemDisplay = (item: Equipment): string => {
  // If there's a linked item with a name, use it
  if (item.item?.name) {
    return item.quantity > 1 ? `${item.quantity} ${item.item.name}` : item.item.name
  }

  // Otherwise use description
  if (item.description) {
    return item.quantity > 1 ? `${item.quantity} ${item.description}` : item.description
  }

  return ''
}

// Helper to format choice letters (a, b, c, etc.)
// Use choice_option if present, otherwise fall back to array index
const getChoiceLetter = (item: Equipment, index: number): string => {
  const optionNum = item.choice_option != null ? item.choice_option - 1 : index
  return String.fromCharCode(97 + optionNum) // 97 is 'a' in ASCII
}

// Helper to get item link URL
const getItemLink = (item: Equipment): string | null => {
  if (item.item_id && item.item?.slug) {
    return `/items/${item.item.slug}`
  }
  return null
}
</script>

<template>
  <div v-if="equipment.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
    No equipment
  </div>
  <div v-else class="p-4 space-y-4">
    <!-- Hit Points Section (Class only) -->
    <div v-if="hitPointsItem" class="space-y-2">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Hit Points
      </h4>
      <div class="text-gray-700 dark:text-gray-300">
        {{ hitPointsItem.description }}
      </div>
    </div>

    <!-- Proficiencies Section (Class only) -->
    <div v-if="proficienciesItem" class="space-y-2">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Proficiencies
      </h4>
      <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {{ proficienciesItem.description }}
      </div>
    </div>

    <!-- Equipment Section -->
    <div v-if="regularEquipment.length > 0" class="space-y-3">
      <div v-for="(group, groupIndex) in equipmentGroups" :key="groupIndex" class="space-y-1">
        <!-- Choice group with letters -->
        <div v-if="group.choiceDescription && group.items.length > 1">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {{ group.choiceDescription }}
          </div>
          <div
            v-for="(item, itemIndex) in group.items"
            :key="item.id"
            class="text-gray-700 dark:text-gray-300 ml-2"
          >
            ({{ getChoiceLetter(item, itemIndex) }})
            <NuxtLink
              v-if="getItemLink(item)"
              :to="getItemLink(item)!"
              class="hover:text-primary-600 dark:hover:text-primary-400 underline decoration-dotted underline-offset-2"
            >
              {{ getItemDisplay(item) }}
            </NuxtLink>
            <span v-else>{{ getItemDisplay(item) }}</span>
          </div>
        </div>

        <!-- Single choice item (no letters needed) -->
        <div v-else-if="group.choiceDescription && group.items.length === 1 && group.items[0]">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {{ group.choiceDescription }}
          </div>
          <div class="text-gray-700 dark:text-gray-300 ml-2">
            <NuxtLink
              v-if="getItemLink(group.items[0])"
              :to="getItemLink(group.items[0])!"
              class="hover:text-primary-600 dark:hover:text-primary-400 underline decoration-dotted underline-offset-2"
            >
              {{ getItemDisplay(group.items[0]) }}
            </NuxtLink>
            <span v-else>{{ getItemDisplay(group.items[0]) }}</span>
          </div>
        </div>

        <!-- Regular equipment (no choice) -->
        <div v-else>
          <div
            v-for="item in group.items"
            :key="item.id"
            class="text-gray-700 dark:text-gray-300"
          >
            <NuxtLink
              v-if="getItemLink(item)"
              :to="getItemLink(item)!"
              class="hover:text-primary-600 dark:hover:text-primary-400 underline decoration-dotted underline-offset-2"
            >
              {{ getItemDisplay(item) }}
            </NuxtLink>
            <span v-else>{{ getItemDisplay(item) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

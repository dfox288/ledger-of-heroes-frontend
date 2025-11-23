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

// Group equipment by choice_description
const equipmentGroups = computed(() => {
  const groups = new Map<string | null, Equipment[]>()

  for (const item of regularEquipment.value) {
    const key = item.choice_description
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  }

  return Array.from(groups.entries()).map(([key, items]) => ({
    choiceDescription: key,
    items,
  }))
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
const getChoiceLetter = (index: number): string => {
  return String.fromCharCode(97 + index) // 97 is 'a' in ASCII
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
            ({{ getChoiceLetter(itemIndex) }}) {{ getItemDisplay(item) }}
          </div>
        </div>

        <!-- Single choice item (no letters needed) -->
        <div v-else-if="group.choiceDescription && group.items.length === 1">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {{ group.choiceDescription }}
          </div>
          <div class="text-gray-700 dark:text-gray-300 ml-2">
            {{ getItemDisplay(group.items[0]) }}
          </div>
        </div>

        <!-- Regular equipment (no choice) -->
        <div v-else>
          <div
            v-for="item in group.items"
            :key="item.id"
            class="text-gray-700 dark:text-gray-300"
          >
            {{ getItemDisplay(item) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

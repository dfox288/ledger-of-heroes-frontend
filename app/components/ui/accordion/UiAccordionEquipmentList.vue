<script setup lang="ts">
import type { components } from '~/types/api/generated'

type Equipment = components['schemas']['EntityItemResource']

// Equipment choice group structure (from background.equipment_choices)
interface EquipmentChoiceGroup {
  choice_group: string
  quantity: number
  options: unknown[]
}

interface Props {
  equipment: Equipment[]
  equipmentChoices?: EquipmentChoiceGroup[]
  type?: 'class' | 'background'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'class',
  equipmentChoices: () => []
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
  // For backgrounds, show all equipment (no class-specific filtering)
  if (props.type === 'background') {
    return props.equipment
  }

  // For classes, filter out hit points and proficiencies
  return props.equipment.filter(item =>
    !isHitPoints(item) && !isProficiencies(item)
  )
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

  // Fallback: if we have an item_id but no name, show generic text
  if (item.item_id) {
    return item.quantity > 1 ? `${item.quantity} items` : '1 item'
  }

  return ''
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
  <div
    v-if="equipment.length === 0 && equipmentChoices.length === 0"
    class="p-4 text-center text-gray-500 dark:text-gray-400"
  >
    No equipment
  </div>
  <div
    v-else
    class="p-4 space-y-4"
  >
    <!-- Hit Points Section (Class only) -->
    <div
      v-if="hitPointsItem"
      class="space-y-2"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Hit Points
      </h4>
      <div class="text-gray-700 dark:text-gray-300">
        {{ hitPointsItem.description }}
      </div>
    </div>

    <!-- Proficiencies Section (Class only) -->
    <div
      v-if="proficienciesItem"
      class="space-y-2"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Proficiencies
      </h4>
      <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {{ proficienciesItem.description }}
      </div>
    </div>

    <!-- Regular Equipment Section -->
    <div
      v-if="regularEquipment.length > 0"
      class="space-y-1"
    >
      <div
        v-for="item in regularEquipment"
        :key="item.id"
        class="text-gray-700 dark:text-gray-300"
      >
        • <NuxtLink
          v-if="getItemLink(item)"
          :to="getItemLink(item)!"
          class="hover:text-primary-600 dark:hover:text-primary-400 underline decoration-dotted underline-offset-2"
        >
          {{ getItemDisplay(item) }}
        </NuxtLink>
        <span v-else>{{ getItemDisplay(item) }}</span>
      </div>
    </div>

    <!-- Equipment Choices Section -->
    <div
      v-if="equipmentChoices.length > 0"
      class="space-y-2"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        Equipment Choices
      </h4>
      <div
        v-for="(choiceGroup, index) in equipmentChoices"
        :key="index"
        class="p-2 rounded bg-info-50 dark:bg-info-900/20 border border-dashed border-info-300 dark:border-info-700"
      >
        <div class="text-sm text-info-700 dark:text-info-300">
          Choose {{ choiceGroup.quantity }} from {{ choiceGroup.choice_group }}
        </div>
      </div>
    </div>
  </div>
</template>

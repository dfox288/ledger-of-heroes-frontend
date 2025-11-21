<script setup lang="ts">
interface RandomTableEntry {
  id: number
  roll_min: number
  roll_max: number
  result_text: string
  sort_order: number
}

interface RandomTable {
  id: number
  table_name: string
  dice_type: string
  description?: string | null
  entries: RandomTableEntry[]
}

interface Trait {
  id: number
  name: string
  description: string
  level?: number
  category?: string
  feature_name?: string  // For class features
  random_tables?: RandomTable[]
}

interface Props {
  traits: Trait[]
  showLevel?: boolean
  showCategory?: boolean
  borderColor?: string
}

withDefaults(defineProps<Props>(), {
  showLevel: false,
  showCategory: false,
  borderColor: 'primary-500'
})
</script>

<template>
  <div class="p-4 space-y-3">
    <div v-for="trait in traits" :key="trait.id" class="space-y-3">
      <!-- Existing trait display -->
      <div class="border-l-4 pl-4 py-2" :class="`border-${borderColor}`">
        <div class="flex items-center gap-2 mb-1">
          <UBadge v-if="showLevel && trait.level" color="info" variant="soft" size="xs">
            Level {{ trait.level }}
          </UBadge>
          <span class="font-semibold text-gray-900 dark:text-gray-100">
            {{ trait.feature_name || trait.name }}
          </span>
          <UBadge v-if="showCategory && trait.category" color="purple" variant="soft" size="xs">
            {{ trait.category }}
          </UBadge>
        </div>
        <div v-if="trait.description" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {{ trait.description }}
        </div>
      </div>

      <!-- NEW: Random tables display -->
      <UiAccordionRandomTablesList
        v-if="trait.random_tables && trait.random_tables.length > 0"
        :tables="trait.random_tables"
        :borderColor="borderColor"
      />
    </div>
  </div>
</template>

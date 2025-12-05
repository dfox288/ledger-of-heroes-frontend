<script setup lang="ts">
import type { Background } from '~/types'

interface Props {
  background: Background | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Use local ref for v-model binding (matches RaceDetailModal/ClassDetailModal pattern)
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit('close')
  }
})

// Use background stats composable
const backgroundRef = computed(() => props.background)
const {
  skillProficiencies,
  toolProficiencies,
  languages,
  startingGold
} = useBackgroundStats(backgroundRef)

// Get equipment items (excluding gold)
const equipmentItems = computed(() => {
  if (!props.background?.equipment) return []
  return props.background.equipment.filter(eq => eq.item?.name !== 'Gold Piece')
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="background?.name ?? 'Background Details'"
  >
    <template #body>
      <div
        v-if="background"
        class="space-y-6"
      >
        <!-- Feature -->
        <div v-if="background.feature_name">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Feature: {{ background.feature_name }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            {{ background.feature_description }}
          </p>
        </div>

        <!-- Skill Proficiencies -->
        <div v-if="skillProficiencies.length > 0">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Skill Proficiencies
          </h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in skillProficiencies"
              :key="skill"
              color="background"
              variant="subtle"
              size="md"
            >
              {{ skill }}
            </UBadge>
          </div>
        </div>

        <!-- Tool Proficiencies -->
        <div v-if="toolProficiencies.length > 0">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Tool Proficiencies
          </h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="tool in toolProficiencies"
              :key="tool"
              color="background"
              variant="subtle"
              size="md"
            >
              {{ tool }}
            </UBadge>
          </div>
        </div>

        <!-- Languages -->
        <div v-if="languages.length > 0">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Languages
          </h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="lang in languages"
              :key="lang"
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ lang }}
            </UBadge>
          </div>
        </div>

        <!-- Equipment -->
        <div v-if="equipmentItems.length > 0 || startingGold">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            Starting Equipment
          </h3>
          <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li
              v-for="eq in equipmentItems"
              :key="eq.id"
            >
              {{ eq.item?.name }}
              <span v-if="eq.quantity > 1">(×{{ eq.quantity }})</span>
              <span
                v-if="eq.is_choice"
                class="text-background-500"
              >
                [choice]
              </span>
            </li>
            <li v-if="startingGold">
              {{ startingGold }} gp
            </li>
          </ul>
        </div>
      </div>
    </template>
  </UModal>
</template>

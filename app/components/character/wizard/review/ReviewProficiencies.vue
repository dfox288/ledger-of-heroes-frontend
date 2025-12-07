<!-- app/components/character/wizard/review/ReviewProficiencies.vue -->
<script setup lang="ts">
/**
 * Proficiencies card - displays proficiencies grouped by type
 */

import type { CharacterProficiency } from '~/types/character'

const props = defineProps<{
  proficiencies: CharacterProficiency[] | null
}>()

interface ProficiencyGroup {
  type: string
  label: string
  icon: string
  items: string[]
}

// Define display order and labels for proficiency types
const typeConfig: Record<string, { label: string, icon: string }> = {
  armor: { label: 'Armor', icon: 'i-heroicons-shield-check' },
  weapon: { label: 'Weapons', icon: 'i-heroicons-bolt' },
  tool: { label: 'Tools', icon: 'i-heroicons-wrench-screwdriver' },
  skill: { label: 'Skills', icon: 'i-heroicons-academic-cap' },
  other: { label: 'Other', icon: 'i-heroicons-check-circle' }
}

/**
 * Group proficiencies by type for display
 */
const proficiencyGroups = computed<ProficiencyGroup[]>(() => {
  const grouped = new Map<string, Set<string>>()

  const addProficiency = (type: string, name: string) => {
    const existing = grouped.get(type) ?? new Set()
    existing.add(name)
    grouped.set(type, existing)
  }

  if (props.proficiencies) {
    for (const prof of props.proficiencies) {
      if (prof.skill) {
        let name = prof.skill.name
        if (prof.expertise) name += ' (Expertise)'
        addProficiency('skill', name)
      } else if (prof.proficiency_type) {
        const type = prof.proficiency_type.category || 'other'
        addProficiency(type, prof.proficiency_type.name)
      }
    }
  }

  const typeOrder = ['armor', 'weapon', 'tool', 'skill', 'other']
  const result: ProficiencyGroup[] = []

  for (const type of typeOrder) {
    const items = grouped.get(type)
    if (items && items.size > 0) {
      const config = typeConfig[type] || typeConfig.other!
      result.push({
        type,
        label: config.label,
        icon: config.icon,
        items: Array.from(items).sort()
      })
    }
  }

  // Add any remaining types not in typeOrder
  for (const [type, items] of grouped) {
    if (!typeOrder.includes(type) && items.size > 0) {
      result.push({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        icon: 'i-heroicons-check-circle',
        items: Array.from(items).sort()
      })
    }
  }

  return result
})
</script>

<template>
  <UCard :ui="{ body: 'p-4' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-academic-cap"
          class="w-5 h-5 text-primary"
        />
        <span class="font-semibold text-gray-900 dark:text-white">Proficiencies</span>
      </div>
    </template>

    <div
      v-if="proficiencyGroups.length > 0"
      class="space-y-4"
    >
      <div
        v-for="group in proficiencyGroups"
        :key="group.type"
      >
        <div class="flex items-center gap-2 mb-2">
          <UIcon
            :name="group.icon"
            class="w-4 h-4 text-gray-500"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ group.label }}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="item in group.items"
            :key="item"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ item }}
          </UBadge>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      No proficiencies selected yet.
    </div>
  </UCard>
</template>

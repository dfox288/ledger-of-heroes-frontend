<script setup lang="ts">
import type { ClassHitPoints } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type ProficiencyResource = components['schemas']['ProficiencyResource']

interface Props {
  hitPoints: ClassHitPoints | null
  savingThrows: ProficiencyResource[]
  armorProficiencies: ProficiencyResource[]
  weaponProficiencies: ProficiencyResource[]
}

defineProps<Props>()

/**
 * Get display name for proficiency
 */
function getProficiencyName(item: ProficiencyResource): string {
  if (item.proficiency_name) return item.proficiency_name
  if (item.proficiency_type_detail?.name) return item.proficiency_type_detail.name
  if (item.ability_score?.name) return item.ability_score.name
  return 'Unknown'
}

/**
 * Format proficiencies as comma-separated list
 */
function formatProficiencies(items: ProficiencyResource[]): string {
  if (!items.length) return 'None'
  return items.map(getProficiencyName).join(', ')
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Hit Points Card -->
    <UiClassHitPointsCard
      v-if="hitPoints"
      :hit-points="hitPoints"
    />
    <UCard v-else>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-heart"
              class="w-6 h-6 text-error-600 dark:text-error-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Hit Points
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            No hit point data available
          </p>
        </div>
      </div>
    </UCard>

    <!-- Saving Throws Card -->
    <UCard>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-shield-check"
              class="w-6 h-6 text-success-600 dark:text-success-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Saving Throws
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ formatProficiencies(savingThrows) }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Armor Proficiencies Card -->
    <UCard>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-info-100 dark:bg-info-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-shield-exclamation"
              class="w-6 h-6 text-info-600 dark:text-info-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Armor Proficiencies
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ formatProficiencies(armorProficiencies) }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Weapon Proficiencies Card -->
    <UCard>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-bolt"
              class="w-6 h-6 text-warning-600 dark:text-warning-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Weapon Proficiencies
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ formatProficiencies(weaponProficiencies) }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

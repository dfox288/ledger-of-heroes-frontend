<script setup lang="ts">
import type { Spell } from '~/types'
import { getSpellLevelColorDetailed, getSpellSchoolColor } from '~/utils/badgeColors'

interface Props {
  spell: Spell
  imagePath: string | null
}

const props = defineProps<Props>()

/**
 * Format spell level for display
 * Converts level number to ordinal text (0 -> "Cantrip", 1 -> "1st Level", etc.)
 */
const levelText = computed(() => {
  if (props.spell.level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${props.spell.level}${suffix[props.spell.level]} Level`
})

/**
 * Get badge color for spell level using detailed scale
 * Uses granular color mapping per Issue #78 (cantrip=gray, 1-2=green, etc.)
 */
const levelColor = computed(() => getSpellLevelColorDetailed(props.spell.level))

/**
 * Get badge color for spell school
 * Uses centralized utility for consistent colors across app
 */
const schoolColor = computed(() => {
  if (!props.spell.school) return 'info'
  return getSpellSchoolColor(props.spell.school.code)
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Content (2/3 on large screens) -->
    <div class="lg:col-span-2 space-y-4">
      <!-- Badges -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Level Badge -->
        <UBadge
          :color="levelColor"
          variant="subtle"
          size="md"
        >
          {{ levelText }}
        </UBadge>

        <!-- School Badge -->
        <UBadge
          v-if="spell.school"
          :color="schoolColor"
          variant="subtle"
          size="md"
        >
          {{ spell.school.name }}
        </UBadge>

        <!-- Ritual Badge -->
        <UBadge
          v-if="spell.is_ritual"
          color="spell"
          variant="subtle"
          size="md"
        >
          🔮 Ritual
        </UBadge>

        <!-- Concentration Badge -->
        <UBadge
          v-if="spell.needs_concentration"
          color="spell"
          variant="subtle"
          size="md"
        >
          ⭐ Concentration
        </UBadge>
      </div>

      <!-- Spell Name -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
        {{ spell.name }}
      </h1>
    </div>

    <!-- Image (1/3 on large screens) -->
    <div
      v-if="imagePath"
      class="lg:col-span-1"
    >
      <div class="aspect-square rounded-lg overflow-hidden shadow-lg">
        <NuxtImg
          :src="imagePath"
          :alt="spell.name"
          class="w-full h-full object-cover"
          loading="lazy"
          fit="cover"
        />
      </div>
    </div>
  </div>
</template>

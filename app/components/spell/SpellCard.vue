<script setup lang="ts">
import type { Spell } from '~/types'

interface Props {
  spell: Spell
}

const props = defineProps<Props>()

/**
 * Format spell level for display
 */
const levelText = computed(() => {
  if (props.spell.level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${props.spell.level}${suffix[props.spell.level]} Level`
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  const maxLength = 150
  if (props.spell.description.length <= maxLength) return props.spell.description
  return props.spell.description.substring(0, maxLength).trim() + '...'
})

/**
 * Get badge color for spell school
 * Maps D&D schools to NuxtUI v4 color names
 */
const getSchoolColor = (schoolCode: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    A: 'info', // Abjuration (protection)
    C: 'primary', // Conjuration (summoning)
    D: 'info', // Divination (knowledge)
    EN: 'warning', // Enchantment (mind)
    EV: 'error', // Evocation (energy/damage)
    I: 'primary', // Illusion (deception)
    N: 'neutral', // Necromancy (death)
    T: 'success' // Transmutation (transformation)
  }
  return colorMap[schoolCode] || 'info'
}

/**
 * Get badge color for spell level (progressive color scale)
 * Using NuxtUI v4 color names
 */
const getLevelColor = (level: number): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  if (level === 0) return 'primary' // Cantrip - primary
  if (level <= 3) return 'info' // Low level - info
  if (level <= 6) return 'warning' // Mid level - warning
  return 'error' // High level - error
}
</script>

<template>
  <NuxtLink
    :to="`/spells/${spell.slug}`"
    class="block h-full"
  >
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Level and School Badges -->
          <div class="flex items-center gap-2 flex-wrap justify-between">
            <UBadge
              :color="getLevelColor(spell.level)"
              variant="subtle"
              size="md"
            >
              {{ levelText }}
            </UBadge>
            <UBadge
              v-if="spell.school"
              :color="getSchoolColor(spell.school.code)"
              variant="subtle"
              size="md"
            >
              {{ spell.school.name }}
            </UBadge>
          </div>

          <!-- Spell Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ spell.name }}
          </h3>

          <!-- Quick Stats (with Concentration) -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-1">
              <UIcon
                name="i-heroicons-clock"
                class="w-4 h-4"
              />
              <span>{{ spell.casting_time }}</span>
            </div>
            <div class="flex items-center gap-1">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4"
              />
              <span>{{ spell.range }}</span>
            </div>
            <UBadge
              v-if="spell.needs_concentration"
              color="warning"
              variant="soft"
              size="sm"
            >
              ⭐ Concentration
            </UBadge>
            <UBadge
              v-if="spell.is_ritual"
              color="info"
              variant="soft"
              size="sm"
            >
              🔮 Ritual
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="spell.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>

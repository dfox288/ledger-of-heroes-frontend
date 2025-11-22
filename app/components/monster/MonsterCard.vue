<script setup lang="ts">
import type { Monster } from '~/types'
import { getChallengeRatingColor } from '~/utils/badgeColors'

interface Props {
  monster: Monster
}

const props = defineProps<Props>()

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  const maxLength = 150
  if (!props.monster.description) return 'A creature from the D&D universe.'
  if (props.monster.description.length <= maxLength) return props.monster.description
  return props.monster.description.substring(0, maxLength).trim() + '...'
})

/**
 * Check if monster has legendary actions
 */
const isLegendary = computed(() => {
  return props.monster.legendary_actions && props.monster.legendary_actions.length > 0
})

/**
 * Get CR badge color
 */
const crBadgeColor = computed(() => {
  return getChallengeRatingColor(props.monster.challenge_rating)
})
</script>

<template>
  <NuxtLink
    :to="`/monsters/${monster.slug}`"
    class="block h-full"
  >
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- CR and Type Badges -->
          <div class="flex items-center gap-2 flex-wrap justify-between">
            <UBadge
              :color="crBadgeColor"
              variant="subtle"
              size="md"
            >
              CR {{ monster.challenge_rating }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ monster.type }}
            </UBadge>
          </div>

          <!-- Monster Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ monster.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-2">
              <span v-if="monster.size">🔷 {{ monster.size.name }}</span>
              <span v-if="monster.size && monster.alignment">•</span>
              <span v-if="monster.alignment">{{ monster.alignment }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span>⚔️ AC {{ monster.armor_class }}</span>
              <span>❤️ {{ monster.hit_points_average }} HP</span>
            </div>
            <div v-if="isLegendary">
              <UBadge
                color="warning"
                variant="soft"
                size="sm"
              >
                ⭐ Legendary
              </UBadge>
            </div>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="monster.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>

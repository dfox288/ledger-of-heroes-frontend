<script setup lang="ts">
import type { Monster } from '~/types/api/entities'
import { getChallengeRatingColor } from '~/utils/badgeColors'

const route = useRoute()

// Fetch monster data and setup SEO
const { data: monster, loading, error } = useEntityDetail<Monster>({
  slug: route.params.slug as string,
  endpoint: '/monsters',
  cacheKey: 'monster',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Monster`,
    descriptionExtractor: (monster: unknown) => {
      const m = monster as { description?: string }
      return m.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Monster - D&D 5e Compendium'
  }
})

/**
 * Format speeds into readable text
 */
const speedText = computed(() => {
  if (!monster.value) return ''
  const speeds: string[] = []

  if (monster.value.speed_walk) speeds.push(`${monster.value.speed_walk} ft.`)
  if (monster.value.speed_fly) speeds.push(`fly ${monster.value.speed_fly} ft.${monster.value.can_hover ? ' (hover)' : ''}`)
  if (monster.value.speed_swim) speeds.push(`swim ${monster.value.speed_swim} ft.`)
  if (monster.value.speed_burrow) speeds.push(`burrow ${monster.value.speed_burrow} ft.`)
  if (monster.value.speed_climb) speeds.push(`climb ${monster.value.speed_climb} ft.`)

  return speeds.join(', ')
})

/**
 * Quick stats for card display
 */
const quickStats = computed(() => {
  if (!monster.value) return []

  return [
    { icon: 'i-heroicons-arrows-pointing-out', label: 'Size', value: monster.value.size?.name || 'Unknown' },
    { icon: 'i-heroicons-cube', label: 'Type', value: monster.value.type },
    { icon: 'i-heroicons-scale', label: 'Alignment', value: monster.value.alignment || 'Unaligned' },
    { icon: 'i-heroicons-shield-check', label: 'Armor Class', value: monster.value.armor_type ? `${monster.value.armor_class} (${monster.value.armor_type})` : String(monster.value.armor_class) },
    { icon: 'i-heroicons-heart', label: 'Hit Points', value: `${monster.value.hit_points_average} (${monster.value.hit_dice})` },
    { icon: 'i-heroicons-bolt', label: 'Speed', value: speedText.value || 'None' },
    { icon: 'i-heroicons-hand-raised', label: 'STR', value: String(monster.value.strength) },
    { icon: 'i-heroicons-arrow-trending-up', label: 'DEX', value: String(monster.value.dexterity) },
    { icon: 'i-heroicons-heart', label: 'CON', value: String(monster.value.constitution) },
    { icon: 'i-heroicons-light-bulb', label: 'INT', value: String(monster.value.intelligence) },
    { icon: 'i-heroicons-eye', label: 'WIS', value: String(monster.value.wisdom) },
    { icon: 'i-heroicons-sparkles', label: 'CHA', value: String(monster.value.charisma) },
    { icon: 'i-heroicons-star', label: 'Challenge Rating', value: `${monster.value.challenge_rating} (${monster.value.experience_points.toLocaleString()} XP)` }
  ]
})

/**
 * Regular actions (not legendary)
 */
const regularActions = computed(() => {
  if (!monster.value?.actions) return []
  return monster.value.actions.filter(a => a.action_type === 'action')
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading
      v-if="loading"
      entity-type="monster"
    />

    <!-- Error State -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Monster"
    />

    <!-- Monster Content -->
    <div
      v-else-if="monster"
      class="space-y-8"
    >
      <!-- Breadcrumb -->
      <UiBackLink
        to="/monsters"
        label="Back to Monsters"
      />

      <!-- Header -->
      <UiDetailPageHeader
        :title="monster.name"
        :badges="[
          { label: `CR ${monster.challenge_rating}`, color: getChallengeRatingColor(monster.challenge_rating), variant: 'subtle' as const, size: 'lg' as const },
          { label: monster.type, color: 'neutral' as const, variant: 'subtle' as const, size: 'lg' as const },
          ...(monster.legendary_actions && monster.legendary_actions.length > 0 ? [{ label: '⭐ Legendary', color: 'warning' as const, variant: 'soft' as const, size: 'sm' as const }] : [])
        ]"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard :stats="quickStats" />

      <!-- Description -->
      <div
        v-if="monster.description"
        class="prose dark:prose-invert max-w-none"
      >
        <p class="whitespace-pre-line">{{ monster.description }}</p>
      </div>

      <!-- Traits -->
      <UiAccordionTraits
        v-if="monster.traits && monster.traits.length > 0"
        :traits="monster.traits"
      />

      <!-- Actions -->
      <UiAccordionActions
        v-if="regularActions.length > 0"
        :actions="regularActions"
        title="Actions"
      />

      <!-- Legendary Actions -->
      <UiAccordionActions
        v-if="monster.legendary_actions && monster.legendary_actions.length > 0"
        :actions="monster.legendary_actions"
        title="Legendary Actions"
        :show-cost="true"
      />

      <!-- Modifiers -->
      <UiModifiersDisplay
        v-if="monster.modifiers && monster.modifiers.length > 0"
        :modifiers="monster.modifiers"
      />

      <!-- Sources -->
      <UiSourceDisplay
        v-if="monster.sources && monster.sources.length > 0"
        :sources="monster.sources"
      />

      <!-- Back to Monsters -->
      <div class="text-center">
        <UButton
          to="/monsters"
          variant="soft"
          color="neutral"
        >
          ← Back to Monsters
        </UButton>
      </div>

      <!-- Debug Panel -->
      <JsonDebugPanel :data="monster" />
    </div>
  </div>
</template>

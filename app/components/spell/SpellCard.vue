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
</script>

<template>
  <UiCardUiEntityCard
    :to="`/spells/${spell.slug}`"
    entity-type="spells"
    :slug="spell.slug"
    color="spell"
    :description="spell.description"
    :sources="spell.sources"
  >
    <template #badges>
      <UBadge
        color="spell"
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
    </template>

    <template #title>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
        {{ spell.name }}
      </h3>
    </template>

    <template #stats>
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
        color="spell"
        variant="subtle"
        size="md"
      >
        ⭐ Concentration
      </UBadge>
      <UBadge
        v-if="spell.is_ritual"
        color="spell"
        variant="subtle"
        size="md"
      >
        🔮 Ritual
      </UBadge>
    </template>
  </UiCardUiEntityCard>
</template>

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

/**
 * Parse area of effect field (Issue #54)
 * Safely parse JSON string and extract type/size
 */
const areaOfEffect = computed(() => {
  const aoe = props.spell.area_of_effect
  if (!aoe) return null

  // API returns object directly: { type: "sphere", size: 20 }
  if (typeof aoe === 'object' && aoe !== null) {
    const parsed = aoe as { type?: string, size?: number }
    if (parsed.type && typeof parsed.size === 'number') {
      return { type: parsed.type, size: parsed.size }
    }
  }

  // Fallback: try JSON.parse for legacy string format
  if (typeof aoe === 'string') {
    try {
      return JSON.parse(aoe) as { type: string, size: number }
    } catch {
      return null
    }
  }

  return null
})

/**
 * Format area of effect for display
 * Example: "20ft sphere", "60ft cone"
 */
const aoeText = computed(() => {
  if (!areaOfEffect.value) return null
  const { type, size } = areaOfEffect.value
  return `${size}ft ${type}`
})

/**
 * Check if material is consumed (Issue #53)
 * material_consumed is a string boolean ('true'/'false')
 */
const isMaterialConsumed = computed(() => {
  return props.spell.material_consumed === 'true'
})
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
        v-if="aoeText"
        color="spell"
        variant="subtle"
        size="md"
      >
        {{ aoeText }}
      </UBadge>
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
      <UBadge
        v-if="spell.material_cost_gp"
        color="spell"
        variant="subtle"
        size="md"
      >
        💰 {{ spell.material_cost_gp }} gp
      </UBadge>
      <UBadge
        v-if="isMaterialConsumed"
        color="spell"
        variant="subtle"
        size="md"
      >
        🔥 Consumed
      </UBadge>
    </template>
  </UiCardUiEntityCard>
</template>

<script setup lang="ts">
interface Spell {
  id: number
  name: string
  slug: string
  level: number
  school?: {
    id: number
    code: string
    name: string
  }
  casting_time: string
  range: string
  description: string
  is_ritual: boolean
  needs_concentration: boolean
  sources?: Array<{
    code: string
    name: string
    pages: string
  }>
}

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
 * Maps D&D schools to thematic colors
 */
const getSchoolColor = (schoolCode: string): string => {
  const colorMap: Record<string, string> = {
    'A': 'sky',       // Abjuration (protection)
    'C': 'violet',    // Conjuration (summoning)
    'D': 'cyan',      // Divination (knowledge)
    'EN': 'pink',     // Enchantment (mind)
    'EV': 'red',      // Evocation (energy/damage)
    'I': 'indigo',    // Illusion (deception)
    'N': 'slate',     // Necromancy (death)
    'T': 'emerald',   // Transmutation (transformation)
  }
  return colorMap[schoolCode] || 'sky'
}

/**
 * Get badge color for spell level (progressive color scale)
 */
const getLevelColor = (level: number): string => {
  if (level === 0) return 'purple'  // Cantrip - purple
  if (level <= 3) return 'blue'     // Low level - blue
  if (level <= 6) return 'orange'   // Mid level - orange
  return 'red'                      // High level - red
}
</script>

<template>
  <NuxtLink :to="`/spells/${spell.slug}`" class="block h-full">
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Level and School Badges (RIGHT ALIGNED, COLORED) -->
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <UBadge
              :color="getLevelColor(spell.level)"
              variant="solid"
              size="md"
            >
              {{ levelText }}
            </UBadge>
            <UBadge
              v-if="spell.school"
              :color="getSchoolColor(spell.school.code)"
              variant="solid"
              size="md"
            >
              {{ spell.school.name }}
            </UBadge>
          </div>

          <!-- Spell Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ spell.name }}
          </h3>

          <!-- Quick Stats -->
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-clock" class="w-4 h-4" />
              <span>{{ spell.casting_time }}</span>
            </div>
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-4 h-4" />
              <span>{{ spell.range }}</span>
            </div>
          </div>

          <!-- Ritual/Concentration Badges (BIGGER) -->
          <div v-if="spell.is_ritual || spell.needs_concentration" class="flex items-center gap-2">
            <UBadge v-if="spell.is_ritual" color="cyan" variant="soft" size="md">
              🔮 Ritual
            </UBadge>
            <UBadge v-if="spell.needs_concentration" color="amber" variant="soft" size="md">
              ⭐ Concentration
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <!-- Sourcebook Display (BOTTOM ALIGNED, FULL LENGTH) -->
        <div v-if="spell.sources && spell.sources.length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 flex-wrap text-xs text-gray-600 dark:text-gray-400">
            <span v-for="(source, index) in spell.sources" :key="source.code">
              <span class="font-medium">{{ source.name }}</span> p.{{ source.pages }}<span v-if="index < spell.sources.length - 1">, </span>
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

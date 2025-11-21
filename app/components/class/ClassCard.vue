<script setup lang="ts">
import type { Source } from '~/types'

interface CharacterClass {
  id: number
  name: string
  slug: string
  hit_die: number
  is_base_class: boolean
  parent_class_id?: number | null
  primary_ability?: {
    id: number
    code: string
    name: string
  } | null
  spellcasting_ability?: {
    id: number
    code: string
    name: string
  } | null
  subclasses?: any[]
  proficiencies?: any[]
  description?: string
  sources?: Source[]
}

interface Props {
  characterClass: CharacterClass
}

const props = defineProps<Props>()

/**
 * Format hit die for display
 */
const hitDieText = computed(() => {
  return `d${props.characterClass.hit_die}`
})

/**
 * Check if this is a base class or subclass
 */
const isBaseClass = computed(() => {
  return props.characterClass.is_base_class === true
})

/**
 * Get type badge color
 */
const typeBadgeColor = computed(() => {
  return isBaseClass.value ? 'error' : 'warning'
})

/**
 * Get type badge text
 */
const typeBadgeText = computed(() => {
  return isBaseClass.value ? 'Base Class' : 'Subclass'
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  if (!props.characterClass.description) return 'A playable class for D&D 5e characters'
  const maxLength = 120
  if (props.characterClass.description.length <= maxLength) return props.characterClass.description
  return props.characterClass.description.substring(0, maxLength).trim() + '...'
})
</script>

<template>
  <NuxtLink :to="`/classes/${characterClass.slug}`" class="block h-full">
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="space-y-3">
        <!-- Type, Hit Die, and Ability Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge :color="typeBadgeColor" variant="subtle" size="sm">
            {{ typeBadgeText }}
          </UBadge>
          <UBadge v-if="characterClass.primary_ability" color="info" variant="soft" size="sm">
            🎯 {{ characterClass.primary_ability.code }}
          </UBadge>
          <UBadge v-if="characterClass.spellcasting_ability" color="primary" variant="soft" size="sm">
            ✨ {{ characterClass.spellcasting_ability.name }}
          </UBadge>
        </div>

        <!-- Class Name -->
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {{ characterClass.name }}
        </h3>

        <!-- Quick Stats -->
        <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-heart" class="w-4 h-4" />
            <span>Hit Die: {{ hitDieText }}</span>
          </div>
          <div v-if="isBaseClass && characterClass.subclasses && characterClass.subclasses.length > 0" class="flex items-center gap-1">
            <UIcon name="i-heroicons-users" class="w-4 h-4" />
            <span>{{ characterClass.subclasses.length }} {{ characterClass.subclasses.length === 1 ? 'Subclass' : 'Subclasses' }}</span>
          </div>
        </div>

        <!-- Description Preview -->
        <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {{ truncatedDescription }}
        </p>
      </div>

      <UiCardSourceFooter :sources="characterClass.sources" />
    </UCard>
  </NuxtLink>
</template>

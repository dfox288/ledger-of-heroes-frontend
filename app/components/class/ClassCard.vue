<script setup lang="ts">
import type { CharacterClass } from '~/types'

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
 * Get type badge text
 */
const typeBadgeText = computed(() => {
  return isBaseClass.value ? 'Base Class' : 'Subclass'
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.characterClass.description),
  150,
  'A playable class for D&D 5e characters'
)

/**
 * Get primary ability code for display
 */
const primaryAbilityCode = computed(() => {
  return props.characterClass.primary_ability || null
})

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('classes', props.characterClass.slug, 256)
})
</script>

<template>
  <NuxtLink
    :to="`/classes/${characterClass.slug}`"
    class="block h-full group"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-class-300 dark:border-class-700 hover:border-class-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        data-testid="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Type, Hit Die, and Ability Badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              color="class"
              variant="subtle"
              size="md"
            >
              {{ typeBadgeText }}
            </UBadge>
            <UBadge
              v-if="primaryAbilityCode"
              color="class"
              variant="subtle"
              size="md"
            >
              🎯 {{ primaryAbilityCode }}
            </UBadge>
            <UBadge
              v-if="characterClass.spellcasting_ability"
              color="class"
              variant="subtle"
              size="md"
            >
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
              <UIcon
                name="i-heroicons-heart"
                class="w-4 h-4"
              />
              <span>Hit Die: {{ hitDieText }}</span>
            </div>
            <div
              v-if="isBaseClass && characterClass.subclasses && characterClass.subclasses.length > 0"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-users"
                class="w-4 h-4"
              />
              <span>{{ characterClass.subclasses.length }} {{ characterClass.subclasses.length === 1 ? 'Subclass' : 'Subclasses' }}</span>
            </div>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="characterClass.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>

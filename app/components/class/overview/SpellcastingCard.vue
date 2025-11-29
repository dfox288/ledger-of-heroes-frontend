<script setup lang="ts">
import type { components } from '~/types/api/generated'

type AbilityScore = components['schemas']['AbilityScoreResource']
type LevelProgression = components['schemas']['ClassLevelProgressionResource']

interface Props {
  spellcastingAbility: AbilityScore
  levelProgression: LevelProgression[]
  slug: string
}

const props = defineProps<Props>()

/**
 * Determine caster type based on spell slot progression
 */
const casterType = computed(() => {
  // Find level 20 progression
  const level20 = props.levelProgression.find(lp => lp.level === 20)
  if (!level20) return null

  // Full casters have 9th level slots at 20
  if (level20.spell_slots_9th && level20.spell_slots_9th > 0) {
    return 'Full Caster'
  }

  // Half casters have 5th level slots at 20
  if (level20.spell_slots_5th && level20.spell_slots_5th > 0 && !level20.spell_slots_6th) {
    return 'Half Caster'
  }

  // Third casters (like Eldritch Knight) have 4th level slots
  if (level20.spell_slots_4th && level20.spell_slots_4th > 0 && !level20.spell_slots_5th) {
    return 'Third Caster'
  }

  return 'Caster'
})

/**
 * Get cantrips progression summary
 */
const cantripsSummary = computed(() => {
  const level1 = props.levelProgression.find(lp => lp.level === 1)
  const level20 = props.levelProgression.find(lp => lp.level === 20)

  if (!level1) return null

  const startCantrips = level1.cantrips_known || 0
  const endCantrips = level20?.cantrips_known || startCantrips

  if (startCantrips === 0) return null

  if (startCantrips === endCantrips) {
    return `${startCantrips} cantrips`
  }

  return `${startCantrips} → ${endCantrips} cantrips`
})

/**
 * Get spell slots summary for level 1
 */
const spellSlotsSummary = computed(() => {
  const level1 = props.levelProgression.find(lp => lp.level === 1)
  if (!level1) return null

  const slots = []
  const slotFields: (keyof LevelProgression)[] = [
    'spell_slots_1st',
    'spell_slots_2nd',
    'spell_slots_3rd',
    'spell_slots_4th',
    'spell_slots_5th',
    'spell_slots_6th',
    'spell_slots_7th',
    'spell_slots_8th',
    'spell_slots_9th'
  ]

  slotFields.forEach((field, index) => {
    const slotCount = level1[field]
    if (slotCount && slotCount > 0) {
      const level = index + 1
      const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'
      slots.push(`${slotCount} × ${level}${suffix} level`)
    }
  })

  return slots.length > 0 ? slots.join(', ') : null
})
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <UIcon
              name="i-heroicons-sparkles"
              class="w-6 h-6 text-primary-600 dark:text-primary-400"
            />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Spellcasting
            </h3>
            <UBadge
              v-if="casterType"
              color="primary"
              variant="soft"
              size="xs"
            >
              {{ casterType }}
            </UBadge>
          </div>

          <!-- Ability -->
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-600 dark:text-gray-400">Spellcasting Ability:</span>
              <span class="text-gray-900 dark:text-gray-100 font-semibold">
                {{ spellcastingAbility.name }} ({{ spellcastingAbility.code }})
              </span>
            </div>

            <!-- Cantrips -->
            <div
              v-if="cantripsSummary"
              class="flex items-center gap-2"
            >
              <span class="font-medium text-gray-600 dark:text-gray-400">Cantrips:</span>
              <span class="text-gray-900 dark:text-gray-100">
                {{ cantripsSummary }}
              </span>
            </div>

            <!-- Level 1 spell slots -->
            <div
              v-if="spellSlotsSummary"
              class="flex items-center gap-2"
            >
              <span class="font-medium text-gray-600 dark:text-gray-400">Starting Spell Slots:</span>
              <span class="text-gray-900 dark:text-gray-100">
                {{ spellSlotsSummary }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Link to Reference for full table -->
      <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink
          :to="`/classes/${slug}/reference`"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group"
        >
          <span>View full spell slot progression</span>
          <UIcon
            name="i-heroicons-arrow-right"
            class="w-4 h-4 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>
  </UCard>
</template>

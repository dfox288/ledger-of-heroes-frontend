<script setup lang="ts">
import type { Race } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type ModifierResource = components['schemas']['ModifierResource']
type EntitySenseResource = components['schemas']['EntitySenseResource']
type EntityLanguageResource = components['schemas']['EntityLanguageResource']
type ProficiencyResource = components['schemas']['ProficiencyResource']
type EntityConditionResource = components['schemas']['EntityConditionResource']

interface Props {
  parentRaceName: string
  parentRaceSlug: string
  inheritedData: NonNullable<Race['inherited_data']>
}

const props = defineProps<Props>()

/**
 * Filter inherited traits by category
 */
const loreTraits = computed(() => {
  return props.inheritedData.traits?.filter(t => t.category === 'description') ?? []
})

const speciesTraits = computed(() => {
  return props.inheritedData.traits?.filter(t => t.category === 'species') ?? []
})

/**
 * Truncate description helper
 */
function truncateDescription(desc: string | null | undefined): string {
  if (!desc) return ''
  const maxLength = 120
  if (desc.length <= maxLength) return desc
  const truncated = desc.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  if (lastPeriod > maxLength * 0.4) {
    return truncated.substring(0, lastPeriod + 1)
  }
  return truncated + '...'
}

/**
 * Formats modifier text for display
 * Example: "+2 Strength" or "Fire Resistance"
 */
function formatModifier(modifier: ModifierResource): string {
  if (modifier.modifier_category === 'ability_score' && modifier.ability_score) {
    return `+${modifier.value} ${modifier.ability_score.name}`
  }
  if (modifier.modifier_category === 'damage_resistance' && modifier.damage_type) {
    return `${modifier.damage_type.name} ${modifier.value}`
  }
  if (modifier.skill) {
    return `+${modifier.value} ${modifier.skill.name}`
  }
  // Fallback for other modifier types
  return `${modifier.modifier_category}: ${modifier.value}`
}

/**
 * Formats sense text with range
 * Example: "Darkvision 60 ft."
 */
function formatSense(sense: EntitySenseResource): string {
  let text = sense.name
  if (sense.range) {
    text += ` ${sense.range} ft.`
  }
  if (sense.is_limited) {
    text += ' (limited)'
  }
  return text
}

/**
 * Gets display name for language (handles nested structure)
 */
function getLanguageName(lang: EntityLanguageResource): string {
  return lang.language?.name || 'Unknown Language'
}

/**
 * Gets display name for proficiency (handles nested structure)
 */
function getProficiencyName(prof: ProficiencyResource): string {
  return prof.proficiency_name || prof.proficiency_type_detail?.name || prof.skill?.name || prof.item?.name || 'Unknown Proficiency'
}

/**
 * Formats condition with its effect type for proper D&D context
 * Examples:
 * - "Advantage on saves vs. Frightened"
 * - "Immunity to Poisoned"
 * - "Resistance to Charmed"
 */
function formatCondition(condition: EntityConditionResource): string {
  const conditionName = condition.condition?.name || 'Unknown Condition'
  const effectType = condition.effect_type

  switch (effectType) {
    case 'advantage':
      return `Advantage on saves vs. ${conditionName}`
    case 'immunity':
      return `Immunity to ${conditionName}`
    case 'resistance':
      return `Resistance to ${conditionName}`
    case 'disadvantage':
      return `Disadvantage on saves vs. ${conditionName}`
    case 'vulnerability':
      return `Vulnerability to ${conditionName}`
    default:
      // If no effect_type or unknown, just show the condition name
      return conditionName
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-arrow-up-circle"
            class="size-5 text-neutral-500 dark:text-neutral-400"
          />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Inherited from {{ parentRaceName }}
          </h3>
        </div>
        <NuxtLink
          :to="`/races/${parentRaceSlug}`"
          class="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          View {{ parentRaceName }} →
        </NuxtLink>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Inherited Lore (description category traits) -->
      <div
        v-if="loreTraits.length > 0"
        class="space-y-3"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-book-open"
            class="size-4"
          />
          Lore
        </h4>
        <UAccordion
          :items="[{ label: `${loreTraits.length} lore ${loreTraits.length === 1 ? 'entry' : 'entries'}`, slot: 'lore', defaultOpen: false }]"
          data-testid="inherited-lore"
        >
          <template #lore>
            <div class="space-y-3 p-2">
              <div
                v-for="trait in loreTraits"
                :key="trait.id"
                class="space-y-1"
              >
                <h5 class="font-medium text-gray-800 dark:text-gray-200 text-sm">
                  {{ trait.name }}
                </h5>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                  {{ trait.description }}
                </p>
              </div>
            </div>
          </template>
        </UAccordion>
      </div>

      <!-- Inherited Species Traits (with descriptions) -->
      <div
        v-if="speciesTraits.length > 0"
        class="space-y-3"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-sparkles"
            class="size-4"
          />
          Traits
        </h4>
        <div
          class="space-y-3"
          data-testid="inherited-traits"
        >
          <div
            v-for="trait in speciesTraits"
            :key="trait.id"
            class="border-l-2 border-warning-400 pl-3 py-1"
          >
            <h5 class="font-medium text-gray-800 dark:text-gray-200 text-sm">
              {{ trait.name }}
            </h5>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ truncateDescription(trait.description) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Inherited Modifiers (ASI, Resistances) -->
      <div
        v-if="inheritedData.modifiers && inheritedData.modifiers.length > 0"
        class="space-y-2"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-arrow-trending-up"
            class="size-4"
          />
          Modifiers
        </h4>
        <div
          class="flex flex-wrap gap-2"
          data-testid="inherited-modifiers"
        >
          <UBadge
            v-for="mod in inheritedData.modifiers"
            :key="mod.id"
            color="neutral"
            variant="soft"
            size="md"
          >
            {{ formatModifier(mod) }}
          </UBadge>
        </div>
      </div>

      <!-- Inherited Languages -->
      <div
        v-if="inheritedData.languages && inheritedData.languages.length > 0"
        class="space-y-2"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-language"
            class="size-4"
          />
          Languages
        </h4>
        <div
          class="flex flex-wrap gap-2"
          data-testid="inherited-languages"
        >
          <UBadge
            v-for="(lang, index) in inheritedData.languages"
            :key="index"
            color="neutral"
            variant="outline"
            size="md"
          >
            {{ getLanguageName(lang) }}
          </UBadge>
        </div>
      </div>

      <!-- Inherited Senses -->
      <div
        v-if="inheritedData.senses && inheritedData.senses.length > 0"
        class="space-y-2"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-eye"
            class="size-4"
          />
          Senses
        </h4>
        <div
          class="flex flex-wrap gap-2"
          data-testid="inherited-senses"
        >
          <UBadge
            v-for="sense in inheritedData.senses"
            :key="sense.type"
            color="info"
            variant="soft"
            size="md"
          >
            {{ formatSense(sense) }}
          </UBadge>
        </div>
      </div>

      <!-- Inherited Proficiencies -->
      <div
        v-if="inheritedData.proficiencies && inheritedData.proficiencies.length > 0"
        class="space-y-2"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-shield-check"
            class="size-4"
          />
          Proficiencies
        </h4>
        <ul
          class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6"
          data-testid="inherited-proficiencies"
        >
          <li
            v-for="prof in inheritedData.proficiencies"
            :key="prof.id"
          >
            {{ getProficiencyName(prof) }}
          </li>
        </ul>
      </div>

      <!-- Inherited Condition Defenses -->
      <div
        v-if="inheritedData.conditions && inheritedData.conditions.length > 0"
        class="space-y-2"
      >
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <UIcon
            name="i-heroicons-shield-exclamation"
            class="size-4"
          />
          Condition Defenses
        </h4>
        <div
          class="flex flex-wrap gap-2"
          data-testid="inherited-conditions"
        >
          <UBadge
            v-for="(condition, index) in inheritedData.conditions"
            :key="index"
            color="success"
            variant="soft"
            size="md"
          >
            {{ formatCondition(condition) }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

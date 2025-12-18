<script setup lang="ts">
import type { components } from '~/types/api/generated'
import type { EntityChoice } from '~/types'

type EntitySpellResource = components['schemas']['EntitySpellResource']

interface Props {
  spells: EntitySpellResource[]
  spellChoices?: EntityChoice[]
}

const props = withDefaults(defineProps<Props>(), {
  spellChoices: () => []
})

// Image helper for spell backgrounds
const { getImagePath } = useEntityImage()

/**
 * Only show fixed spells with actual spell data
 */
const fixedSpells = computed(() =>
  props.spells.filter(s => s.spell)
)

/**
 * Get spell image path for background
 */
function getSpellImagePath(slug: string): string | null {
  return getImagePath('spells', slug, 256)
}

/**
 * Spell choices to display (filtered from spellChoices prop)
 */
const spellChoicesToDisplay = computed(() =>
  (props.spellChoices ?? []).filter(c => c.choice_type === 'spell')
)

/**
 * Format spell level for display
 */
function getSpellLevelText(level: number): string {
  if (level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${level}${suffix[level]} Level`
}

/**
 * Format spell level for choice card (lowercase for sentence)
 */
function getSpellLevelLabel(maxLevel: number | null | undefined): string {
  if (!maxLevel || maxLevel === 0) return 'cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${maxLevel}${suffix[maxLevel]}-level`
}

/**
 * Build description for spell choice card using EntityChoice
 */
function getChoiceDescription(choice: EntityChoice): string {
  const count = choice.quantity === 1 ? 'a' : choice.quantity
  const levelText = getSpellLevelLabel(choice.spell_max_level)
  const spellWord = choice.quantity === 1 ? 'spell' : 'spells'

  let desc = `Choose ${count} ${levelText} ${spellWord}`

  // Add school restriction if present
  if (choice.spell_school_slug) {
    desc += ` from the ${choice.spell_school_slug.replace('phb:', '')} school`
  }

  // Add spell list restriction if present
  if (choice.spell_list_slug) {
    const listName = choice.spell_list_slug.replace('phb:', '')
    desc += ` (${listName} spell list)`
  }

  return desc
}

/**
 * Check if we should render the component
 */
const shouldRender = computed(() =>
  fixedSpells.value.length > 0 || spellChoicesToDisplay.value.length > 0
)
</script>

<template>
  <section v-if="shouldRender">
    <div class="flex items-center gap-2 mb-4">
      <UIcon
        name="i-heroicons-sparkles"
        class="w-5 h-5 text-primary"
      />
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
        Granted Spells
      </h2>
    </div>

    <!-- Max 2 columns - works in constrained hero section width -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Fixed Spells (actual spell cards with links) -->
      <NuxtLink
        v-for="entitySpell in fixedSpells"
        :key="entitySpell.id"
        :to="`/spells/${entitySpell.spell?.slug}`"
        class="block group"
      >
        <UCard
          class="h-full hover:ring-2 hover:ring-spell-500 dark:hover:ring-spell-400 transition-all border-2 border-spell-200 dark:border-spell-800 overflow-hidden relative"
        >
          <!-- Background Image -->
          <div
            v-if="entitySpell.spell?.slug"
            class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
            :style="{
              backgroundImage: `url(${getSpellImagePath(entitySpell.spell.slug)})`
            }"
          />

          <template #header>
            <div class="relative z-10">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-spell-600 dark:group-hover:text-spell-400 transition-colors">
                {{ entitySpell.spell?.name }}
              </h3>
            </div>
          </template>

          <div class="space-y-3 relative z-10">
            <!-- Level & School Row -->
            <div class="flex flex-wrap gap-1.5">
              <UBadge
                color="spell"
                variant="subtle"
                size="md"
              >
                {{ getSpellLevelText(entitySpell.spell?.level ?? 0) }}
              </UBadge>
              <UBadge
                v-if="entitySpell.spell?.school"
                color="primary"
                variant="subtle"
                size="md"
              >
                {{ entitySpell.spell.school.name }}
              </UBadge>
            </div>

            <!-- Spell Stats -->
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div class="flex items-center gap-1.5">
                <UIcon
                  name="i-heroicons-clock"
                  class="w-4 h-4 flex-shrink-0"
                />
                <span>{{ entitySpell.spell?.casting_time }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <UIcon
                  name="i-heroicons-arrow-trending-up"
                  class="w-4 h-4 flex-shrink-0"
                />
                <span>{{ entitySpell.spell?.range }}</span>
              </div>
            </div>

            <!-- Special Properties -->
            <div
              v-if="entitySpell.spell?.needs_concentration || entitySpell.spell?.is_ritual"
              class="flex flex-wrap gap-1.5"
            >
              <UBadge
                v-if="entitySpell.spell?.needs_concentration"
                color="warning"
                variant="subtle"
                size="md"
              >
                ⭐ Concentration
              </UBadge>
              <UBadge
                v-if="entitySpell.spell?.is_ritual"
                color="info"
                variant="subtle"
                size="md"
              >
                🔮 Ritual
              </UBadge>
            </div>
          </div>
        </UCard>
      </NuxtLink>

      <!-- Spell Choices (player picks from allowed options) -->
      <div
        v-for="choice in spellChoicesToDisplay"
        :key="`choice-${choice.id}`"
        class="block"
      >
        <UCard
          class="h-full border-2 border-dashed border-spell-300 dark:border-spell-700 bg-spell-50/50 dark:bg-spell-950/30"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-puzzle-piece"
                class="w-5 h-5 text-spell-500"
              />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Spell Choice
              </h3>
            </div>
          </template>

          <div class="space-y-3">
            <!-- Choice Description -->
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ getChoiceDescription(choice) }}
            </p>

            <!-- School Restriction (if any) -->
            <div v-if="choice.spell_school_slug">
              <UBadge
                color="spell"
                variant="subtle"
                size="md"
              >
                {{ choice.spell_school_slug.replace('phb:', '') }}
              </UBadge>
            </div>

            <!-- Spell List Restriction (if any) -->
            <div v-if="choice.spell_list_slug">
              <UBadge
                color="warning"
                variant="subtle"
                size="md"
              >
                {{ choice.spell_list_slug.replace('phb:', '') }} Spell List
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>

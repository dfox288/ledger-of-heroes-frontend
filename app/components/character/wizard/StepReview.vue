<!-- app/components/character/wizard/StepReview.vue -->
<script setup lang="ts">
/**
 * Final review step - shows complete character summary before finishing
 *
 * Displays:
 * - Character name and identity (race/class/background)
 * - Ability scores
 * - Combat stats (HP, AC, Initiative, Speed, Proficiency)
 * - Saving throws
 * - Spellcasting (if spellcaster)
 * - Proficiencies
 * - Languages
 * - Equipment
 * - Spells (if spellcaster)
 */

import { useCharacterWizardStore } from '~/stores/characterWizard'
import type {
  CharacterProficiency,
  CharacterLanguage,
  CharacterEquipment,
  CharacterSpell
} from '~/types/character'

const store = useCharacterWizardStore()
const { apiFetch } = useApi()
const router = useRouter()

/**
 * Finish wizard and navigate to character sheet
 */
async function finishWizard() {
  // Navigate to character sheet using publicId
  await router.push(`/characters/${store.publicId}`)

  // Reset wizard state after navigation
  store.reset()
}

// Fetch character stats
const {
  hitPoints,
  armorClass,
  initiative,
  proficiencyBonus,
  savingThrows,
  spellcasting,
  abilityScores,
  isSpellcaster
} = useCharacterStats(computed(() => store.characterId))

// Speed comes from race, not stats endpoint
const speed = computed(() => store.selections.race?.speed ?? 30)

// Character identity
const characterName = computed(() => store.selections.name || 'Unnamed Character')
const race = computed(() => store.selections.race?.name || 'Unknown')
const characterClass = computed(() => store.selections.class?.name || 'Unknown')
const background = computed(() => store.selections.background?.name || 'Unknown')

// ══════════════════════════════════════════════════════════════
// Fetch character data from backend
// ══════════════════════════════════════════════════════════════

// Fetch proficiencies
const { data: proficiencies } = await useAsyncData(
  `review-proficiencies-${store.characterId}`,
  () => apiFetch<{ data: CharacterProficiency[] }>(`/characters/${store.characterId}/proficiencies`),
  {
    transform: response => response.data,
    watch: [() => store.characterId]
  }
)

// Fetch languages
const { data: languages } = await useAsyncData(
  `review-languages-${store.characterId}`,
  () => apiFetch<{ data: CharacterLanguage[] }>(`/characters/${store.characterId}/languages`),
  {
    transform: response => response.data,
    watch: [() => store.characterId]
  }
)

// Fetch equipment
const { data: equipment } = await useAsyncData(
  `review-equipment-${store.characterId}`,
  () => apiFetch<{ data: CharacterEquipment[] }>(`/characters/${store.characterId}/equipment`),
  {
    transform: response => response.data,
    watch: [() => store.characterId]
  }
)

// Fetch spells (only if spellcaster)
const { data: spells } = await useAsyncData(
  `review-spells-${store.characterId}`,
  () => {
    if (!isSpellcaster.value) return Promise.resolve({ data: [] })
    return apiFetch<{ data: CharacterSpell[] }>(`/characters/${store.characterId}/spells`)
  },
  {
    transform: response => response.data,
    watch: [() => store.characterId, isSpellcaster]
  }
)

// ══════════════════════════════════════════════════════════════
// Group proficiencies by type
// ══════════════════════════════════════════════════════════════

interface ProficiencyGroup {
  type: string
  label: string
  icon: string
  items: string[]
}

// Define display order and labels for proficiency types
// Note: Saving throws are displayed separately via SavingThrowsCard component
const typeConfig: Record<string, { label: string, icon: string }> = {
  armor: { label: 'Armor', icon: 'i-heroicons-shield-check' },
  weapon: { label: 'Weapons', icon: 'i-heroicons-bolt' },
  tool: { label: 'Tools', icon: 'i-heroicons-wrench-screwdriver' },
  skill: { label: 'Skills', icon: 'i-heroicons-academic-cap' },
  other: { label: 'Other', icon: 'i-heroicons-check-circle' }
}

/**
 * Group proficiencies by type for display
 * The /proficiencies endpoint now returns ALL proficiencies (skills, armor, weapons, tools)
 * from all sources (class, race, background), so we only need to process that response.
 * Note: Saving throw proficiencies are displayed separately via the SavingThrowsCard component.
 */
const proficiencyGroups = computed<ProficiencyGroup[]>(() => {
  const grouped = new Map<string, Set<string>>()

  // Helper to add a proficiency to the grouped map
  const addProficiency = (type: string, name: string) => {
    const existing = grouped.get(type) ?? new Set()
    existing.add(name)
    grouped.set(type, existing)
  }

  // Process all proficiencies from the unified endpoint
  if (proficiencies.value) {
    for (const prof of proficiencies.value) {
      if (prof.skill) {
        // Skill proficiency
        let name = prof.skill.name
        if (prof.expertise) name += ' (Expertise)'
        addProficiency('skill', name)
      } else if (prof.proficiency_type) {
        // Non-skill proficiency (armor, weapon, tool, etc.)
        const type = prof.proficiency_type.category || 'other'
        addProficiency(type, prof.proficiency_type.name)
      }
    }
  }

  // Build result array in display order
  const typeOrder = ['armor', 'weapon', 'tool', 'skill', 'other']
  const result: ProficiencyGroup[] = []

  for (const type of typeOrder) {
    const items = grouped.get(type)
    if (items && items.size > 0) {
      const config = typeConfig[type] || typeConfig.other!
      result.push({
        type,
        label: config.label,
        icon: config.icon,
        items: Array.from(items).sort()
      })
    }
  }

  // Add any remaining types not in typeOrder
  for (const [type, items] of grouped) {
    if (!typeOrder.includes(type) && items.size > 0) {
      result.push({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        icon: 'i-heroicons-check-circle',
        items: Array.from(items).sort()
      })
    }
  }

  return result
})

// ══════════════════════════════════════════════════════════════
// Group spells by level
// ══════════════════════════════════════════════════════════════

interface SpellGroup {
  level: number
  label: string
  spells: CharacterSpell[]
}

const spellGroups = computed<SpellGroup[]>(() => {
  if (!spells.value || spells.value.length === 0) return []

  const grouped = new Map<number, CharacterSpell[]>()

  for (const spell of spells.value) {
    const level = spell.spell.level
    const existing = grouped.get(level) ?? []
    grouped.set(level, [...existing, spell])
  }

  // Sort by level
  const levels = Array.from(grouped.keys()).sort((a, b) => a - b)

  return levels.map(level => ({
    level,
    label: level === 0 ? 'Cantrips' : `${level}${getOrdinalSuffix(level)} Level`,
    spells: grouped.get(level)?.sort((a, b) => a.spell.name.localeCompare(b.spell.name)) ?? []
  }))
})

function getOrdinalSuffix(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return suffixes[n] ?? 'th'
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header: Character Name and Identity -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ characterName }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ race }} · {{ characterClass }} · {{ background }}
        </p>
      </div>
      <UButton
        variant="ghost"
        label="Edit Details"
        icon="i-heroicons-pencil-square"
      />
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Ability Scores -->
      <div class="lg:col-span-1">
        <UCard :ui="{ body: 'p-4' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-5 h-5 text-primary"
              />
              <span class="font-semibold text-gray-900 dark:text-white">Ability Scores</span>
            </div>
          </template>

          <div
            v-if="abilityScores"
            class="space-y-3"
          >
            <div
              v-for="ability in abilityScores"
              :key="ability.code"
              class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ ability.name }}
              </span>
              <div class="text-right">
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ ability.score }}
                </span>
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({{ ability.formattedModifier }})
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Combat Stats and Saving Throws -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Combat Stats Card -->
        <CharacterStatsCombatStatsCard
          :hit-points="hitPoints"
          :armor-class="armorClass"
          :initiative="initiative"
          :speed="speed"
          :proficiency-bonus="proficiencyBonus"
        />

        <!-- Saving Throws Card -->
        <CharacterStatsSavingThrowsCard
          v-if="savingThrows"
          :saving-throws="savingThrows"
        />

        <!-- Spellcasting Card (conditional) -->
        <CharacterStatsSpellcastingCard
          v-if="isSpellcaster && spellcasting"
          :ability="spellcasting.ability"
          :ability-name="spellcasting.abilityName"
          :save-d-c="spellcasting.saveDC"
          :attack-bonus="spellcasting.attackBonus"
          :formatted-attack-bonus="spellcasting.formattedAttackBonus"
        />
      </div>
    </div>

    <!-- Additional Sections -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Proficiencies -->
      <UCard :ui="{ body: 'p-4' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-academic-cap"
              class="w-5 h-5 text-primary"
            />
            <span class="font-semibold text-gray-900 dark:text-white">Proficiencies</span>
          </div>
        </template>

        <div
          v-if="proficiencyGroups.length > 0"
          class="space-y-4"
        >
          <div
            v-for="group in proficiencyGroups"
            :key="group.type"
          >
            <div class="flex items-center gap-2 mb-2">
              <UIcon
                :name="group.icon"
                class="w-4 h-4 text-gray-500"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ group.label }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="item in group.items"
                :key="item"
                color="neutral"
                variant="subtle"
                size="md"
              >
                {{ item }}
              </UBadge>
            </div>
          </div>
        </div>
        <div
          v-else
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          No proficiencies selected yet.
        </div>
      </UCard>

      <!-- Languages -->
      <UCard :ui="{ body: 'p-4' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-language"
              class="w-5 h-5 text-primary"
            />
            <span class="font-semibold text-gray-900 dark:text-white">Languages</span>
          </div>
        </template>

        <div
          v-if="languages && languages.length > 0"
          class="flex flex-wrap gap-2"
        >
          <UBadge
            v-for="lang in languages"
            :key="lang.id"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ lang.language?.name ?? 'Unknown' }}
          </UBadge>
        </div>
        <div
          v-else
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          No languages selected yet.
        </div>
      </UCard>
    </div>

    <!-- Equipment -->
    <UCard :ui="{ body: 'p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-shopping-bag"
            class="w-5 h-5 text-primary"
          />
          <span class="font-semibold text-gray-900 dark:text-white">Equipment</span>
        </div>
      </template>

      <div
        v-if="equipment && equipment.length > 0"
        class="space-y-2"
      >
        <div
          v-for="item in equipment"
          :key="item.id"
          class="flex items-center gap-2 text-sm"
        >
          <UIcon
            name="i-heroicons-cube"
            class="w-4 h-4 text-gray-400 flex-shrink-0"
          />
          <span class="text-gray-700 dark:text-gray-300">
            {{ item.custom_name || item.item?.name || item.custom_description || 'Unknown item' }}
          </span>
          <span
            v-if="item.quantity > 1"
            class="text-gray-500"
          >
            (×{{ item.quantity }})
          </span>
        </div>
      </div>
      <div
        v-else
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        No equipment selected yet.
      </div>
    </UCard>

    <!-- Spells (conditional) -->
    <UCard
      v-if="isSpellcaster"
      :ui="{ body: 'p-4' }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-sparkles"
            class="w-5 h-5 text-arcane-500"
          />
          <span class="font-semibold text-gray-900 dark:text-white">Spells</span>
        </div>
      </template>

      <div
        v-if="spellGroups.length > 0"
        class="space-y-4"
      >
        <div
          v-for="group in spellGroups"
          :key="group.level"
        >
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ group.label }}
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="spell in group.spells"
              :key="spell.id"
              color="spell"
              variant="subtle"
              size="md"
            >
              {{ spell.spell.name }}
              <UIcon
                v-if="spell.always_prepared"
                name="i-heroicons-star-solid"
                class="w-3 h-3 ml-1"
                title="Always Prepared"
              />
            </UBadge>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        No spells selected yet.
      </div>
    </UCard>

    <!-- Finish Button -->
    <div class="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
      <UButton
        data-testid="finish-btn"
        size="xl"
        color="primary"
        @click="finishWizard"
      >
        <UIcon
          name="i-heroicons-check-circle"
          class="w-5 h-5 mr-2"
        />
        Create Character
      </UButton>
    </div>
  </div>
</template>

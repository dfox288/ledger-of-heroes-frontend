<!-- app/components/character/wizard/review/Spells.vue -->
<script setup lang="ts">
/**
 * Spells card - displays spells grouped by level
 */

import type { CharacterSpell } from '~/types/character'

const props = defineProps<{
  spells: CharacterSpell[] | null
  isSpellcaster: boolean
}>()

interface SpellGroup {
  level: number
  label: string
  spells: CharacterSpell[]
}

function getOrdinalSuffix(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return suffixes[n] ?? 'th'
}

const spellGroups = computed<SpellGroup[]>(() => {
  if (!props.spells || props.spells.length === 0) return []

  // Filter out dangling spell references (sourcebook removed)
  const validSpells = props.spells.filter(s => s.spell !== null)
  if (validSpells.length === 0) return []

  const grouped = new Map<number, CharacterSpell[]>()

  for (const spell of validSpells) {
    const level = spell.spell!.level
    const existing = grouped.get(level) ?? []
    grouped.set(level, [...existing, spell])
  }

  const levels = Array.from(grouped.keys()).sort((a, b) => a - b)

  return levels.map(level => ({
    level,
    label: level === 0 ? 'Cantrips' : `${level}${getOrdinalSuffix(level)} Level`,
    spells: grouped.get(level)?.sort((a, b) => a.spell!.name.localeCompare(b.spell!.name)) ?? []
  }))
})
</script>

<template>
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
            {{ spell.spell!.name }}
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
</template>

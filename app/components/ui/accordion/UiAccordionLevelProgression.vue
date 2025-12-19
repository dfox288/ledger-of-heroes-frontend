<script setup lang="ts">
import type { components } from '~/types/api/generated'
import { ordinal } from '~/utils/ordinal'

type LevelProgression = components['schemas']['ClassLevelProgressionResource']

interface Props {
  levelProgression: LevelProgression[]
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  borderColor: 'gray-700'
})

// Don't render if no data
if (!props.levelProgression || props.levelProgression.length === 0) {
  // Component returns nothing
}

// Determine which columns to show based on data
const hasCantrips = computed(() =>
  props.levelProgression.some(level => level.cantrips_known !== null && level.cantrips_known !== 0)
)

const hasSpellsKnown = computed(() =>
  props.levelProgression.some(level => 'spells_known' in level)
)

// Check which spell level columns should be shown (hide if all 0)
const showSpellLevel = (level: number) => {
  const key = `spell_slots_${ordinal(level)}` as keyof LevelProgression
  return props.levelProgression.some((prog) => {
    const value = prog[key]
    return value !== null && value !== 0
  })
}

const visibleSpellLevels = computed(() => {
  const levels = []
  for (let i = 1; i <= 9; i++) {
    if (showSpellLevel(i)) {
      levels.push(i)
    }
  }
  return levels
})

// Helper to display null values as em dash
const displayValue = (value: number | null): string => {
  if (value === null) return '—'
  return String(value)
}

// Get spell slot value for a given level
const getSpellSlot = (progression: LevelProgression, level: number): number | null => {
  const key = `spell_slots_${ordinal(level)}` as keyof LevelProgression
  return progression[key] as number | null
}

// Build dynamic columns array
const columns = computed(() => {
  const cols: Array<{ key: string, label: string, width?: string, align?: 'left' | 'center' | 'right' }> = [
    { key: 'level', label: 'Level', width: 'w-20' }
  ]

  if (hasCantrips.value) {
    cols.push({ key: 'cantrips_known', label: 'Cantrips' })
  }

  if (hasSpellsKnown.value) {
    cols.push({ key: 'spells_known', label: 'Spells Known' })
  }

  for (const spellLevel of visibleSpellLevels.value) {
    cols.push({
      key: `spell_level_${spellLevel}`,
      label: ordinal(spellLevel),
      align: 'center' as const
    })
  }

  return cols
})

// Transform progression data to match dynamic columns
const tableRows = computed(() => {
  return props.levelProgression.map((prog) => {
    const row: Record<string, unknown> = {
      level: prog.level,
      cantrips_known: displayValue(prog.cantrips_known),
      spells_known: displayValue(prog.spells_known)
    }

    // Add spell slot columns
    for (const spellLevel of visibleSpellLevels.value) {
      row[`spell_level_${spellLevel}`] = getSpellSlot(prog, spellLevel)
    }

    return row
  })
})
</script>

<template>
  <div
    v-if="levelProgression && levelProgression.length > 0"
    class="p-4"
  >
    <UiAccordionDataTable
      :columns="columns"
      :rows="tableRows"
    />
  </div>
</template>

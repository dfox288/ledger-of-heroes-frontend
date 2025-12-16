<!-- app/components/character/sheet/PrepareSpellsFilters.vue -->
<script setup lang="ts">
/**
 * Filter controls for prepared caster spell selection
 *
 * Search, level dropdown (limited to max castable), hide-prepared toggle.
 * Used in "Prepare Spells" mode for clerics, druids, paladins.
 *
 * @see Issue #723 - Prepared caster spell selection
 */
import { formatSpellLevel } from '~/composables/useSpellFormatters'

const props = defineProps<{
  searchQuery: string
  selectedLevel: number | null
  maxCastableLevel: number
  hidePrepared: boolean
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedLevel': [value: number | null]
  'update:hidePrepared': [value: boolean]
}>()

/**
 * Build level options based on maxCastableLevel
 * Only shows levels the character can actually cast
 */
const levelOptions = computed(() => {
  const options = [
    { label: 'All Levels', value: null },
    { label: 'Cantrip', value: 0 }
  ]

  // Use formatSpellLevel for safe ordinal generation (handles any level)
  for (let i = 1; i <= props.maxCastableLevel; i++) {
    options.push({ label: formatSpellLevel(i), value: i })
  }

  return options
})
</script>

<template>
  <!-- All filters in one row -->
  <div class="flex flex-wrap gap-3 items-center">
    <UInput
      :model-value="searchQuery"
      placeholder="Search spells..."
      icon="i-heroicons-magnifying-glass"
      class="w-48"
      @update:model-value="emit('update:searchQuery', $event)"
    />

    <USelectMenu
      data-testid="level-filter"
      :model-value="selectedLevel"
      :options="levelOptions"
      value-attribute="value"
      option-attribute="label"
      placeholder="Level"
      class="w-32"
      @update:model-value="emit('update:selectedLevel', $event as number | null)"
    />

    <UCheckbox
      data-testid="hide-prepared-filter"
      :model-value="hidePrepared"
      label="Hide prepared"
      @update:model-value="emit('update:hidePrepared', $event as boolean)"
    />
  </div>
</template>

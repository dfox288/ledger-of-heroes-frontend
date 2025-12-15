<!-- app/components/character/sheet/SpellbookFilters.vue -->
<script setup lang="ts">
/**
 * Filter controls for spellbook column
 *
 * Search, school dropdown, level dropdown, concentration/ritual checkboxes.
 * Uses v-model pattern for all filter values.
 *
 * @see Issue #680 - Wizard Spellbook Phase 2
 */

defineProps<{
  searchQuery: string
  selectedSchool: string | null
  selectedLevel: number | null
  concentrationOnly: boolean
  ritualOnly: boolean
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedSchool': [value: string | null]
  'update:selectedLevel': [value: number | null]
  'update:concentrationOnly': [value: boolean]
  'update:ritualOnly': [value: boolean]
}>()

const schoolOptions = [
  { label: 'All Schools', value: null },
  { label: 'Abjuration', value: 'Abjuration' },
  { label: 'Conjuration', value: 'Conjuration' },
  { label: 'Divination', value: 'Divination' },
  { label: 'Enchantment', value: 'Enchantment' },
  { label: 'Evocation', value: 'Evocation' },
  { label: 'Illusion', value: 'Illusion' },
  { label: 'Necromancy', value: 'Necromancy' },
  { label: 'Transmutation', value: 'Transmutation' }
]

const levelOptions = [
  { label: 'All Levels', value: null },
  { label: 'Cantrip', value: 0 },
  { label: '1st', value: 1 },
  { label: '2nd', value: 2 },
  { label: '3rd', value: 3 },
  { label: '4th', value: 4 },
  { label: '5th', value: 5 },
  { label: '6th', value: 6 },
  { label: '7th', value: 7 },
  { label: '8th', value: 8 },
  { label: '9th', value: 9 }
]
</script>

<template>
  <div class="space-y-3">
    <!-- Search -->
    <UInput
      :model-value="searchQuery"
      placeholder="Search spells..."
      icon="i-heroicons-magnifying-glass"
      @update:model-value="emit('update:searchQuery', $event)"
    />

    <!-- Dropdowns row -->
    <div class="flex gap-2">
      <USelectMenu
        data-testid="school-filter"
        :model-value="selectedSchool"
        :options="schoolOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="School"
        class="flex-1"
        @update:model-value="emit('update:selectedSchool', $event as string | null)"
      />
      <USelectMenu
        data-testid="level-filter"
        :model-value="selectedLevel"
        :options="levelOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="Level"
        class="flex-1"
        @update:model-value="emit('update:selectedLevel', $event as number | null)"
      />
    </div>

    <!-- Checkboxes row -->
    <div class="flex gap-4">
      <UCheckbox
        data-testid="concentration-filter"
        :model-value="concentrationOnly"
        label="Concentration"
        @update:model-value="emit('update:concentrationOnly', $event as boolean)"
      />
      <UCheckbox
        data-testid="ritual-filter"
        :model-value="ritualOnly"
        label="Ritual"
        @update:model-value="emit('update:ritualOnly', $event as boolean)"
      />
    </div>
  </div>
</template>

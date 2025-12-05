<!-- app/pages/characters/[id]/index.vue -->
<script setup lang="ts">
/**
 * Character View Page - Full Character Sheet
 *
 * Displays comprehensive D&D 5e character sheet with all data sections.
 * Uses useCharacterSheet composable for parallel data fetching.
 */

const route = useRoute()
const characterId = computed(() => route.params.id as string)

const {
  character,
  stats,
  proficiencies,
  features,
  equipment,
  spells,
  languages,
  skills,
  savingThrows,
  loading,
  error
} = useCharacterSheet(characterId)

useSeoMeta({
  title: () => character.value?.name ?? 'Character Sheet',
  description: () => `View ${character.value?.name ?? 'character'} - D&D 5e Character Sheet`
})

// Tab items for bottom section
const tabItems = computed(() => {
  const items = [
    { label: 'Features', slot: 'features', icon: 'i-heroicons-star' },
    { label: 'Proficiencies', slot: 'proficiencies', icon: 'i-heroicons-academic-cap' },
    { label: 'Equipment', slot: 'equipment', icon: 'i-heroicons-briefcase' },
    { label: 'Languages', slot: 'languages', icon: 'i-heroicons-language' }
  ]
  // Only show Spells tab for casters
  if (stats.value?.spellcasting) {
    items.splice(3, 0, { label: 'Spells', slot: 'spells', icon: 'i-heroicons-sparkles' })
  }
  return items
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Back Link -->
    <UButton
      to="/characters"
      variant="ghost"
      icon="i-heroicons-arrow-left"
      class="mb-6"
    >
      Back to Characters
    </UButton>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <USkeleton class="h-20 w-full" />
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <USkeleton class="h-80" />
        <div class="space-y-4">
          <USkeleton class="h-32" />
          <USkeleton class="h-48" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to load character"
      :description="error.message"
    />

    <!-- Character Sheet -->
    <div
      v-else-if="character && stats"
      class="space-y-6"
    >
      <!-- Header -->
      <CharacterSheetHeader :character="character" />

      <!-- Main Grid: Abilities sidebar + Stats/Skills -->
      <div class="grid lg:grid-cols-[200px_1fr] gap-6">
        <!-- Left Sidebar: Ability Scores -->
        <CharacterSheetAbilityScoreBlock :stats="stats" />

        <!-- Right: Combat Stats + Saves/Skills -->
        <div class="space-y-6">
          <!-- Combat Stats Grid -->
          <CharacterSheetCombatStatsGrid
            :character="character"
            :stats="stats"
          />

          <!-- Saving Throws and Skills -->
          <div class="grid md:grid-cols-2 gap-6">
            <CharacterSheetSavingThrowsList :saving-throws="savingThrows" />
            <CharacterSheetSkillsList :skills="skills" />
          </div>
        </div>
      </div>

      <!-- Bottom Tabs -->
      <UTabs
        :items="tabItems"
        class="mt-8"
      >
        <template #features>
          <CharacterSheetFeaturesPanel :features="features" />
        </template>

        <template #proficiencies>
          <CharacterSheetProficienciesPanel :proficiencies="proficiencies" />
        </template>

        <template #equipment>
          <CharacterSheetEquipmentPanel :equipment="equipment" />
        </template>

        <template #spells>
          <CharacterSheetSpellsPanel
            v-if="stats.spellcasting"
            :spells="spells"
            :stats="stats"
          />
        </template>

        <template #languages>
          <CharacterSheetLanguagesPanel :languages="languages" />
        </template>
      </UTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'D&D 5e Compendium',
  meta: [
    {
      name: 'description',
      content: 'Search and browse D&D 5th Edition spells, items, monsters, races, classes, backgrounds, and feats'
    }
  ]
})

const { getImagePath } = useEntityImage()

// Import EntityType for proper typing
import type { EntityType } from '~/composables/useEntityImage'

// Entity cards with random slugs for background images
const entityCards: Array<{ to: string, name: string, description: string, slug: string, type: EntityType }> = [
  {
    to: '/spells',
    name: 'Spells',
    description: 'Browse hundreds of magical spells from cantrips to 9th level.',
    slug: 'fireball', // Could be randomized from popular spells
    type: 'spells'
  },
  {
    to: '/items',
    name: 'Items',
    description: 'Discover weapons, armor, and magical items for your adventures.',
    slug: 'longsword',
    type: 'items'
  },
  {
    to: '/monsters',
    name: 'Monsters',
    description: 'Encounter creatures from tiny beasts to legendary dragons.',
    slug: 'ancient-red-dragon',
    type: 'monsters'
  },
  {
    to: '/races',
    name: 'Races',
    description: 'Explore playable races from elves and dwarves to dragonborn.',
    slug: 'elf',
    type: 'races'
  },
  {
    to: '/classes',
    name: 'Classes',
    description: 'Choose your path from wizards and warriors to rogues and clerics.',
    slug: 'wizard',
    type: 'classes'
  },
  {
    to: '/backgrounds',
    name: 'Backgrounds',
    description: 'Define your character\'s history and starting proficiencies.',
    slug: 'sage',
    type: 'backgrounds'
  },
  {
    to: '/feats',
    name: 'Feats',
    description: 'Gain special abilities and enhance your character\'s capabilities.',
    slug: 'war-caster',
    type: 'feats'
  }
]

// Reference items from app.vue
const referenceItems = [
  { label: 'Ability Scores', to: '/ability-scores', icon: 'i-heroicons-chart-bar' },
  { label: 'Conditions', to: '/conditions', icon: 'i-heroicons-exclamation-triangle' },
  { label: 'Creature Sizes', to: '/sizes', icon: 'i-heroicons-arrows-pointing-out' },
  { label: 'Damage Types', to: '/damage-types', icon: 'i-heroicons-bolt' },
  { label: 'Item Types', to: '/item-types', icon: 'i-heroicons-cube' },
  { label: 'Languages', to: '/languages', icon: 'i-heroicons-language' },
  { label: 'Proficiency Types', to: '/proficiency-types', icon: 'i-heroicons-check-badge' },
  { label: 'Skills', to: '/skills', icon: 'i-heroicons-star' },
  { label: 'Source Books', to: '/sources', icon: 'i-heroicons-book-open' },
  { label: 'Spell Schools', to: '/spell-schools', icon: 'i-heroicons-academic-cap' }
]
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-6xl">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        D&D 5e Compendium
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Search and browse thousands of spells, items, monsters, and more from D&D 5th Edition
      </p>

      <!-- Featured Search - Wider -->
      <div class="max-w-4xl mx-auto">
        <SearchInput />
      </div>
    </div>

    <!-- Entity Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
      <NuxtLink
        v-for="entity in entityCards"
        :key="entity.to"
        :to="entity.to"
        class="block group"
      >
        <UCard class="relative overflow-hidden hover:shadow-lg transition-all h-full border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400">
          <!-- Background Image (only for entities with images) -->
          <div
            v-if="getImagePath(entity.type, entity.slug, 256)"
            class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-25 group-hover:scale-110"
            :style="{ backgroundImage: `url(${getImagePath(entity.type, entity.slug, 256)})` }"
          />

          <!-- Content -->
          <div class="relative z-10">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {{ entity.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ entity.description }}
            </p>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <!-- Reference Data Section -->
    <div class="mt-16">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Reference Data
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <NuxtLink
          v-for="item in referenceItems"
          :key="item.to"
          :to="item.to"
          class="block group"
        >
          <UCard class="hover:shadow-md transition-shadow h-full border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400">
            <div class="flex flex-col items-center text-center gap-2">
              <UIcon
                :name="item.icon"
                class="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              />
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ item.label }}
              </h4>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="mt-16 text-center">
      <p class="text-gray-600 dark:text-gray-400">
        Powered by D&D 5e API • Over 3,000 entities indexed
      </p>
    </div>
  </div>
</template>

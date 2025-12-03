<script setup lang="ts">
/**
 * AppNavbar - Main navigation component
 *
 * Features:
 * - Hierarchical dropdown navigation (Compendium, Tools, Reference)
 * - Responsive design (desktop dropdown, mobile accordion)
 * - Active state highlighting (white text on gray background)
 * - Centered layout with absolutely positioned logo
 * - Dark mode only (rose-themed gradient background)
 */

// Get current route for active link highlighting
const route = useRoute()

// Compendium dropdown items (main game entities)
const compendiumItems = ref([
  { label: 'Spells', to: '/spells', icon: 'i-heroicons-sparkles' },
  { label: 'Items', to: '/items', icon: 'i-heroicons-cube' },
  { label: 'Monsters', to: '/monsters', icon: 'i-heroicons-fire' },
  { label: 'Races', to: '/races', icon: 'i-heroicons-users' },
  { label: 'Classes', to: '/classes', icon: 'i-heroicons-academic-cap' },
  { label: 'Backgrounds', to: '/backgrounds', icon: 'i-heroicons-book-open' },
  { label: 'Feats', to: '/feats', icon: 'i-heroicons-star' }
])

// Check if current route is in compendium section
const isCompendiumActive = computed(() => {
  return compendiumItems.value.some(item => route.path.startsWith(item.to))
})

// Tools dropdown items (utility tools and generators)
const toolsItems = ref([
  { label: 'Character Builder', to: '/characters', icon: 'i-heroicons-user-plus' },
  { label: 'Spell List Creator', to: '/tools/spell-list', icon: 'i-heroicons-sparkles' }
])

// Check if current route is in tools section
const isToolsActive = computed(() => {
  return toolsItems.value.some(item => route.path.startsWith(item.to))
})

// Reference dropdown items (metadata/reference endpoints)
const referenceItems = ref([
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
])

// Check if current route is in reference section
const isReferenceActive = computed(() => {
  return referenceItems.value.some(item => route.path.startsWith(item.to))
})

// Mobile menu state
const isCompendiumExpanded = ref(false)
const isToolsExpanded = ref(false)
const isReferenceExpanded = ref(false)
</script>

<template>
  <!-- Navigation Bar -->
  <nav class="border-b border-rose-300/50 dark:border-rose-700/50 bg-gradient-to-r from-rose-50 via-rose-100 to-rose-50 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-center items-center h-16">
        <!-- Site Logo (Left) -->
        <div class="flex-shrink-0 absolute left-4 sm:left-6 lg:left-8">
          <NuxtLink
            to="/"
            class="flex items-center hover:opacity-80 transition-opacity"
          >
            <NuxtImg
              src="/logo.svg"
              alt="D&D 5e Compendium"
              class="h-10 w-auto dark:invert"
            />
          </NuxtLink>
        </div>

        <!-- Navigation Links (Center) - Desktop -->
        <div class="hidden md:flex items-center space-x-1">
          <!-- Compendium dropdown -->
          <UDropdownMenu :items="compendiumItems">
            <UButton
              color="neutral"
              variant="ghost"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              :class="isCompendiumActive
                ? 'bg-gray-100 dark:bg-gray-800 text-white'
                : 'text-gray-700 dark:text-gray-300'"
            >
              Compendium
            </UButton>
          </UDropdownMenu>
          <!-- Tools dropdown -->
          <UDropdownMenu :items="toolsItems">
            <UButton
              color="neutral"
              variant="ghost"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              :class="isToolsActive
                ? 'bg-gray-100 dark:bg-gray-800 text-white'
                : 'text-gray-700 dark:text-gray-300'"
            >
              Tools
            </UButton>
          </UDropdownMenu>
          <!-- Reference dropdown -->
          <UDropdownMenu :items="referenceItems">
            <UButton
              color="neutral"
              variant="ghost"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              :class="isReferenceActive
                ? 'bg-gray-100 dark:bg-gray-800 text-white'
                : 'text-gray-700 dark:text-gray-300'"
            >
              Reference
            </UButton>
          </UDropdownMenu>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div class="md:hidden pb-3 space-y-1">
        <!-- Compendium expandable section -->
        <div>
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="isCompendiumActive
              ? 'bg-gray-100 dark:bg-gray-800 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            @click="isCompendiumExpanded = !isCompendiumExpanded"
          >
            <span>Compendium</span>
            <UIcon
              :name="isCompendiumExpanded ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
              class="w-5 h-5"
            />
          </button>

          <!-- Compendium submenu -->
          <div
            v-show="isCompendiumExpanded"
            class="pl-4 space-y-1 mt-1"
          >
            <NuxtLink
              v-for="item in compendiumItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="route.path.startsWith(item.to)
                ? 'bg-gray-100 dark:bg-gray-800 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="w-4 h-4"
              />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Tools expandable section -->
        <div>
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="isToolsActive
              ? 'bg-gray-100 dark:bg-gray-800 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            @click="isToolsExpanded = !isToolsExpanded"
          >
            <span>Tools</span>
            <UIcon
              :name="isToolsExpanded ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
              class="w-5 h-5"
            />
          </button>

          <!-- Tools submenu -->
          <div
            v-show="isToolsExpanded"
            class="pl-4 space-y-1 mt-1"
          >
            <NuxtLink
              v-for="item in toolsItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="route.path.startsWith(item.to)
                ? 'bg-gray-100 dark:bg-gray-800 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="w-4 h-4"
              />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Reference expandable section -->
        <div>
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="isReferenceActive
              ? 'bg-gray-100 dark:bg-gray-800 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            @click="isReferenceExpanded = !isReferenceExpanded"
          >
            <span>Reference</span>
            <UIcon
              :name="isReferenceExpanded ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
              class="w-5 h-5"
            />
          </button>

          <!-- Reference submenu -->
          <div
            v-show="isReferenceExpanded"
            class="pl-4 space-y-1 mt-1"
          >
            <NuxtLink
              v-for="item in referenceItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="route.path.startsWith(item.to)
                ? 'bg-gray-100 dark:bg-gray-800 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="w-4 h-4"
              />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// SEO metadata
const title = 'D&D 5e Compendium'
const description = 'Search and browse thousands of D&D 5th Edition spells, items, races, classes, backgrounds, and feats'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

// Get current route for active link highlighting
const route = useRoute()

// Dark mode
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Main navigation items (top-level entities)
const navItems = [
  { label: 'Spells', to: '/spells', color: 'arcane' }, // spell → arcane (purple)
  { label: 'Items', to: '/items', color: 'treasure' }, // item → treasure (gold)
  { label: 'Monsters', to: '/monsters', color: 'danger' }, // monster → danger (orange)
  { label: 'Races', to: '/races', color: 'emerald' }, // race → emerald (green)
  { label: 'Classes', to: '/classes', color: 'red' }, // class → red
  { label: 'Backgrounds', to: '/backgrounds', color: 'lore' }, // background → lore (brown)
  { label: 'Feats', to: '/feats', color: 'glory' } // feat → glory (blue)
]

// Tools dropdown items (utility tools and generators)
const toolsItems = ref([
  { label: 'Spell List Creator', to: '/spells/list-generator', icon: 'i-heroicons-sparkles' }
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
const isToolsExpanded = ref(false)
const isReferenceExpanded = ref(false)
</script>

<template>
  <UApp>
    <!-- Layer 0: Animated gradient background (fixed, covers viewport only) -->
    <div
      class="fixed inset-0 animated-gradient"
      style="z-index: 0; height: 100vh; overflow: hidden;"
    />

    <!-- Layer 1: Animated canvas (positioned absolutely to prevent scroll issues) -->
    <ClientOnly>
      <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1; pointer-events: none;">
        <AnimatedBackground />
      </div>
    </ClientOnly>

    <!-- Layer 10: Main content -->
    <div
      class="text-gray-900 dark:text-gray-100 relative"
      style="z-index: 10;"
    >
      <!-- Main content (above animated background) -->

      <!-- Navigation Bar -->
      <nav class="border-b border-rose-300/50 dark:border-rose-700/50 bg-gradient-to-r from-rose-50 via-rose-100 to-rose-50 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Site Logo (Left) -->
            <div class="flex-shrink-0">
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
              <!-- Main navigation items -->
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="route.path.startsWith(item.to)
                  ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
              >
                {{ item.label }}
              </NuxtLink>
              <!-- Tools dropdown -->
              <UDropdownMenu :items="toolsItems">
                <UButton
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-heroicons-chevron-down-20-solid"
                  :class="isToolsActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
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
                    ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'"
                >
                  Reference
                </UButton>
              </UDropdownMenu>
            </div>

            <!-- Dark Mode Toggle (Right) -->
            <div class="flex items-center space-x-4">
              <UButton
                :icon="colorMode.value === 'dark' ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                color="neutral"
                variant="ghost"
                aria-label="Toggle dark mode"
                @click="toggleColorMode"
              />
            </div>
          </div>

          <!-- Mobile Navigation -->
          <div class="md:hidden pb-3 space-y-1">
            <!-- Main navigation items -->
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
              :class="route.path.startsWith(item.to)
                ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              {{ item.label }}
            </NuxtLink>

            <!-- Tools expandable section -->
            <div>
              <button
                class="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors"
                :class="isToolsActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
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
                    ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
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
                  ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
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
                    ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
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

      <!-- Main Content -->
      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>
    </div>
  </UApp>
</template>

<style>
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient {
  background: linear-gradient(
    -45deg,
    #faf5ff,  /* purple-50 */
    #faf5ff,  /* purple-50 */
    #eef2ff,  /* indigo-50 */
    #ede9fe,  /* violet-50 */
    #faf5ff   /* purple-50 */
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}

.dark .animated-gradient {
  background: linear-gradient(
    -45deg,
    #0a0a0c,  /* Very dark warm neutral */
    #1a1a1f,  /* Dark warm gray */
    #1c1928,  /* Dark with subtle purple */
    #15141a,  /* Dark warm with hint of purple */
    #0a0a0c   /* Very dark warm neutral */
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}

/* Make all content semi-transparent to show animation through */
/* Use global selectors without :deep() for better specificity */
</style>

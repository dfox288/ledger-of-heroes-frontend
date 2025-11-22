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
  { label: 'Spells', to: '/spells' },
  { label: 'Items', to: '/items' },
  { label: 'Monsters', to: '/monsters' },
  { label: 'Races', to: '/races' },
  { label: 'Classes', to: '/classes' },
  { label: 'Backgrounds', to: '/backgrounds' },
  { label: 'Feats', to: '/feats' }
]

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
const isReferenceExpanded = ref(false)
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <!-- Navigation Bar -->
      <nav class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Site Title (Left) -->
            <div class="flex-shrink-0">
              <NuxtLink
                to="/"
                class="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                D&D 5e Compendium
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

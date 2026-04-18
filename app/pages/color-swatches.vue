<script setup lang="ts">
// Dev-only page — return 404 in production builds
if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}

definePageMeta({
  layout: false
})

useHead({
  title: 'Custom Color Swatches'
})

const customColors = [
  { name: 'arcane', label: 'Arcane (Spells - Purple)' },
  { name: 'treasure', label: 'Treasure (Items - Gold)' },
  { name: 'danger', label: 'Danger (Monsters - Orange)' },
  { name: 'lore', label: 'Lore (Backgrounds - Brown)' },
  { name: 'glory', label: 'Glory (Feats - Blue)' }
]

const _shades = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 300, label: '300' },
  { value: 400, label: '400' },
  { value: 500, label: '500' },
  { value: 600, label: '600' },
  { value: 700, label: '700' },
  { value: 800, label: '800' },
  { value: 900, label: '900' },
  { value: 950, label: '950' }
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Custom Color Swatches - All Variations
      </h1>

      <div class="space-y-12">
        <div
          v-for="color in customColors"
          :key="color.name"
          class="space-y-4"
        >
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {{ color.label }}
          </h2>

          <div class="grid grid-cols-11 gap-2">
            <!-- Arcane -->
            <template v-if="color.name === 'arcane'">
              <div class="space-y-1">
                <div class="bg-arcane-50 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  50
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-100 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  100
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-200 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  200
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-300 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  300
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-400 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  400
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-500 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  500
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-600 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  600
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-700 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  700
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-800 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  800
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-900 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  900
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-arcane-950 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  950
                </div>
              </div>
            </template>

            <!-- Treasure -->
            <template v-if="color.name === 'treasure'">
              <div class="space-y-1">
                <div class="bg-treasure-50 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  50
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-100 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  100
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-200 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  200
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-300 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  300
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-400 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  400
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-500 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  500
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-600 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  600
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-700 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  700
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-800 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  800
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-900 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  900
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-treasure-950 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  950
                </div>
              </div>
            </template>

            <!-- Danger -->
            <template v-if="color.name === 'danger'">
              <div class="space-y-1">
                <div class="bg-danger-50 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  50
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-100 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  100
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-200 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  200
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-300 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  300
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-400 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  400
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-500 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  500
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-600 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  600
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-700 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  700
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-800 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  800
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-900 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  900
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-danger-950 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  950
                </div>
              </div>
            </template>

            <!-- Lore -->
            <template v-if="color.name === 'lore'">
              <div class="space-y-1">
                <div class="bg-lore-50 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  50
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-100 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  100
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-200 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  200
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-300 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  300
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-400 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  400
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-500 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  500
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-600 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  600
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-700 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  700
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-800 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  800
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-900 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  900
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-lore-950 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  950
                </div>
              </div>
            </template>

            <!-- Glory -->
            <template v-if="color.name === 'glory'">
              <div class="space-y-1">
                <div class="bg-glory-50 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  50
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-100 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  100
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-200 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  200
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-300 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  300
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-400 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  400
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-500 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  500
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-600 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  600
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-700 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  700
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-800 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  800
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-900 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  900
                </div>
              </div>
              <div class="space-y-1">
                <div class="bg-glory-950 h-20 rounded border border-gray-300 dark:border-gray-600" />
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">
                  950
                </div>
              </div>
            </template>
          </div>

          <!-- Code example -->
          <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs text-gray-800 dark:text-gray-200">
            <div class="mb-1 font-semibold">
              Light mode: bg-{{ color.name }}-100
            </div>
            <div>Dark mode: bg-{{ color.name }}-900</div>
          </div>
        </div>
      </div>

      <div class="mt-12 pb-8">
        <NuxtLink
          to="/"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'NuxtUI Color System Test',
  meta: [
    { name: 'description', content: 'Complete test of NuxtUI v4 color configuration' }
  ]
})

const colorMode = useColorMode()

// Get configuration dynamically
const appConfig = useAppConfig()
const themeColors = ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
const customColors = ['dndtest'] // Colors defined in @theme
const tailwindColors = ['emerald', 'stone', 'amber', 'blue', 'red', 'orange']
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-7xl">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <UiBackLink to="/" label="Back to Home" />
      </div>
      <UButton
        :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
        color="primary"
        variant="ghost"
        @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
      >
        {{ colorMode.value === 'dark' ? 'Light' : 'Dark' }} Mode
      </UButton>
    </div>

    <h1 class="text-4xl font-bold mb-4">🎨 NuxtUI v4 Color System Test</h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-12">
      Complete overview of the three-step color configuration process
    </p>

    <!-- Configuration Overview -->
    <section class="mb-16 p-6 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 rounded-lg">
      <h2 class="text-2xl font-bold mb-6 text-amber-900 dark:text-amber-100">
        📋 Current Configuration
      </h2>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Step 1 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded border border-amber-200 dark:border-amber-800">
          <h3 class="font-bold mb-2 text-amber-900 dark:text-amber-100">
            1️⃣ nuxt.config.ts
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Semantic color names:
          </p>
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="color in themeColors" :key="color" size="xs" variant="subtle">
              {{ color }}
            </UBadge>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded border border-amber-200 dark:border-amber-800">
          <h3 class="font-bold mb-2 text-amber-900 dark:text-amber-100">
            2️⃣ main.css @theme
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Custom color palettes:
          </p>
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="color in customColors" :key="color" size="xs" color="primary">
              {{ color }}
            </UBadge>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded border border-amber-200 dark:border-amber-800">
          <h3 class="font-bold mb-2 text-amber-900 dark:text-amber-100">
            3️⃣ app/app.config.ts
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Color mappings:
          </p>
          <div class="space-y-1 text-xs font-mono">
            <div v-for="(value, key) in appConfig.ui.colors" :key="key">
              <span class="text-gray-500">{{ key }}:</span>
              <span class="text-emerald-600 dark:text-emerald-400">"{{ value }}"</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Semantic Colors (Step 1 registered colors) -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-6">
        1️⃣ Semantic Colors (nuxt.config.ts)
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Colors registered in <code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">ui.theme.colors</code>
      </p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="color in themeColors" :key="color" class="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 capitalize">
            {{ color }}
          </h3>

          <div class="space-y-3">
            <UButton :color="color" block>
              Solid Button
            </UButton>
            <UButton :color="color" variant="outline" block>
              Outline Button
            </UButton>
            <UButton :color="color" variant="ghost" block>
              Ghost Button
            </UButton>
            <div class="flex gap-2">
              <UBadge :color="color">
                Badge
              </UBadge>
              <UBadge :color="color" variant="subtle">
                Subtle
              </UBadge>
            </div>
          </div>

          <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono">
            <div class="text-gray-500">Mapped to:</div>
            <div class="text-emerald-600 dark:text-emerald-400">
              {{ appConfig.ui.colors[color] || 'not mapped' }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Custom @theme Colors -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-6">
        2️⃣ Custom Colors (@theme in main.css)
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Custom color palettes defined with 11 intensity levels (50-950)
      </p>

      <div class="grid gap-6">
        <div v-for="colorName in customColors" :key="colorName" class="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 capitalize">
            {{ colorName }}
          </h3>

          <!-- Intensity gradient display -->
          <div class="mb-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              11 Intensity Levels:
            </p>
            <div class="grid grid-cols-11 gap-1">
              <div
                v-for="intensity in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]"
                :key="intensity"
                :class="`bg-${colorName}-${intensity}`"
                class="h-12 rounded flex items-center justify-center text-xs font-mono"
                :title="`${colorName}-${intensity}`"
              >
                <span :class="intensity >= 500 ? 'text-white' : 'text-gray-900'">
                  {{ intensity }}
                </span>
              </div>
            </div>
          </div>

          <!-- Usage with Tailwind classes -->
          <div class="space-y-2">
            <div :class="`bg-${colorName}-100 dark:bg-${colorName}-900 p-3 rounded`">
              <code class="text-sm">bg-{{ colorName }}-100 dark:bg-{{ colorName }}-900</code>
            </div>
            <div :class="`text-${colorName}-600 dark:text-${colorName}-400 font-semibold`">
              <code class="text-sm">text-{{ colorName }}-600 dark:text-{{ colorName }}-400</code>
            </div>
            <div :class="`border-2 border-${colorName}-500 p-3 rounded`">
              <code class="text-sm">border-{{ colorName }}-500</code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tailwind Default Colors -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-6">
        3️⃣ Tailwind Default Colors
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Built-in Tailwind colors that can be used directly (no @theme needed)
      </p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="colorName in tailwindColors" :key="colorName" class="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 class="font-semibold mb-2 capitalize">
            {{ colorName }}
          </h4>
          <div class="grid grid-cols-6 gap-1">
            <div
              v-for="intensity in [100, 200, 300, 500, 700, 900]"
              :key="intensity"
              :class="`bg-${colorName}-${intensity}`"
              class="h-8 rounded"
              :title="`${colorName}-${intensity}`"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Usage Example -->
    <section class="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">
        💡 Quick Reference
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold mb-2">In Components:</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>&lt;UButton color="primary"&gt;Button&lt;/UButton&gt;
&lt;UBadge color="secondary"&gt;Badge&lt;/UBadge&gt;</code></pre>
        </div>

        <div>
          <h3 class="font-semibold mb-2">With Tailwind Classes:</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>&lt;div class="bg-dndtest-500"&gt;Custom&lt;/div&gt;
&lt;div class="text-emerald-600"&gt;Tailwind&lt;/div&gt;</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

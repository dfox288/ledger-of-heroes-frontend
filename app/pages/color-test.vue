<script setup lang="ts">
useHead({
  title: 'D&D Entity Color System Preview',
  meta: [
    { name: 'description', content: 'Preview of proposed entity-specific color scheme' }
  ]
})

const colorMode = useColorMode()

// Define color palette type
type ColorIntensity = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
type ColorPalette = Record<ColorIntensity, string>
type ColorName = 'arcane' | 'treasure' | 'danger' | 'lore' | 'glory' | 'emerald' | 'red' |
  'indigo' | 'rose' | 'slate' | 'teal' | 'cyan' | 'lime' | 'zinc' | 'yellow' | 'fuchsia' | 'neutral'

// Proposed entity color mappings
const mainEntities: Array<{ name: string; alias: string; color: ColorName; colorName: string; description: string }> = [
  { name: 'Spells', alias: 'spell', color: 'arcane', colorName: 'Arcane Purple', description: 'Mystical energy, magic' },
  { name: 'Items', alias: 'item', color: 'treasure', colorName: 'Treasure Gold', description: 'Valuable treasures' },
  { name: 'Races', alias: 'race', color: 'emerald', colorName: 'Emerald (Tailwind)', description: 'Natural diversity' },
  { name: 'Classes', alias: 'class', color: 'red', colorName: 'Red (Tailwind)', description: 'Heroic martial' },
  { name: 'Backgrounds', alias: 'background', color: 'lore', colorName: 'Lore Brown', description: 'History, origins' },
  { name: 'Feats', alias: 'feat', color: 'glory', colorName: 'Glory Blue', description: 'Achievement' },
  { name: 'Monsters', alias: 'monster', color: 'danger', colorName: 'Danger Orange', description: 'Combat, threat' }
]

const referenceEntities: Array<{ name: string; alias: string; color: ColorName; colorName: string; description: string }> = [
  { name: 'Ability Scores', alias: 'ability', color: 'indigo', colorName: 'Indigo (Tailwind)', description: 'Core stats' },
  { name: 'Conditions', alias: 'condition', color: 'rose', colorName: 'Rose (Tailwind)', description: 'Status effects' },
  { name: 'Damage Types', alias: 'damage', color: 'slate', colorName: 'Slate (Tailwind)', description: 'Mechanical data' },
  { name: 'Item Types', alias: 'itemtype', color: 'teal', colorName: 'Teal (Tailwind)', description: 'Categorization' },
  { name: 'Languages', alias: 'language', color: 'cyan', colorName: 'Cyan (Tailwind)', description: 'Communication' },
  { name: 'Proficiency Types', alias: 'proficiency', color: 'lime', colorName: 'Lime (Tailwind)', description: 'Training' },
  { name: 'Sizes', alias: 'size', color: 'zinc', colorName: 'Zinc (Tailwind)', description: 'Physical properties' },
  { name: 'Skills', alias: 'skill', color: 'yellow', colorName: 'Yellow (Tailwind)', description: 'Expertise' },
  { name: 'Spell Schools', alias: 'school', color: 'fuchsia', colorName: 'Fuchsia (Tailwind)', description: 'Arcane types' },
  { name: 'Sources', alias: 'source', color: 'neutral', colorName: 'Neutral (Tailwind)', description: 'Books, refs' }
]

// Define color palettes with actual hex values for preview
// Note: Tailwind uses 50, 100-900 (by 100s), 950 = 11 total levels
const colorPalettes: Record<ColorName, ColorPalette> = {
  arcane: {
    50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
    500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
  },
  treasure: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
    500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
  },
  danger: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
    500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407'
  },
  lore: {
    50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
    500: '#ca8a04', 600: '#a16207', 700: '#854d0e', 800: '#713f12', 900: '#422006', 950: '#1c0a00'
  },
  glory: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
    500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49'
  },
  // Tailwind defaults (for reference entities) - using actual Tailwind values
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
    500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
    500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a'
  },
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
    500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
    500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
  },
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
  },
  teal: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
    500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e'
  },
  cyan: {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
    500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'
  },
  lime: {
    50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
    500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05'
  },
  zinc: {
    50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
    500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b'
  },
  yellow: {
    50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
    500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006'
  },
  fuchsia: {
    50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9',
    500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e'
  },
  neutral: {
    50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3',
    500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a'
  }
}

// List of custom D&D themed palettes (non-Tailwind defaults)
const customPalettes = [
  { name: 'Arcane' },
  { name: 'Treasure' },
  { name: 'Danger' },
  { name: 'Lore' },
  { name: 'Glory' }
]
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

    <h1 class="text-4xl font-bold mb-4">🎨 D&D Entity Color System Preview</h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-12">
      Proposed color scheme for all 17 entity types - visual preview for design approval
    </p>

    <!-- Overview -->
    <section class="mb-12 p-6 border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950 rounded-lg">
      <h2 class="text-2xl font-bold mb-4 text-violet-900 dark:text-violet-100">
        📋 Proposal Overview
      </h2>
      <div class="grid md:grid-cols-2 gap-6 text-sm">
        <div>
          <h3 class="font-semibold mb-2">Approach 1: Thematic D&D Color Mapping</h3>
          <ul class="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• 5 custom palettes for D&D theming</li>
            <li>• 12 Tailwind defaults where they fit</li>
            <li>• All 17 entity types get unique colors</li>
            <li>• Visual distinction + thematic resonance</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Custom Palettes Needed:</h3>
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="palette in customPalettes" :key="palette.name" size="xs" variant="subtle">
              {{ palette.name }}
            </UBadge>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Each with 11 intensity levels (50-950)
          </p>
        </div>
      </div>
    </section>

    <!-- Main Entity Colors -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-6">
        Main Entity Types (7)
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Primary content types with custom D&D-themed colors
      </p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="entity in mainEntities" :key="entity.alias" class="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div class="mb-4">
            <h3 class="text-lg font-bold mb-1">
              {{ entity.name }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {{ entity.description }}
            </p>
            <div class="flex items-center gap-2 text-xs">
              <span class="font-mono text-gray-600 dark:text-gray-400">{{ entity.alias }}</span>
              <span class="text-gray-400">→</span>
              <span class="font-semibold" :class="`text-${entity.color}-600`">{{ entity.colorName }}</span>
            </div>
          </div>

          <!-- Color gradient preview -->
          <div class="mb-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Intensity Range:</p>
            <div class="grid grid-cols-11 gap-0.5">
              <div
                v-for="intensity in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]"
                :key="intensity"
                :style="{ backgroundColor: colorPalettes[entity.color]?.[intensity] || '#ccc' }"
                class="h-6 first:rounded-l last:rounded-r"
                :title="`${entity.color}-${intensity}: ${colorPalettes[entity.color]?.[intensity]}`"
              />
            </div>
          </div>

          <!-- Component previews -->
          <div class="space-y-2">
            <div
              :style="{ backgroundColor: colorPalettes[entity.color]?.[500], color: '#fff' }"
              class="px-3 py-2 rounded text-sm text-center font-medium"
            >
              {{ entity.name }} Card
            </div>
            <div
              :style="{
                borderColor: colorPalettes[entity.color]?.[500],
                color: colorPalettes[entity.color]?.[700]
              }"
              class="border-2 px-3 py-2 rounded text-sm text-center"
            >
              Outline Style
            </div>
            <div class="flex gap-2 justify-center">
              <span
                :style="{
                  backgroundColor: colorPalettes[entity.color]?.[100],
                  color: colorPalettes[entity.color]?.[700]
                }"
                class="px-2 py-1 rounded text-xs"
              >
                Badge
              </span>
              <span
                :style="{ backgroundColor: colorPalettes[entity.color]?.[500], color: '#fff' }"
                class="px-2 py-1 rounded text-xs"
              >
                Solid
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reference Entity Colors -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-6">
        Reference Entity Types (10)
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Supporting data types using Tailwind default colors
      </p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div v-for="entity in referenceEntities" :key="entity.alias" class="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div class="mb-3">
            <h4 class="text-sm font-bold mb-1">
              {{ entity.name }}
            </h4>
            <p class="text-xs text-gray-400 mb-2">
              {{ entity.description }}
            </p>
            <div class="text-xs font-mono text-gray-500">
              {{ entity.alias }} → {{ entity.color }}
            </div>
          </div>

          <!-- Mini gradient -->
          <div class="grid grid-cols-6 gap-0.5 mb-3">
            <div
              v-for="intensity in [100, 200, 300, 500, 700, 900]"
              :key="intensity"
              :style="{ backgroundColor: colorPalettes[entity.color]?.[intensity] || '#ccc' }"
              class="h-4 first:rounded-l last:rounded-r"
            />
          </div>

          <!-- Sample badge -->
          <div class="text-center">
            <span
              :style="{
                backgroundColor: colorPalettes[entity.color]?.[100],
                color: colorPalettes[entity.color]?.[700]
              }"
              class="px-2 py-1 rounded text-xs"
            >
              Sample
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Summary -->
    <section class="border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4 text-emerald-900 dark:text-emerald-100">
        ✅ Next Steps
      </h2>

      <div class="space-y-4 text-sm">
        <div>
          <h3 class="font-semibold mb-2">To Implement This Design:</h3>
          <ol class="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Define 5 custom color palettes in <code class="px-1 bg-gray-100 dark:bg-gray-800 rounded">main.css</code> @theme block</li>
            <li>Register all 17 entity aliases in <code class="px-1 bg-gray-100 dark:bg-gray-800 rounded">nuxt.config.ts</code></li>
            <li>Map entity aliases to colors in <code class="px-1 bg-gray-100 dark:bg-gray-800 rounded">app/app.config.ts</code></li>
            <li>Test with this page and verify all gradients render correctly</li>
          </ol>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Custom Palettes Needed:</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li><strong>arcane:</strong> Deep mystical purple (#8b5cf6 base)</li>
            <li><strong>treasure:</strong> Rich golden bronze (#d97706 base)</li>
            <li><strong>danger:</strong> Vibrant combat orange (#f97316 base)</li>
            <li><strong>lore:</strong> Warm scholarly brown (#92400e base)</li>
            <li><strong>glory:</strong> Brilliant achievement blue (#0ea5e9 base)</li>
          </ul>
        </div>

        <div class="p-4 bg-white dark:bg-gray-900 rounded border border-emerald-200 dark:border-emerald-800">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Usage Example:</p>
          <pre class="text-xs overflow-x-auto"><code>&lt;UBadge color="spell"&gt;Fireball&lt;/UBadge&gt;
&lt;div class="bg-item-500 text-white"&gt;+1 Longsword&lt;/div&gt;</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

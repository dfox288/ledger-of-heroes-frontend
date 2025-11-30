<script setup lang="ts">
// Local type definitions to work around incorrect backend OpenAPI schema (Issue #80)
// The generated types have `rows: string` but API actually returns an array of objects
interface ProgressionColumn {
  key: string
  label: string
  type: string // Can be 'integer', 'bonus', 'string', 'dice', etc.
}

// Row is a dynamic object with known fields + arbitrary dynamic columns
type ProgressionRow = Record<string, string | number>

interface ProgressionTable {
  columns: ProgressionColumn[]
  rows: ProgressionRow[]
}

interface Props {
  progressionTable: ProgressionTable
}

defineProps<Props>()

// Use centralized feature filtering composable
const { filterProgressionFeatureString } = useFeatureFiltering()

// ASI (Ability Score Improvement) levels
const ASI_LEVELS = [4, 8, 12, 16, 19]

// Subclass keywords to detect subclass feature levels
const SUBCLASS_KEYWORDS = [
  'Archetype',
  'Circle',
  'Path',
  'Tradition',
  'Domain',
  'Oath',
  'Pact',
  'College',
  'Conclave',
  'Origin'
]

/**
 * Check if a level should be highlighted as an ASI level
 */
const isASILevel = (level: number): boolean => {
  return ASI_LEVELS.includes(level)
}

/**
 * Check if a level contains subclass features
 */
const hasSubclassFeature = (featuresString: string): boolean => {
  if (!featuresString || featuresString === '—') return false
  return SUBCLASS_KEYWORDS.some(keyword =>
    featuresString.includes(keyword)
  )
}

/**
 * Filter progression table features to remove clutter.
 * Uses centralized filtering logic from composable.
 * Passes empty array since progression table doesn't have full feature data.
 */
const filterProgressionFeatures = (featuresString: string): string => {
  return filterProgressionFeatureString(featuresString, [])
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Class Progression
      </h3>
    </template>

    <!-- Desktop Table View (hidden on mobile) -->
    <div class="hidden sm:block overflow-x-auto">
      <table class="w-full text-sm">
        <caption class="sr-only">
          Class progression from level 1 to 20
        </caption>
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="col in progressionTable.columns"
              :key="col.key"
              scope="col"
              class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
              :class="{ 'text-center': col.key === 'level' || col.key === 'proficiency_bonus' || col.type === 'integer' || col.type === 'bonus' || col.type === 'dice' }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in progressionTable.rows"
            :key="row.level as number"
            class="border-t border-gray-200 dark:border-gray-700"
            :class="{
              'bg-gray-50/50 dark:bg-gray-800/50': index % 2 === 1,
              'bg-primary-50 dark:bg-primary-900/20': isASILevel(row.level as number),
              'bg-class-50 dark:bg-class-900/20': hasSubclassFeature(row.features as string)
            }"
          >
            <td
              v-for="col in progressionTable.columns"
              :key="col.key"
              class="px-3 py-2"
              :class="{
                'text-center font-medium text-gray-900 dark:text-gray-100': col.key === 'level',
                'text-center text-gray-700 dark:text-gray-300': col.key !== 'level' && col.key !== 'features',
                'text-gray-700 dark:text-gray-300': col.key === 'features'
              }"
            >
              <template v-if="col.key === 'features'">
                {{ filterProgressionFeatures(row[col.key] as string) }}
              </template>
              <template v-else>
                {{ row[col.key] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View (visible on mobile only) -->
    <div class="block sm:hidden space-y-3">
      <div
        v-for="row in progressionTable.rows"
        :key="row.level as number"
        data-test="level-card"
        class="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20': isASILevel(row.level as number),
          'bg-class-50 dark:bg-class-900/20': hasSubclassFeature(row.features as string),
          'bg-gray-50 dark:bg-gray-800': !isASILevel(row.level as number) && !hasSubclassFeature(row.features as string)
        }"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Level {{ row.level }}
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ row.proficiency_bonus }}
          </span>
        </div>
        <div class="text-sm text-gray-700 dark:text-gray-300">
          {{ filterProgressionFeatures(row.features as string) }}
        </div>
      </div>
    </div>
  </UCard>
</template>

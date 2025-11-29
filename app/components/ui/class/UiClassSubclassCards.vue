<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ClassFeatureResource = components['schemas']['ClassFeatureResource']

interface Source {
  id?: number
  code?: string
  name: string
  abbreviation?: string
  pages?: string | null
  page_number?: number
}

interface Subclass {
  id: number | string
  slug: string
  name: string
  description?: string
  features?: ClassFeatureResource[]
  sources?: Source[]
}

interface Props {
  subclasses: Subclass[]
  basePath: string
}

defineProps<Props>()

// Use centralized feature filtering composable
const { countDisplayFeatures } = useFeatureFiltering()

/**
 * Get background image path for subclass (uses class images)
 */
const { getImagePath } = useEntityImage()
const getBackgroundImage = (slug: string): string | null => {
  return getImagePath('classes', slug, 256)
}

/**
 * Get source abbreviation for display
 */
const getSourceAbbreviation = (subclass: Subclass): string | null => {
  if (!subclass.sources || subclass.sources.length === 0) return null
  const source = subclass.sources[0]
  return source?.abbreviation || null
}

/**
 * Get meaningful feature count (excludes choice options, multiclass, starting features)
 */
const getFeatureCount = (subclass: Subclass): number => {
  if (!subclass.features) return 0
  return countDisplayFeatures(subclass.features)
}

/**
 * Get feature count text
 */
const getFeatureCountText = (subclass: Subclass): string => {
  const count = getFeatureCount(subclass)
  return count === 1 ? '1 feature' : `${count} features`
}

/**
 * Get subclass entry level (first feature's level)
 */
const getEntryLevel = (subclass: Subclass): number | null => {
  if (!subclass.features?.length) return null
  return Math.min(...subclass.features.map(f => f.level))
}

/**
 * Get brief description preview.
 * For subclasses with placeholder descriptions, extracts from first feature.
 */
const getDescriptionPreview = (subclass: Subclass): string | null => {
  let desc = subclass.description || ''

  // If it's a placeholder "Subclass of X", try first feature
  if (desc.startsWith('Subclass of ')) {
    const firstFeature = subclass.features?.[0]
    if (firstFeature && 'description' in firstFeature) {
      desc = (firstFeature as { description?: string }).description || ''
    } else {
      return null
    }
  }

  if (!desc) return null

  // Remove "Source:" references and clean up
  const sourceIndex = desc.indexOf('\n\nSource:')
  if (sourceIndex > 0) {
    desc = desc.substring(0, sourceIndex)
  }

  // Take first sentence only (up to 120 chars)
  const firstSentence = desc.split('.')[0]
  if (firstSentence && firstSentence.length < 120) {
    return firstSentence + '.'
  }

  // Or truncate at 100 chars
  if (desc.length > 100) {
    return desc.substring(0, 97) + '...'
  }

  return desc
}

/**
 * Get source category for color coding
 */
const getSourceCategory = (subclass: Subclass): 'core' | 'expansion' | 'setting' => {
  const source = subclass.sources?.[0]
  if (!source) return 'core'

  const abbr = source.abbreviation || ''
  const coreBooks = ['PHB', 'DMG', 'MM']
  const expansionBooks = ['XGE', 'TCE', 'FTD', 'SCC', 'VGTM', 'MTOF']

  if (coreBooks.includes(abbr)) return 'core'
  if (expansionBooks.includes(abbr)) return 'expansion'
  return 'setting'
}

/**
 * Get badge color based on source category
 */
type BadgeColor = 'success' | 'info' | 'warning' | 'secondary'

const getSourceBadgeColor = (subclass: Subclass): BadgeColor => {
  const category = getSourceCategory(subclass)
  switch (category) {
    case 'core': return 'success'
    case 'expansion': return 'info'
    case 'setting': return 'warning'
    default: return 'secondary'
  }
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <NuxtLink
      v-for="subclass in subclasses"
      :key="subclass.id"
      :to="`${basePath}/${subclass.slug}`"
      class="block h-full group"
    >
      <UCard
        class="relative overflow-hidden h-full transition-all duration-200 border-2 border-class-300 dark:border-class-700 hover:border-class-500 hover:shadow-lg"
      >
        <!-- Background Image Layer -->
        <div
          class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
          :style="{ backgroundImage: `url(${getBackgroundImage(subclass.slug)})` }"
        />

        <!-- Content Layer -->
        <div class="relative z-10 space-y-3">
          <!-- Subclass Name -->
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-class-600 dark:group-hover:text-class-400 transition-colors">
            {{ subclass.name }}
          </h4>

          <!-- Meta Info Row -->
          <div class="flex items-center gap-2 flex-wrap text-sm">
            <!-- Source Badge (color-coded by category) -->
            <UBadge
              v-if="getSourceAbbreviation(subclass)"
              :color="getSourceBadgeColor(subclass)"
              variant="subtle"
              size="md"
            >
              {{ getSourceAbbreviation(subclass) }}
            </UBadge>

            <!-- Entry Level Badge -->
            <UBadge
              v-if="getEntryLevel(subclass)"
              color="info"
              variant="soft"
              size="md"
            >
              Level {{ getEntryLevel(subclass) }}
            </UBadge>

            <!-- Feature Count -->
            <span class="text-gray-500 dark:text-gray-400">
              {{ getFeatureCountText(subclass) }}
            </span>
          </div>

          <!-- Brief Description Preview -->
          <p
            v-if="getDescriptionPreview(subclass)"
            class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
          >
            {{ getDescriptionPreview(subclass) }}
          </p>
        </div>

        <template #footer>
          <div class="relative z-10 flex items-center justify-end text-sm text-class-600 dark:text-class-400">
            <span class="group-hover:underline">View Details</span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
            />
          </div>
        </template>
      </UCard>
    </NuxtLink>
  </div>
</template>

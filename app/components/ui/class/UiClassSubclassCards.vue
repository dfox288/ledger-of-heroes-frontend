<script setup lang="ts">
interface Feature {
  id: number
  level: number
  feature_name: string
}

interface Source {
  id: number
  name: string
  abbreviation?: string
  page_number?: number
}

interface Subclass {
  id: number | string
  slug: string
  name: string
  description?: string
  features?: Feature[]
  sources?: Source[]
}

interface Props {
  subclasses: Subclass[]
  basePath: string
}

defineProps<Props>()

/**
 * Get source abbreviation for display
 */
const getSourceAbbreviation = (subclass: Subclass): string | null => {
  if (!subclass.sources || subclass.sources.length === 0) return null
  const source = subclass.sources[0]
  return source?.abbreviation || null
}

/**
 * Get feature count text
 */
const getFeatureCountText = (subclass: Subclass): string => {
  const count = subclass.features?.length || 0
  return count === 1 ? '1 feature' : `${count} features`
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <NuxtLink
      v-for="subclass in subclasses"
      :key="subclass.id"
      :to="`${basePath}/${subclass.slug}`"
      class="group"
    >
      <UCard
        class="h-full transition-all duration-200 group-hover:ring-2 group-hover:ring-primary-500 group-hover:shadow-lg"
      >
        <div class="space-y-3">
          <!-- Subclass Name -->
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {{ subclass.name }}
          </h4>

          <!-- Meta Info -->
          <div class="flex items-center gap-2 flex-wrap text-sm">
            <UBadge
              v-if="getSourceAbbreviation(subclass)"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              {{ getSourceAbbreviation(subclass) }}
            </UBadge>

            <span class="text-gray-500 dark:text-gray-400">
              {{ getFeatureCountText(subclass) }}
            </span>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end text-sm text-primary-600 dark:text-primary-400">
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

<script setup lang="ts">
import type { Race } from '~/types/api/entities'
import type { components } from '~/types/api/generated'
import { getSizeColor } from '~/utils/badgeColors'

type TagResource = components['schemas']['TagResource']

interface Props {
  entity: Race
  isSubrace: boolean
  parentRace: Race['parent_race'] | null
  tags?: TagResource[]
}

const props = defineProps<Props>()

const { getImagePath } = useEntityImage()

const imagePath = computed(() => {
  if (!props.entity) return null
  return getImagePath('races', props.entity.slug, 512)
})

/**
 * Truncate description for header
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.entity?.description),
  200
)

/**
 * Get size badge color based on size code
 */
const sizeColor = computed(() => {
  if (props.entity?.size?.code) {
    return getSizeColor(props.entity.size.code)
  }
  return 'neutral'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb navigation (works for both base races and subraces) -->
    <UiDetailBreadcrumb
      list-path="/races"
      list-label="Races"
      :current-label="entity.name"
      :parent-path="isSubrace && parentRace ? `/races/${parentRace.slug}` : undefined"
      :parent-label="isSubrace && parentRace ? parentRace.name : undefined"
    />

    <!-- Hero section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Text content (2/3) -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Title -->
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ entity.name }}
        </h1>

        <!-- Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            v-if="!isSubrace"
            color="error"
            variant="subtle"
            size="lg"
          >
            Race
          </UBadge>
          <UBadge
            v-else
            color="warning"
            variant="subtle"
            size="lg"
          >
            Subrace
          </UBadge>

          <UBadge
            v-if="entity.size"
            :color="sizeColor"
            variant="soft"
            size="md"
          >
            {{ entity.size.name }}
          </UBadge>

          <UBadge
            v-for="tag in tags"
            :key="tag.id"
            color="neutral"
            variant="outline"
            size="md"
          >
            {{ tag.name }}
          </UBadge>
        </div>

        <!-- Subrace parent link -->
        <div
          v-if="isSubrace && parentRace"
          class="flex items-center gap-2"
        >
          <NuxtLink
            :to="`/races/${parentRace.slug}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 hover:bg-warning-200 dark:hover:bg-warning-800/50 transition-colors text-sm font-medium"
          >
            <span>Subrace of</span>
            <span class="font-semibold">{{ parentRace.name }}</span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-4 h-4"
            />
          </NuxtLink>
        </div>

        <!-- Description -->
        <p
          v-if="truncatedDescription"
          class="text-gray-600 dark:text-gray-400 leading-relaxed"
        >
          {{ truncatedDescription }}
        </p>
      </div>

      <!-- Image (1/3) -->
      <div class="lg:col-span-1">
        <UiDetailEntityImage
          v-if="imagePath"
          :image-path="imagePath"
          :image-alt="`${entity.name} ${isSubrace ? 'subrace' : 'race'} illustration`"
        />
      </div>
    </div>
  </div>
</template>

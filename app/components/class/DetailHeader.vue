<script setup lang="ts">
import type { CharacterClass } from '~/types/api/entities'

interface Props {
  entity: CharacterClass
  isSubclass: boolean
  parentClass: CharacterClass['parent_class'] | null
}

const props = defineProps<Props>()

const { getImagePath } = useEntityImage()

const imagePath = computed(() => {
  if (!props.entity) return null
  return getImagePath('classes', props.entity.slug, 512)
})

// Parent image is rendered via UiClassParentImageOverlay component which handles its own image path

/**
 * Get hit die display text
 */
const hitDieText = computed(() => {
  if (props.entity?.hit_die && props.entity.hit_die > 0) {
    return `d${props.entity.hit_die}`
  }
  return null
})

/**
 * Get spellcasting ability code
 */
const spellcastingCode = computed(() => {
  if (props.entity?.spellcasting_ability) {
    return props.entity.spellcasting_ability.code
  }
  if (props.isSubclass && props.parentClass?.spellcasting_ability) {
    return props.parentClass.spellcasting_ability.code
  }
  return null
})

/**
 * Truncate description for header
 */
const truncatedDescription = useTruncateDescription(
  computed(() => props.entity?.description),
  200
)
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb navigation (works for both base classes and subclasses) -->
    <UiDetailBreadcrumb
      list-path="/classes"
      list-label="Classes"
      :current-label="entity.name"
      :parent-path="isSubclass && parentClass ? `/classes/${parentClass.slug}` : undefined"
      :parent-label="isSubclass && parentClass ? parentClass.name : undefined"
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
            v-if="entity.is_base_class"
            color="error"
            variant="subtle"
            size="lg"
          >
            Base Class
          </UBadge>
          <UBadge
            v-else
            color="warning"
            variant="subtle"
            size="lg"
          >
            Subclass
          </UBadge>

          <UBadge
            v-if="hitDieText"
            color="neutral"
            variant="soft"
            size="md"
          >
            {{ hitDieText }}
          </UBadge>

          <UBadge
            v-if="spellcastingCode"
            color="primary"
            variant="soft"
            size="md"
          >
            {{ spellcastingCode }} Caster
          </UBadge>
        </div>

        <!-- Subclass parent link -->
        <div
          v-if="isSubclass && parentClass"
          class="flex items-center gap-2"
        >
          <NuxtLink
            :to="`/classes/${parentClass.slug}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 hover:bg-warning-200 dark:hover:bg-warning-800/50 transition-colors text-sm font-medium"
          >
            <span>Subclass of</span>
            <span class="font-semibold">{{ parentClass.name }}</span>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-4 h-4"
            />
          </NuxtLink>
        </div>

        <!-- Description -->
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
          {{ truncatedDescription }}
        </p>
      </div>

      <!-- Image (1/3) -->
      <div class="lg:col-span-1">
        <div
          v-if="isSubclass && parentClass"
          class="relative"
        >
          <UiDetailEntityImage
            v-if="imagePath"
            :image-path="imagePath"
            :image-alt="`${entity.name} subclass illustration`"
          />
          <!-- Parent overlay -->
          <div class="absolute bottom-2 right-2">
            <UiClassParentImageOverlay
              :parent-slug="parentClass.slug"
              :parent-name="parentClass.name"
            />
          </div>
        </div>

        <UiDetailEntityImage
          v-else-if="imagePath"
          :image-path="imagePath"
          :image-alt="`${entity.name} class illustration`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ClassResource = components['schemas']['ClassResource']

interface Props {
  classes: ClassResource[]
}

const props = defineProps<Props>()

/**
 * Group classes into base classes and subclasses
 */
const groupedClasses = computed(() => {
  const baseClasses: ClassResource[] = []
  const subclasses: ClassResource[] = []

  for (const cls of props.classes) {
    if (cls.is_base_class) {
      baseClasses.push(cls)
    } else {
      subclasses.push(cls)
    }
  }

  return { baseClasses, subclasses }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      📚 SPELL LISTS
    </h3>

    <!-- Base Classes Section -->
    <div
      v-if="groupedClasses.baseClasses.length > 0"
      class="space-y-3"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        BASE CLASSES
      </h4>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="cls in groupedClasses.baseClasses"
          :key="cls.id"
          :to="`/classes/${cls.slug}`"
        >
          <UBadge
            color="class"
            variant="subtle"
            size="md"
            data-badge
            class="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {{ cls.name }}
          </UBadge>
        </NuxtLink>
      </div>
    </div>

    <!-- Subclasses Section -->
    <div
      v-if="groupedClasses.subclasses.length > 0"
      class="space-y-3"
    >
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        SUBCLASSES
      </h4>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="cls in groupedClasses.subclasses"
          :key="cls.id"
          :to="`/classes/${cls.slug}`"
        >
          <UBadge
            color="class"
            variant="subtle"
            size="md"
            data-badge
            class="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {{ cls.name }}
            <span
              v-if="cls.parent_class"
              class="text-gray-500 dark:text-gray-400"
            >
              ({{ cls.parent_class.name }})
            </span>
          </UBadge>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

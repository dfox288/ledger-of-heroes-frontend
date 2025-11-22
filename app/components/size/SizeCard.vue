<script setup lang="ts">
interface Size {
  id: number
  code: string
  name: string
}

interface Props {
  size: Size
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Use lowercased code as slug (e.g., M -> m)
const slug = computed(() => props.size.code.toLowerCase())
const backgroundImageUrl = computed(() =>
  getImagePath('sizes', slug.value, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-size-300 dark:border-size-700 hover:border-size-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity duration-300 group-hover:opacity-20"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Size Code Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="size"
          variant="solid"
          size="lg"
        >
          {{ size.code }}
        </UBadge>
      </div>

      <!-- Size Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ size.name }}
      </h3>

      <!-- Category Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="size"
          variant="soft"
          size="xs"
        >
          Creature Size
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

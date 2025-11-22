<script setup lang="ts">
interface Condition {
  id: number
  name: string
  slug: string
  description: string
}

interface Props {
  condition: Condition
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()
const backgroundImageUrl = computed(() =>
  getImagePath('conditions', props.condition.slug, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-condition-300 dark:border-condition-700 hover:border-condition-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity duration-300 group-hover:opacity-20"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Condition Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ condition.name }}
      </h3>

      <!-- Description (truncated to 3 lines) -->
      <p
        v-if="condition.description"
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
      >
        {{ condition.description }}
      </p>

      <!-- Category Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="condition"
          variant="soft"
          size="xs"
        >
          Condition
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

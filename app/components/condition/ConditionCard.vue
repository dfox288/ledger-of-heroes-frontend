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
  <div
    :style="backgroundImageUrl ? {
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } : {}"
    class="group relative overflow-hidden rounded-lg border border-default
           transition-all duration-200 hover:border-primary hover:scale-[1.02]
           hover:shadow-lg dark:hover:shadow-primary/20
           after:absolute after:inset-0 after:bg-background/90 hover:after:bg-background/80
           after:transition-colors after:duration-200"
  >
    <div class="relative z-10 p-4 space-y-3">
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
          color="neutral"
          variant="soft"
          size="xs"
        >
          Condition
        </UBadge>
      </div>
    </div>
  </div>
</template>

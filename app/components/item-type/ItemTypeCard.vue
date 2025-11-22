<script setup lang="ts">
interface ItemType {
  id: number
  code: string
  name: string
  description: string
}

interface Props {
  itemType: ItemType
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Use lowercased code as slug (e.g., LA -> la)
const slug = computed(() => props.itemType.code.toLowerCase())
const backgroundImageUrl = computed(() =>
  getImagePath('item-types', slug.value, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-itemtype-300 dark:border-itemtype-700 hover:border-itemtype-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Code Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="itemtype"
          variant="solid"
          size="lg"
        >
          {{ itemType.code }}
        </UBadge>
      </div>

      <!-- Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ itemType.name }}
      </h3>

      <!-- Description (truncated) -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {{ itemType.description }}
      </p>

      <!-- Category Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="itemtype"
          variant="soft"
          size="xs"
        >
          Item Type
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Source {
  id: number
  code: string
  name: string
  publisher: string
  publication_year: number
  edition: string
}

interface Props {
  source: Source
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Use lowercased code as slug (e.g., PHB -> phb)
const slug = computed(() => props.source.code.toLowerCase())
const backgroundImageUrl = computed(() =>
  getImagePath('sources', slug.value, 256)
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
      <!-- Source Code Badge -->
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge
          color="neutral"
          variant="solid"
          size="lg"
        >
          {{ source.code }}
        </UBadge>
        <UBadge
          color="neutral"
          variant="soft"
          size="xs"
        >
          {{ source.edition }}
        </UBadge>
      </div>

      <!-- Source Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
        {{ source.name }}
      </h3>

      <!-- Publisher & Year -->
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
        <div class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-building-office"
            class="w-4 h-4"
          />
          <span>{{ source.publisher }}</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-calendar"
            class="w-4 h-4"
          />
          <span>{{ source.publication_year }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

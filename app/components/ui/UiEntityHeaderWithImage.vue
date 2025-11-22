<script setup lang="ts">
interface Badge {
  label: string
  color: string
  variant: 'solid' | 'outline' | 'soft' | 'subtle'
  size: 'sm' | 'md' | 'lg'
}

interface Props {
  title: string
  badges?: Badge[]
  imagePath?: string | null
  imageAlt?: string
}

withDefaults(defineProps<Props>(), {
  badges: () => [],
  imagePath: null,
  imageAlt: ''
})
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6">
    <!-- Header Content (2/3 on desktop) -->
    <div class="flex-1 space-y-4">
      <!-- Badges -->
      <div
        v-if="badges && badges.length > 0"
        class="flex items-center gap-2 flex-wrap"
      >
        <UBadge
          v-for="(badge, index) in badges"
          :key="index"
          :color="badge.color"
          :variant="badge.variant"
          :size="badge.size"
        >
          {{ badge.label }}
        </UBadge>
      </div>

      <!-- Title -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
        {{ title }}
      </h1>
    </div>

    <!-- Image (1/3 on desktop) -->
    <div
      v-if="imagePath"
      class="w-full md:w-1/3"
    >
      <div class="aspect-square rounded-lg overflow-hidden shadow-lg">
        <NuxtImg
          :src="imagePath"
          :alt="imageAlt"
          class="w-full h-full object-cover"
          loading="lazy"
          fit="cover"
        />
      </div>
    </div>
  </div>
</template>

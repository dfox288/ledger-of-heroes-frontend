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

defineProps<Props>()
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
    <div class="space-y-3">
      <!-- Source Code Badge -->
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge color="neutral" variant="solid" size="lg">
          {{ source.code }}
        </UBadge>
        <UBadge color="neutral" variant="soft" size="xs">
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
          <UIcon name="i-heroicons-building-office" class="w-4 h-4" />
          <span>{{ source.publisher }}</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
          <span>{{ source.publication_year }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

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

defineProps<Props>()
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
    <div class="space-y-3">
      <!-- Code Badge -->
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="solid" size="lg">
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
        <UBadge color="neutral" variant="soft" size="xs">
          Item Type
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

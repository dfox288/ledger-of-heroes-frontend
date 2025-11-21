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

defineProps<Props>()
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
    <div class="space-y-3">
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
        <UBadge color="neutral" variant="soft" size="xs">
          Condition
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

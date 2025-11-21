<script setup lang="ts">
interface Property {
  id: number
  name: string
  description: string
}

interface Props {
  properties: Property[]
}

defineProps<Props>()
</script>

<template>
  <div class="p-4">
    <!-- Badges at top -->
    <div class="flex flex-wrap gap-2 mb-4">
      <UBadge
        v-for="property in properties"
        :key="property.id"
        color="neutral"
        variant="soft"
      >
        {{ property.name }}
      </UBadge>
    </div>
    <!-- Descriptions below -->
    <div class="space-y-2">
      <div
        v-for="property in properties"
        :key="`desc-${property.id}`"
        class="text-sm"
      >
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ property.name }}:</span>
        <span class="text-gray-600 dark:text-gray-400 ml-1">{{ property.description }}</span>
      </div>
    </div>
  </div>
</template>

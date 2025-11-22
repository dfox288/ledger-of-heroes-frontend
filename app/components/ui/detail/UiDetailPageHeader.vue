<script setup lang="ts">
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type BadgeVariant = 'solid' | 'outline' | 'soft' | 'subtle'
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Badge {
  label: string
  color: BadgeColor
  variant: BadgeVariant
  size?: BadgeSize
}

interface Props {
  title: string
  badges?: Badge[]
}

defineProps<Props>()
</script>

<template>
  <div>
    <div
      v-if="badges && badges.length > 0"
      class="flex items-center gap-2 mb-3 flex-wrap"
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
    <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
      {{ title }}
    </h1>
  </div>
</template>

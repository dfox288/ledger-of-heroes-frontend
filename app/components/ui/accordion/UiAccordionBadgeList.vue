<script setup lang="ts">
interface Item {
  id: number
  name: string
}

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type BadgeVariant = 'solid' | 'outline' | 'soft' | 'subtle'

interface Props {
  items: Item[]
  color?: BadgeColor
  variant?: BadgeVariant
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'soft'
})
</script>

<template>
  <div class="p-4">
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="item in items"
        :key="item.id"
        :color="color"
        :variant="variant"
      >
        {{ item.name }}
      </UBadge>
    </div>
  </div>
</template>

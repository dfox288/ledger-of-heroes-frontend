<script setup lang="ts">
import type { Tag } from '~/types'

interface Props {
  tags?: Tag[]
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="tags && tags.length > 0"
    data-testid="tags-container"
    class="p-4"
  >
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="tag in tags"
        :key="tag.id"
        color="primary"
        variant="soft"
        size="md"
        data-testid="tag-badge"
      >
        {{ tag.name }}
      </UBadge>
    </div>
  </div>
</template>

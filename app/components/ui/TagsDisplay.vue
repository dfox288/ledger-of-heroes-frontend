<script setup lang="ts">
interface Tag {
  id: number
  name: string
  slug: string
  type: string | null
}

interface Props {
  tags?: Tag[]
}

defineProps<Props>()
</script>

<template>
  <div v-if="tags && tags.length > 0" data-testid="tags-container" class="p-4">
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="tag in tags"
        :key="tag.id"
        color="primary"
        variant="soft"
        data-testid="tag-badge"
      >
        {{ tag.name }}
      </UBadge>
    </div>
  </div>
</template>

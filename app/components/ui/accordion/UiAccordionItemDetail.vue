<script setup lang="ts">
interface Props {
  detail: string | null
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="detail"
    class="p-4"
  >
    <p class="text-sm text-gray-600 dark:text-gray-400 italic whitespace-pre-line leading-relaxed">
      {{ detail }}
    </p>
  </div>
</template>

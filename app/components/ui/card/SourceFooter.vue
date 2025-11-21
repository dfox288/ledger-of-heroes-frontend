<script setup lang="ts">
interface Source {
  code: string
  name: string
  pages: string
}

interface Props {
  sources?: Source[]
}

defineProps<Props>()
</script>

<template>
  <div v-if="sources && sources.length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-2 flex-wrap text-xs text-gray-600 dark:text-gray-400">
      <span v-for="(source, index) in sources" :key="source.code">
        <span class="font-medium">{{ source.name }}</span> p.{{ source.pages }}<span v-if="index < sources.length - 1">, </span>
      </span>
    </div>
  </div>
</template>

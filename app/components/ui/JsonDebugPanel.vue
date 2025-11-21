<script setup lang="ts">
interface Props {
  data: any
  visible: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Raw JSON Data'
})

const emit = defineEmits<{
  close: []
}>()

const copyJson = () => {
  if (props.data) {
    navigator.clipboard.writeText(JSON.stringify(props.data, null, 2))
  }
}
</script>

<template>
  <div v-if="visible" data-testid="json-panel">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ title }}
          </h2>
          <div class="flex gap-2">
            <UButton
              data-testid="copy-button"
              @click="copyJson"
              size="xs"
              variant="ghost"
              icon="i-heroicons-clipboard"
            >
              Copy
            </UButton>
            <UButton
              data-testid="close-button"
              @click="emit('close')"
              size="xs"
              variant="ghost"
              icon="i-heroicons-x-mark"
            >
              Close
            </UButton>
          </div>
        </div>
      </template>
      <pre
        data-testid="json-content"
        class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
      ><code>{{ JSON.stringify(data, null, 2) }}</code></pre>
    </UCard>
  </div>
</template>

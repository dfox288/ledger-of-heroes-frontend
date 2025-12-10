<script setup lang="ts">
interface Props {
  data: unknown
  title?: string
}

const props = defineProps<Props>()
const toast = useToast()

const showJson = ref(false)
const jsonPanelRef = ref<HTMLElement | null>(null)

const toggleJson = () => {
  showJson.value = !showJson.value
  if (showJson.value) {
    // Wait for DOM update, then scroll
    nextTick(() => {
      jsonPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

const copyJson = async () => {
  if (props.data) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(props.data, null, 2))
      toast.add({
        title: 'Copied!',
        description: 'JSON copied to clipboard',
        icon: 'i-heroicons-clipboard-document-check',
        color: 'success',
      })
    }
    catch {
      toast.add({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'error',
      })
    }
  }
}
</script>

<template>
  <div>
    <!-- JSON Toggle Button (shown in header) -->
    <UButton
      color="neutral"
      variant="soft"
      size="sm"
      @click="toggleJson"
    >
      <UIcon
        :name="showJson ? 'i-heroicons-eye-slash' : 'i-heroicons-code-bracket'"
        class="w-4 h-4"
      />
      {{ showJson ? 'Hide JSON' : 'View JSON' }}
    </UButton>

    <!-- JSON Debug Panel -->
    <div
      v-if="showJson"
      ref="jsonPanelRef"
      class="mt-8 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
    >
      <div class="bg-gray-900 text-gray-100 p-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          {{ title || 'Raw JSON Data' }}
        </h3>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="i-heroicons-clipboard"
            @click="copyJson"
          >
            Copy
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="i-heroicons-x-mark"
            @click="showJson = false"
          >
            Close
          </UButton>
        </div>
      </div>
      <pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm"><code>{{ JSON.stringify(data, null, 2) }}</code></pre>
    </div>
  </div>
</template>

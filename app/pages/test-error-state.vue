<script setup lang="ts">
const testError = new Error('Failed to fetch spells from API')
const testErrorString = 'Network connection timeout'

const handleRetry = () => {
  console.log('Retry clicked!')
  alert('Retry clicked!')
}
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold">UiListErrorState Component Test</h1>

    <section>
      <h2 class="text-xl font-semibold mb-4">Error Object with Entity Name</h2>
      <UiListErrorState
        :error="testError"
        entity-name="Spells"
        @retry="handleRetry"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-4">Error String with Entity Name</h2>
      <UiListErrorState
        :error="testErrorString"
        entity-name="Items"
        @retry="handleRetry"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-4">Error without Entity Name (Generic)</h2>
      <UiListErrorState
        :error="testError"
        @retry="handleRetry"
      />
    </section>
  </div>
</template>

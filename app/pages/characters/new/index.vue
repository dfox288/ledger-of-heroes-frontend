<script setup lang="ts">
/**
 * Character Creation Wizard - Entry Point
 *
 * Redirects to the first step of the wizard (sourcebooks).
 */

definePageMeta({
  middleware: () => navigateTo('/characters/new/sourcebooks')
})
</script>

<template>
  <div>Redirecting...</div>
</template>

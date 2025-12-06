<script setup lang="ts">
/**
 * Character Edit - Default Step Redirect
 *
 * Redirects to the first wizard step (race) when accessing /characters/:publicId/edit
 */
const route = useRoute()
const publicId = route.params.publicId as string

await navigateTo(`/characters/${publicId}/edit/race`, { replace: true })
</script>

<template>
  <div />
</template>

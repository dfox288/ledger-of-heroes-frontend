<!-- app/pages/characters/[id]/edit/index.vue -->
<!--
  Redirects /characters/[id]/edit to /characters/[id]/edit/name
  This ensures accessing the edit page without a step goes to the first step.
-->
<script setup lang="ts">
const route = useRoute()
const characterId = route.params.id

// Preserve query params (like ?new=true) during redirect
const query = route.query
await navigateTo(`/characters/${characterId}/edit/name`, {
  replace: true,
  query
})
</script>

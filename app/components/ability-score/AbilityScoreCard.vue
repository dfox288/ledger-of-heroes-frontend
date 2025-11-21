<script setup lang="ts">
interface AbilityScore {
  id: number
  code: string
  name: string
}

interface Props {
  abilityScore: AbilityScore
}

defineProps<Props>()
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
    <div class="space-y-3">
      <!-- Code Badge -->
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="solid" size="lg">
          {{ abilityScore.code }}
        </UBadge>
      </div>

      <!-- Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ abilityScore.name }}
      </h3>

      <!-- Category Badge -->
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="soft" size="xs">
          Ability Score
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

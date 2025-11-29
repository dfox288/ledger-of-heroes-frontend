<script setup lang="ts">
interface Skill {
  id: number
  slug: string
  name: string
  ability_score?: {
    id: number
    code: string
    name: string
  } | null
}

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Use API slug
// e.g., "Animal Handling" -> "animal-handling"
const backgroundImageUrl = computed(() =>
  getImagePath('skills', props.skill.slug, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-skill-300 dark:border-skill-700 hover:border-skill-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Skill Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ skill.name }}
      </h3>

      <!-- Ability Score (if present) -->
      <div
        v-if="skill.ability_score"
        class="space-y-2"
      >
        <div class="flex items-center gap-2">
          <UBadge
            color="skill"
            variant="solid"
            size="md"
          >
            {{ skill.ability_score.code }}
          </UBadge>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ skill.ability_score.name }}
        </p>
      </div>

      <!-- Category Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="skill"
          variant="soft"
          size="md"
        >
          Skill
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

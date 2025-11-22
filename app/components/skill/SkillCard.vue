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
const backgroundImageUrl = computed(() =>
  getImagePath('skills', props.skill.slug, 256)
)
</script>

<template>
  <div
    :style="backgroundImageUrl ? {
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } : {}"
    class="group relative overflow-hidden rounded-lg border border-default
           transition-all duration-200 hover:border-primary hover:scale-[1.02]
           hover:shadow-lg dark:hover:shadow-primary/20
           after:absolute after:inset-0 after:bg-background/90 hover:after:bg-background/80
           after:transition-colors after:duration-200"
  >
    <div class="relative z-10 p-4 space-y-3">
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
            color="info"
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
          color="neutral"
          variant="soft"
          size="xs"
        >
          Skill
        </UBadge>
      </div>
    </div>
  </div>
</template>

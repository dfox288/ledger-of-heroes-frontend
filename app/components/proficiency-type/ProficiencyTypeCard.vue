<script setup lang="ts">
interface ProficiencyType {
  id: number
  name: string
  category: string
  subcategory?: string | null
}

interface Props {
  proficiencyType: ProficiencyType
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Slugify name: Light Armor -> light-armor
const slug = computed(() =>
  props.proficiencyType.name.toLowerCase().replace(/\s+/g, '-')
)
const backgroundImageUrl = computed(() =>
  getImagePath('proficiency-types', slug.value, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-proficiency-300 dark:border-proficiency-700 hover:border-proficiency-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ proficiencyType.name }}
      </h3>

      <!-- Category and Subcategory Badges -->
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge
          color="proficiency"
          variant="solid"
          size="md"
        >
          {{ proficiencyType.category }}
        </UBadge>
        <UBadge
          v-if="proficiencyType.subcategory"
          color="proficiency"
          variant="soft"
          size="md"
        >
          {{ proficiencyType.subcategory }}
        </UBadge>
      </div>

      <!-- Type Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="proficiency"
          variant="soft"
          size="xs"
        >
          Proficiency Type
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

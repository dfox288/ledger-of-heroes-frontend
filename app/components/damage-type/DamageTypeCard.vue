<script setup lang="ts">
interface DamageType {
  id: number
  name: string
}

interface Props {
  damageType: DamageType
}

const props = defineProps<Props>()
const { getImagePath } = useEntityImage()

// Use lowercased name as slug (e.g., Fire -> fire)
const slug = computed(() => props.damageType.name.toLowerCase())
const backgroundImageUrl = computed(() =>
  getImagePath('damage-types', slug.value, 256)
)
</script>

<template>
  <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-damage-300 dark:border-damage-700 hover:border-damage-500 group">
    <!-- Background Image Layer -->
    <div
      v-if="backgroundImageUrl"
      class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-3"
      :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
    />

    <!-- Content Layer -->
    <div class="relative z-10 space-y-3">
      <!-- Damage Type Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ damageType.name }}
      </h3>

      <!-- Type Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="damage"
          variant="soft"
          size="md"
        >
          Damage Type
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

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
      <!-- Damage Type Name -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ damageType.name }}
      </h3>

      <!-- Type Badge -->
      <div class="flex items-center gap-2">
        <UBadge
          color="neutral"
          variant="soft"
          size="sm"
        >
          Damage Type
        </UBadge>
      </div>
    </div>
  </div>
</template>

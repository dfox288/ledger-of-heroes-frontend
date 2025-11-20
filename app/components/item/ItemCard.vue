<script setup lang="ts">
interface Item {
  id: number
  name: string
  slug: string
  rarity: string
  item_type?: {
    id: number
    name: string
  }
  is_magic: boolean
  requires_attunement: boolean
  cost_cp?: number
  weight?: number
  description?: string
  sources?: Array<{
    code: string
    name: string
    pages: string
  }>
}

interface Props {
  item: Item
}

const props = defineProps<Props>()

/**
 * Get rarity color for badge (NuxtUI v4 semantic colors)
 */
const rarityColor = computed(() => {
  const colors: Record<string, string> = {
    'common': 'neutral',
    'uncommon': 'success',
    'rare': 'info',
    'very rare': 'primary',
    'legendary': 'warning',
    'artifact': 'error'
  }
  return colors[props.item.rarity?.toLowerCase()] || 'neutral'
})

/**
 * Format rarity for display
 */
const rarityText = computed(() => {
  return props.item.rarity?.split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ') || 'Common'
})

/**
 * Format cost in gold pieces
 */
const costText = computed(() => {
  if (!props.item.cost_cp) return null
  const gp = props.item.cost_cp / 100
  if (gp >= 1) {
    return gp % 1 === 0 ? `${gp} gp` : `${gp.toFixed(1)} gp`
  }
  return `${props.item.cost_cp} cp`
})

/**
 * Truncate description to specified length
 */
const truncatedDescription = computed(() => {
  if (!props.item.description) return 'No description available'
  const maxLength = 150
  if (props.item.description.length <= maxLength) return props.item.description
  return props.item.description.substring(0, maxLength).trim() + '...'
})
</script>

<template>
  <NuxtLink :to="`/items/${item.slug}`" class="block h-full">
    <UCard class="hover:shadow-lg transition-shadow h-full border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Type and Rarity Badges -->
          <div class="flex items-center gap-2 flex-wrap justify-between">
            <UBadge v-if="item.item_type" color="warning" variant="subtle" size="md">
              {{ item.item_type.name }}
            </UBadge>
            <UBadge :color="rarityColor" variant="subtle" size="md">
              {{ rarityText }}
            </UBadge>
          </div>

          <!-- Item Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ item.name }}
          </h3>

          <!-- Quick Stats (with Magic/Attunement) -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div v-if="costText" class="flex items-center gap-1">
              <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
              <span>{{ costText }}</span>
            </div>
            <div v-if="item.weight" class="flex items-center gap-1">
              <UIcon name="i-heroicons-scale" class="w-4 h-4" />
              <span>{{ item.weight }} lb</span>
            </div>
            <UBadge v-if="item.is_magic" color="primary" variant="soft" size="sm">
              ✨ Magic
            </UBadge>
            <UBadge v-if="item.requires_attunement" color="info" variant="soft" size="sm">
              🔮 Attunement
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <!-- Sourcebook Display (BOTTOM ALIGNED, FULL LENGTH) -->
        <div v-if="item.sources && item.sources.length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 flex-wrap text-xs text-gray-600 dark:text-gray-400">
            <span v-for="(source, index) in item.sources" :key="source.code">
              <span class="font-medium">{{ source.name }}</span> p.{{ source.pages }}<span v-if="index < item.sources.length - 1">, </span>
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

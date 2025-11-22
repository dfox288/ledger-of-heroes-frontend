<script setup lang="ts">
import type { Item } from '~/types'

interface Props {
  item: Item
}

const props = defineProps<Props>()

/**
 * Get rarity color for badge (NuxtUI v4 semantic colors)
 * Progressive rarity scale from common to artifact
 */
const rarityColor = computed<'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'>(() => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    'common': 'neutral', // Gray - most basic
    'uncommon': 'success', // Green - slightly better
    'rare': 'info', // Blue - notable
    'very rare': 'primary', // Teal/cyan - very valuable
    'legendary': 'warning', // Orange/amber - extremely rare
    'artifact': 'error' // Red - unique/powerful
  }
  const rarity = props.item.rarity?.toLowerCase()
  return (rarity && colors[rarity]) || 'neutral'
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

/**
 * Get background image path (256px variant)
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  return getImagePath('items', props.item.slug, 256)
})
</script>

<template>
  <NuxtLink
    :to="`/items/${item.slug}`"
    class="block h-full group"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-item-300 dark:border-item-700 hover:border-item-500">
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        data-test="card-background"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300 group-hover:opacity-30 group-hover:scale-110"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <!-- Top content -->
        <div class="space-y-3 flex-1">
          <!-- Type and Rarity Badges -->
          <div class="flex items-center gap-2 flex-wrap justify-between">
            <UBadge
              v-if="item.item_type"
              color="item"
              variant="subtle"
              size="md"
            >
              {{ item.item_type.name }}
            </UBadge>
            <UBadge
              :color="rarityColor"
              variant="subtle"
              size="md"
            >
              {{ rarityText }}
            </UBadge>
          </div>

          <!-- Item Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ item.name }}
          </h3>

          <!-- Quick Stats (with Magic/Attunement) -->
          <div class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div
              v-if="costText"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-currency-dollar"
                class="w-4 h-4"
              />
              <span>{{ costText }}</span>
            </div>
            <div
              v-if="item.weight"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-scale"
                class="w-4 h-4"
              />
              <span>{{ item.weight }} lb</span>
            </div>
            <UBadge
              v-if="item.is_magic"
              color="item"
              variant="soft"
              size="sm"
            >
              ✨ Magic
            </UBadge>
            <UBadge
              v-if="item.requires_attunement"
              color="item"
              variant="soft"
              size="sm"
            >
              🔮 Attunement
            </UBadge>
          </div>

          <!-- Description Preview -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {{ truncatedDescription }}
          </p>
        </div>

        <UiCardSourceFooter :sources="item.sources" />
      </div>
    </UCard>
  </NuxtLink>
</template>

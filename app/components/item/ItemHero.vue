<script setup lang="ts">
import type { Item } from '~/types'
import { getItemRarityColor, getItemTypeColor } from '~/utils/badgeColors'

interface Props {
  item: Item
  imagePath: string | null
}

const props = defineProps<Props>()

/**
 * Format rarity for display
 * Converts "very rare" to "Very Rare"
 */
const rarityText = computed(() => {
  return props.item.rarity?.split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ') || 'Common'
})

/**
 * Format magic bonus for display
 * Converts "2" to "+2"
 */
const magicBonusText = computed(() => {
  if (!props.item.magic_bonus) return null
  return `+${props.item.magic_bonus}`
})

/**
 * Get rarity color using centralized utility
 */
const rarityColor = computed(() => getItemRarityColor(props.item.rarity || null))

/**
 * Get item type color using centralized utility
 */
const itemTypeColor = computed(() => {
  if (!props.item.item_type) return 'neutral'
  return getItemTypeColor(props.item.item_type.name)
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Content (2/3 on large screens) -->
    <div class="lg:col-span-2 space-y-4">
      <!-- Badges -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Item Type -->
        <UBadge
          v-if="item.item_type"
          :color="itemTypeColor"
          variant="subtle"
          size="md"
        >
          {{ item.item_type.name }}
        </UBadge>

        <!-- Rarity -->
        <UBadge
          :color="rarityColor"
          variant="subtle"
          size="md"
        >
          {{ rarityText }}
        </UBadge>

        <!-- Magic Bonus -->
        <UBadge
          v-if="magicBonusText"
          color="primary"
          variant="solid"
          size="md"
        >
          {{ magicBonusText }}
        </UBadge>

        <!-- Magic Indicator -->
        <UBadge
          v-if="item.is_magic"
          color="item"
          variant="subtle"
          size="md"
        >
          ✨ Magic
        </UBadge>

        <!-- Attunement -->
        <UBadge
          v-if="item.requires_attunement"
          color="item"
          variant="subtle"
          size="md"
        >
          🔮 Attunement
        </UBadge>
      </div>

      <!-- Item Name -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
        {{ item.name }}
      </h1>
    </div>

    <!-- Image (1/3 on large screens) -->
    <div
      v-if="imagePath"
      class="lg:col-span-1"
    >
      <div class="aspect-square rounded-lg overflow-hidden shadow-lg">
        <NuxtImg
          :src="imagePath"
          :alt="item.name"
          class="w-full h-full object-cover"
          loading="lazy"
          fit="cover"
        />
      </div>
    </div>
  </div>
</template>

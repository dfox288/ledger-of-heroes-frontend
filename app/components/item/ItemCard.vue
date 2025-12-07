<script setup lang="ts">
import type { Item } from '~/types'

interface Props {
  item: Item
}

const props = defineProps<Props>()

const { getItemRarityColor } = useEntityColorMap()

/**
 * Get rarity color for badge (NuxtUI v4 semantic colors)
 * Progressive rarity scale from common to artifact
 */
const rarityColor = computed(() => {
  return getItemRarityColor(props.item.rarity || null)
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
 * Get description or fallback
 */
const description = computed(() => {
  return props.item.description || 'No description available'
})

/**
 * Format proficiency category for display
 * Converts "martial_melee" to "Martial Melee"
 */
const proficiencyCategoryText = computed(() => {
  if (!props.item.proficiency_category) return null
  return props.item.proficiency_category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

/**
 * Format magic bonus for display
 * Converts "2" to "+2"
 */
const magicBonusText = computed(() => {
  if (!props.item.magic_bonus) return null
  return `+${props.item.magic_bonus}`
})
</script>

<template>
  <UiCardUiEntityCard
    :to="`/items/${item.slug}`"
    entity-type="items"
    :slug="item.slug"
    color="item"
    :description="description"
    :sources="item.sources"
  >
    <template #badges>
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
      <UBadge
        v-if="magicBonusText"
        color="primary"
        variant="solid"
        size="md"
      >
        {{ magicBonusText }}
      </UBadge>
      <UBadge
        v-if="proficiencyCategoryText"
        color="item"
        variant="subtle"
        size="md"
      >
        {{ proficiencyCategoryText }}
      </UBadge>
    </template>

    <template #title>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
        {{ item.name }}
      </h3>
    </template>

    <template #stats>
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
        variant="subtle"
        size="md"
      >
        ✨ Magic
      </UBadge>
      <UBadge
        v-if="item.requires_attunement"
        color="item"
        variant="subtle"
        size="md"
      >
        🔮 Attunement
      </UBadge>
    </template>
  </UiCardUiEntityCard>
</template>

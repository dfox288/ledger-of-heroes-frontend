<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

// Fetch item data using useAsyncData for SSR support (via Nitro proxy)
const { data: item, error, pending } = await useAsyncData(
  `item-${slug}`,
  async () => {
    const response = await apiFetch(`/items/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => item.value ? `${item.value.name} - D&D 5e Item` : 'Item - D&D 5e Compendium'),
  description: computed(() => item.value?.description?.substring(0, 160)),
})

/**
 * Format cost in gold pieces
 */
const costInGold = computed(() => {
  if (!item.value?.cost_cp) return null
  const gp = item.value.cost_cp / 100
  return gp >= 1 ? `${gp} gp` : `${item.value.cost_cp} cp`
})

/**
 * Format rarity for display
 */
const rarityText = computed(() => {
  if (!item.value) return ''
  return item.value.rarity?.split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ') || 'Common'
})

/**
 * Get rarity color for badge (NuxtUI v4 semantic colors)
 * Progressive rarity scale from common to artifact
 */
const rarityColor = computed(() => {
  if (!item.value) return 'neutral'
  const colors: Record<string, string> = {
    common: 'neutral',      // Gray - most basic
    uncommon: 'success',     // Green - slightly better
    rare: 'info',            // Blue - notable
    'very rare': 'primary',  // Teal/cyan - very valuable
    legendary: 'warning',    // Orange/amber - extremely rare
    artifact: 'error'        // Red - unique/powerful
  }
  return colors[item.value.rarity.toLowerCase()] || 'neutral'
})

/**
 * Get item type color for badge
 * Color-coded by general category
 */
const getItemTypeColor = computed(() => {
  if (!item.value?.item_type) return 'neutral'
  const type = item.value.item_type.name.toLowerCase()

  // Weapons (red/error)
  if (type.includes('weapon') || type.includes('sword') || type.includes('axe') ||
      type.includes('bow') || type.includes('dagger')) {
    return 'error'
  }

  // Armor (info/blue)
  if (type.includes('armor') || type.includes('shield')) {
    return 'info'
  }

  // Tools & Equipment (warning/amber)
  if (type.includes('tool') || type.includes('kit') || type.includes('instrument')) {
    return 'warning'
  }

  // Potions & Consumables (success/green)
  if (type.includes('potion') || type.includes('scroll') || type.includes('elixir')) {
    return 'success'
  }

  // Wondrous Items & Magical (primary/teal)
  if (type.includes('wondrous') || type.includes('ring') || type.includes('amulet') ||
      type.includes('staff') || type.includes('rod') || type.includes('wand')) {
    return 'primary'
  }

  // Default
  return 'neutral'
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading v-if="pending" entityType="item" />

    <!-- Error State -->
    <UiDetailPageError v-else-if="error" entityType="Item" />

    <!-- Item Content -->
    <div v-else-if="item" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <UiBackLink to="/items" label="Back to Items" />

      <!-- Header -->
      <UiDetailPageHeader
        :title="item.name"
        :badges="[
          { label: item.item_type.name, color: getItemTypeColor, variant: 'subtle', size: 'lg' },
          { label: rarityText, color: rarityColor, variant: 'subtle', size: 'lg' },
          ...(item.is_magic ? [{ label: '✨ Magic', color: 'primary', variant: 'soft', size: 'sm' }] : []),
          ...(item.requires_attunement ? [{ label: '🔮 Attunement', color: 'info', variant: 'soft', size: 'sm' }] : [])
        ]"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard
        :stats="[
          ...(costInGold ? [{ icon: 'i-heroicons-currency-dollar', label: 'Cost', value: costInGold }] : []),
          ...(item.weight ? [{ icon: 'i-heroicons-scale', label: 'Weight', value: `${item.weight} lb` }] : []),
          ...(item.damage_dice ? [{ icon: 'i-heroicons-bolt', label: 'Damage', value: item.damage_dice + (item.damage_type ? ` ${item.damage_type.name}` : ''), subtext: item.versatile_damage ? `Versatile: ${item.versatile_damage}` : undefined }] : []),
          ...(item.armor_class !== null ? [{ icon: 'i-heroicons-shield-check', label: 'Armor Class', value: String(item.armor_class) }] : []),
          ...(item.range_normal ? [{ icon: 'i-heroicons-arrow-trending-up', label: 'Range', value: `${item.range_normal}${item.range_long ? `/${item.range_long}` : ''} ft.` }] : []),
          ...(item.strength_requirement ? [{ icon: 'i-heroicons-hand-raised', label: 'Strength Required', value: String(item.strength_requirement) }] : [])
        ]"
      />

      <!-- Description (Always Visible) -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">{{ item.description }}</p>
        </div>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(item.properties && item.properties.length > 0 ? [{
            label: 'Properties',
            slot: 'properties',
            defaultOpen: false
          }] : []),
          ...(item.modifiers && item.modifiers.length > 0 ? [{
            label: 'Modifiers',
            slot: 'modifiers',
            defaultOpen: false
          }] : []),
          ...(item.abilities && item.abilities.length > 0 ? [{
            label: 'Abilities',
            slot: 'abilities',
            defaultOpen: false
          }] : []),
          ...(item.sources && item.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Properties Slot -->
        <template v-if="item.properties && item.properties.length > 0" #properties>
          <UiAccordionPropertiesList :properties="item.properties" />
        </template>

        <!-- Modifiers Slot -->
        <template v-if="item.modifiers && item.modifiers.length > 0" #modifiers>
          <div class="p-4 space-y-3">
            <div
              v-for="modifier in item.modifiers"
              :key="modifier.id"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ modifier.modifier_type }}: {{ modifier.value > 0 ? '+' : '' }}{{ modifier.value }}
              </div>
              <div v-if="modifier.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ modifier.description }}
              </div>
            </div>
          </div>
        </template>

        <!-- Abilities Slot -->
        <template v-if="item.abilities && item.abilities.length > 0" #abilities>
          <UiAccordionAbilitiesList :abilities="item.abilities" />
        </template>

        <!-- Source Slot -->
        <template v-if="item.sources && item.sources.length > 0" #source>
          <UiSourceDisplay :sources="item.sources" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel :data="item" title="Item Data" />
    </div>
  </div>
</template>

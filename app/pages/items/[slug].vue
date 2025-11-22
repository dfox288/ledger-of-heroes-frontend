<script setup lang="ts">
import { getItemRarityColor, getItemTypeColor } from '~/utils/badgeColors'

const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

// Fetch item data using useAsyncData for SSR support (via Nitro proxy)
const { data: item, error, pending } = await useAsyncData(
  `item-${slug}`,
  async () => {
    const response = await apiFetch<{ data: any }>(`/items/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => item.value ? `${item.value.name} - D&D 5e Item` : 'Item - D&D 5e Compendium'),
  description: computed(() => item.value?.description?.substring(0, 160))
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
 * Get rarity color for badge
 */
const rarityColor = computed(() => {
  if (!item.value) return 'neutral'
  return getItemRarityColor(item.value.rarity)
})

/**
 * Get item type color for badge
 */
const itemTypeColor = computed(() => {
  if (!item.value?.item_type) return 'neutral'
  return getItemTypeColor(item.value.item_type.name)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading
      v-if="pending"
      entity-type="item"
    />

    <!-- Error State -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Item"
    />

    <!-- Item Content -->
    <div
      v-else-if="item"
      class="space-y-8"
    >
      <!-- Breadcrumb Navigation -->
      <UiBackLink
        to="/items"
        label="Back to Items"
      />

      <!-- Header -->
      <UiDetailPageHeader
        :title="item.name"
        :badges="[
          { label: item.item_type.name, color: itemTypeColor, variant: 'subtle', size: 'lg' },
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
          ...(item.strength_requirement ? [{ icon: 'i-heroicons-hand-raised', label: 'Strength Required', value: String(item.strength_requirement) }] : []),
          ...(item.charges_max ? [{ icon: 'i-heroicons-bolt-slash', label: 'Charges', value: String(item.charges_max), subtext: item.recharge_formula && item.recharge_timing ? `Recharge: ${item.recharge_formula} at ${item.recharge_timing}` : undefined }] : [])
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
          <p class="whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {{ item.description }}
          </p>
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
          ...(item.proficiencies && item.proficiencies.length > 0 ? [{
            label: 'Proficiencies',
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(item.abilities && item.abilities.length > 0 ? [{
            label: 'Abilities',
            slot: 'abilities',
            defaultOpen: false
          }] : []),
          ...(item.spells && item.spells.length > 0 ? [{
            label: 'Spells',
            slot: 'spells',
            defaultOpen: false
          }] : []),
          ...(item.random_tables && item.random_tables.length > 0 ? [{
            label: 'Random Tables',
            slot: 'random_tables',
            defaultOpen: false
          }] : []),
          ...(item.saving_throws && item.saving_throws.length > 0 ? [{
            label: 'Saving Throws',
            slot: 'saving_throws',
            defaultOpen: false
          }] : []),
          ...(item.sources && item.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : []),
          ...(item.tags && item.tags.length > 0 ? [{
            label: 'Tags',
            slot: 'tags',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Properties Slot -->
        <template
          v-if="item.properties && item.properties.length > 0"
          #properties
        >
          <UiAccordionPropertiesList :properties="item.properties" />
        </template>

        <!-- Modifiers Slot -->
        <template
          v-if="item.modifiers && item.modifiers.length > 0"
          #modifiers
        >
          <UiModifiersDisplay :modifiers="item.modifiers" />
        </template>

        <!-- Proficiencies Slot -->
        <template
          v-if="item.proficiencies && item.proficiencies.length > 0"
          #proficiencies
        >
          <UiAccordionBulletList :items="item.proficiencies" />
        </template>

        <!-- Abilities Slot -->
        <template
          v-if="item.abilities && item.abilities.length > 0"
          #abilities
        >
          <UiAccordionAbilitiesList :abilities="item.abilities" />
        </template>

        <!-- Spells Slot -->
        <template
          v-if="item.spells && item.spells.length > 0"
          #spells
        >
          <UiAccordionItemSpells :spells="item.spells" />
        </template>

        <!-- Random Tables Slot -->
        <template
          v-if="item.random_tables && item.random_tables.length > 0"
          #random_tables
        >
          <UiAccordionRandomTablesList :tables="item.random_tables" />
        </template>

        <!-- Saving Throws Slot -->
        <template
          v-if="item.saving_throws && item.saving_throws.length > 0"
          #saving_throws
        >
          <UiAccordionSavingThrows :saving-throws="item.saving_throws" />
        </template>

        <!-- Source Slot -->
        <template
          v-if="item.sources && item.sources.length > 0"
          #source
        >
          <UiSourceDisplay :sources="item.sources" />
        </template>

        <!-- Tags Slot -->
        <template
          v-if="item.tags && item.tags.length > 0"
          #tags
        >
          <UiTagsDisplay :tags="item.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="item"
        title="Item Data"
      />
    </div>
  </div>
</template>

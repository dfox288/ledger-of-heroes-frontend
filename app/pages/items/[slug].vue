<script setup lang="ts">
import type { Item } from '~/types/api/entities'
import { getItemRarityColor, getItemTypeColor } from '~/utils/badgeColors'

const route = useRoute()

// Fetch item data and setup SEO
const { data: item, loading, error } = useEntityDetail<Item>({
  slug: route.params.slug as string,
  endpoint: '/items',
  cacheKey: 'item',
  seo: {
    titleTemplate: name => `${name} - D&D 5e Item`,
    descriptionExtractor: (item: unknown) => {
      const i = item as { description?: string }
      return i.description?.substring(0, 160) || ''
    },
    fallbackTitle: 'Item - D&D 5e Compendium'
  }
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

/**
 * Get entity image path (512px variant)
 */
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!item.value) return null
  return getImagePath('items', item.value.slug, 512)
})

/**
 * Format proficiency category for display
 * Converts "martial_melee" to "Martial Melee"
 */
const proficiencyCategoryText = computed(() => {
  if (!item.value?.proficiency_category) return null
  return item.value.proficiency_category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

/**
 * Format magic bonus for display
 * Converts "2" to "+2"
 */
const magicBonusText = computed(() => {
  if (!item.value?.magic_bonus) return null
  return `+${item.value.magic_bonus}`
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <UiDetailPageLoading
      v-if="loading"
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
      <UiDetailBreadcrumb
        list-path="/items"
        list-label="Items"
        :current-label="item.name"
      />

      <!-- Header -->
      <UiDetailPageHeader
        :title="item.name"
        :badges="[
          { label: item.item_type?.name || 'Unknown', color: itemTypeColor, variant: 'subtle' as const, size: 'lg' as const },
          { label: rarityText, color: rarityColor, variant: 'subtle' as const, size: 'lg' as const },
          ...(magicBonusText ? [{ label: magicBonusText, color: 'primary' as const, variant: 'solid' as const, size: 'lg' as const }] : []),
          ...(proficiencyCategoryText ? [{ label: proficiencyCategoryText, color: 'item' as const, variant: 'subtle' as const, size: 'md' as const }] : []),
          ...(item.is_magic ? [{ label: '✨ Magic', color: 'primary' as const, variant: 'soft' as const, size: 'sm' as const }] : []),
          ...(item.requires_attunement ? [{ label: '🔮 Attunement', color: 'info' as const, variant: 'soft' as const, size: 'sm' as const }] : [])
        ]"
      />

      <!-- Quick Stats (2/3) + Image (1/3) Side-by-Side -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Stats - 2/3 width on large screens -->
        <div class="lg:col-span-2">
          <UiDetailQuickStatsCard
            :columns="2"
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
        </div>

        <!-- Standalone Image - 1/3 width on large screens -->
        <div class="lg:col-span-1">
          <UiDetailEntityImage
            v-if="imagePath"
            :image-path="imagePath"
            :image-alt="`${item.name} item illustration`"
          />
        </div>
      </div>

      <!-- Description -->
      <UiDetailDescriptionCard
        v-if="item.description"
        :description="item.description"
      />

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(item.detail ? [{
            label: 'Additional Details',
            slot: 'detail',
            defaultOpen: false
          }] : []),
          ...(item.prerequisites && item.prerequisites.length > 0 ? [{
            label: 'Prerequisites',
            slot: 'prerequisites',
            defaultOpen: false
          }] : []),
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
          ...(item.data_tables && item.data_tables.length > 0 ? [{
            label: 'Data Tables',
            slot: 'data-tables',
            defaultOpen: false
          }] : []),
          ...(item.saving_throws && item.saving_throws.length > 0 ? [{
            label: 'Saving Throws',
            slot: 'saving-throws',
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
        <!-- Detail Slot -->
        <template
          v-if="item.detail"
          #detail
        >
          <UiAccordionItemDetail :detail="item.detail" />
        </template>

        <!-- Prerequisites Slot -->
        <template
          v-if="item.prerequisites && item.prerequisites.length > 0"
          #prerequisites
        >
          <UiAccordionPrerequisites :prerequisites="item.prerequisites" />
        </template>

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

        <!-- Data Tables Slot -->
        <template
          v-if="item.data_tables && item.data_tables.length > 0"
          #data-tables
        >
          <UiAccordionRandomTablesList :tables="item.data_tables" />
        </template>

        <!-- Saving Throws Slot -->
        <template
          v-if="item.saving_throws && item.saving_throws.length > 0"
          #saving-throws
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

      <!-- Bottom Navigation -->
      <UiDetailPageBottomNav
        to="/items"
        label="Back to Items"
      />

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="item"
        title="Item Data"
      />
    </div>
  </div>
</template>

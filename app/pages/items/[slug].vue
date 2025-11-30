<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Use the new composable for all derived data
const {
  entity,
  pending: loading,
  error,
  isWeapon,
  isArmor,
  isShield,
  isCharged,
  hasSpells,
  requiresAttunement,
  attunementText,
  spellsByChargeCost,
  costDisplay
} = useItemDetail(slug)

// Alias entity as item for template clarity
const item = entity

// Get entity image path
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!item.value) return null
  return getImagePath('items', item.value.slug, 512)
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

      <!-- Hero Section (Name, Badges, Image) -->
      <ItemHero
        :item="item"
        :image-path="imagePath"
      />

      <!-- Weapon Stats (Conditional - Only for weapons) -->
      <ItemWeaponStats
        v-if="isWeapon"
        :damage-dice="item.damage_dice"
        :versatile-damage="item.versatile_damage"
        :damage-type="item.damage_type || null"
        :range-normal="item.range_normal"
        :range-long="item.range_long"
        :weight="item.weight !== null ? String(item.weight) : null"
        :properties="item.properties || []"
      />

      <!-- Armor Stats (Conditional - Only for armor/shields) -->
      <ItemArmorStats
        v-if="isArmor || isShield"
        :armor-class="item.armor_class"
        :strength-requirement="item.strength_requirement"
        :stealth-disadvantage="item.stealth_disadvantage ?? false"
        :modifiers="item.modifiers || []"
        :is-shield="isShield"
      />

      <!-- Magic Section (Conditional - Only for charged or attunement items) -->
      <ItemMagicSection
        v-if="isCharged || requiresAttunement"
        :charges-max="item.charges_max !== null ? String(item.charges_max) : null"
        :recharge-formula="item.recharge_formula"
        :recharge-timing="item.recharge_timing"
        :attunement-text="attunementText"
        :modifiers="item.modifiers || []"
      />

      <!-- Spells Table (Conditional - Only for items with spells) -->
      <ItemSpellsTable
        v-if="hasSpells"
        :spells-by-charge-cost="spellsByChargeCost"
      />

      <!-- Description (Always) -->
      <UiDetailDescriptionCard
        v-if="item.description"
        :description="item.description"
      />

      <!-- Quick Info Row (Cost, Weight, Source) -->
      <ItemQuickInfo
        :cost="costDisplay"
        :weight="item.weight !== null ? `${item.weight} lb` : null"
        :sources="item.sources || []"
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

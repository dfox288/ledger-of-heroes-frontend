<script setup lang="ts">
/**
 * Class Detail - Overview View
 *
 * Default view showing quick stats, combat basics, spellcasting summary,
 * class resources, subclass gallery, and feature preview.
 */

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const {
  entity,
  pending,
  error,
  isSubclass,
  parentClass,
  features,
  counters,
  hitPoints,
  savingThrows,
  armorProficiencies,
  weaponProficiencies,
  skillChoices,
  equipment,
  traits,
  subclasses,
  subclassLevel,
  subclassName,
  spellcastingAbility,
  isCaster,
  levelProgression
} = useClassDetail(slug)

/**
 * Accordion items for collapsed sections
 */
const accordionItems = computed(() => {
  const items = []

  // Equipment (if available)
  if (equipment.value && equipment.value.length > 0) {
    items.push({
      label: 'Starting Equipment',
      icon: 'i-heroicons-cube',
      defaultOpen: false,
      slot: 'equipment'
    })
  }

  // Skill Choices (if available)
  if (skillChoices.value && skillChoices.value.length > 0) {
    items.push({
      label: 'Skill Choices',
      icon: 'i-heroicons-academic-cap',
      defaultOpen: false,
      slot: 'skills'
    })
  }

  // Class Lore / Traits (if available)
  if (traits.value && traits.value.length > 0) {
    items.push({
      label: 'Class Lore',
      icon: 'i-heroicons-book-open',
      defaultOpen: false,
      slot: 'lore'
    })
  }

  return items
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading -->
    <UiDetailPageLoading
      v-if="pending"
      entity-type="class"
    />

    <!-- Error -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Class"
    />

    <!-- Content -->
    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Shared Header -->
      <ClassDetailHeader
        :entity="entity"
        :is-subclass="isSubclass"
        :parent-class="parentClass"
      />

      <!-- View Navigation -->
      <ClassViewNavigation :slug="slug" />

      <!-- Overview Content -->
      <div class="space-y-6">
        <!-- Combat Basics Grid -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Combat Basics
          </h2>
          <ClassOverviewCombatBasicsGrid
            :hit-points="hitPoints"
            :saving-throws="savingThrows"
            :armor-proficiencies="armorProficiencies"
            :weapon-proficiencies="weaponProficiencies"
          />
        </section>

        <!-- Spellcasting Card (conditional) -->
        <section v-if="isCaster && spellcastingAbility && levelProgression.length > 0">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Spellcasting
          </h2>
          <ClassOverviewSpellcastingCard
            :spellcasting-ability="spellcastingAbility"
            :level-progression="levelProgression"
            :slug="slug"
          />
        </section>

        <!-- Class Resources Card (conditional) -->
        <section v-if="counters.length > 0">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Class Resources
          </h2>
          <ClassOverviewResourcesCard :counters="counters" />
        </section>

        <!-- Subclass Gallery (only for base classes with subclasses) -->
        <section v-if="!isSubclass && subclasses.length > 0">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                {{ subclassName }}
              </h2>
              <p
                v-if="subclassLevel"
                class="text-sm text-gray-600 dark:text-gray-400 mt-1"
              >
                Choose at Level {{ subclassLevel }}
              </p>
            </div>
          </div>
          <UiClassSubclassCards
            :subclasses="subclasses"
            base-path="/classes"
          />
        </section>

        <!-- Key Features Preview -->
        <section>
          <ClassOverviewFeaturesPreview
            :features="features"
            :slug="slug"
          />
        </section>

        <!-- Collapsed Accordions -->
        <section v-if="accordionItems.length > 0">
          <UAccordion :items="accordionItems">
            <!-- Equipment Slot -->
            <template #equipment>
              <UiAccordionEquipmentList
                :equipment="equipment"
                type="class"
              />
            </template>

            <!-- Skills Slot -->
            <template #skills>
              <UiAccordionBulletList :items="skillChoices" />
            </template>

            <!-- Lore Slot -->
            <template #lore>
              <UiAccordionTraitsList :traits="traits" />
            </template>
          </UAccordion>
        </section>
      </div>

      <!-- Debug Panel -->
      <JsonDebugPanel
        :data="entity"
        title="Class Data"
      />
    </div>
  </div>
</template>

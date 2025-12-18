<script setup lang="ts">
/**
 * Race Detail - Overview View
 *
 * Default view showing quick stats, ability score increases, senses, resistances,
 * description, key traits preview, innate spellcasting, languages, proficiencies,
 * and subrace gallery.
 */

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const {
  entity,
  pending,
  error,
  isSubrace,
  parentRace,
  inheritedData,
  abilityScoreIncreases,
  abilityScoreChoices,
  damageResistances,
  speciesTraits,
  descriptionTraits,
  senses,
  spells,
  subraces,
  languages,
  proficiencies,
  conditions,
  tags
} = useRaceDetail(slug)

/**
 * Accordion items for collapsed sections
 */
const accordionItems = computed(() => {
  const items = []

  // Languages (if available)
  if (languages.value && languages.value.length > 0) {
    items.push({
      label: 'Languages',
      icon: 'i-heroicons-language',
      defaultOpen: false,
      slot: 'languages'
    })
  }

  // Proficiencies (if available)
  if (proficiencies.value && proficiencies.value.length > 0) {
    items.push({
      label: 'Proficiencies',
      icon: 'i-heroicons-shield-check',
      defaultOpen: false,
      slot: 'proficiencies'
    })
  }

  // Condition Defenses (if available)
  if (conditions.value && conditions.value.length > 0) {
    items.push({
      label: 'Condition Defenses',
      icon: 'i-heroicons-shield-exclamation',
      defaultOpen: false,
      slot: 'conditions'
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
      entity-type="race"
    />

    <!-- Error -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Race"
    />

    <!-- Content -->
    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Shared Header -->
      <RaceDetailHeader
        :entity="entity"
        :is-subrace="isSubrace"
        :parent-race="parentRace"
        :tags="tags"
      />

      <!-- View Navigation -->
      <RaceViewNavigation :slug="slug" />

      <!-- Inherited Data Section (only for subraces with inherited data) -->
      <section v-if="isSubrace && parentRace && inheritedData">
        <RaceOverviewInheritedDataSection
          :parent-race-name="parentRace.name"
          :parent-race-slug="parentRace.slug"
          :inherited-data="inheritedData"
        />
      </section>

      <!-- Overview Content -->
      <div class="space-y-6">
        <!-- Quick Stats + ASI Card -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Quick Stats Card -->
          <UiDetailQuickStatsCard
            :columns="2"
            :stats="[
              ...(entity.size ? [{ icon: 'i-heroicons-user', label: 'Size', value: entity.size.name }] : []),
              ...(entity.speed ? [{ icon: 'i-heroicons-bolt', label: 'Speed', value: `${entity.speed} ft.` }] : []),
              ...(entity.fly_speed ? [{ icon: 'i-heroicons-arrow-up', label: 'Fly Speed', value: `${entity.fly_speed} ft.` }] : []),
              ...(entity.swim_speed ? [{ icon: 'i-heroicons-sparkles', label: 'Swim Speed', value: `${entity.swim_speed} ft.` }] : []),
              ...(entity.climb_speed ? [{ icon: 'i-heroicons-arrow-trending-up', label: 'Climb Speed', value: `${entity.climb_speed} ft.` }] : [])
            ]"
          />

          <!-- Ability Score Increases Card -->
          <RaceOverviewAbilityScoresCard
            v-if="abilityScoreIncreases.length > 0 || abilityScoreChoices.length > 0"
            :modifiers="abilityScoreIncreases"
            :choices="abilityScoreChoices"
          />
        </div>

        <!-- Senses Display (conditional) -->
        <section v-if="senses.length > 0">
          <RaceOverviewSensesDisplay :senses="senses" />
        </section>

        <!-- Damage Resistances Display (conditional) -->
        <section v-if="damageResistances.length > 0">
          <RaceOverviewResistancesDisplay :resistances="damageResistances" />
        </section>

        <!-- Description -->
        <UiDetailDescriptionCard
          v-if="entity.description"
          :description="entity.description"
        />

        <!-- Racial Lore Preview -->
        <section v-if="descriptionTraits.length > 0">
          <RaceOverviewLorePreview
            :traits="descriptionTraits"
            :slug="slug"
            :max-display="3"
          />
        </section>

        <!-- Key Traits Preview (species category only) -->
        <section v-if="!isSubrace && speciesTraits.length > 0">
          <RaceOverviewTraitsPreview
            :traits="speciesTraits"
            :slug="slug"
          />
        </section>

        <!-- Innate Spellcasting (conditional) -->
        <section v-if="spells.length > 0">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Innate Spellcasting
          </h2>
          <RaceOverviewSpellsCard :spells="spells" />
        </section>

        <!-- Collapsed Accordions -->
        <section v-if="accordionItems.length > 0">
          <UAccordion :items="accordionItems">
            <!-- Languages Slot -->
            <template #languages>
              <UiAccordionBadgeList
                :items="languages"
                color="neutral"
              />
            </template>

            <!-- Proficiencies Slot -->
            <template #proficiencies>
              <UiAccordionBulletList :items="proficiencies" />
            </template>

            <!-- Conditions Slot -->
            <template #conditions>
              <UiAccordionConditions
                :conditions="conditions"
                entity-type="race"
              />
            </template>
          </UAccordion>
        </section>

        <!-- Subrace Gallery (only for base races with subraces) -->
        <section v-if="!isSubrace && subraces.length > 0">
          <div class="mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
              Subraces
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose a subrace to further customize your {{ entity.name }} character
            </p>
          </div>
          <UiRaceSubraceCards
            :subraces="subraces"
            base-path="/races"
          />
        </section>
      </div>

      <!-- Bottom Navigation -->
      <UiDetailPageBottomNav
        to="/races"
        label="Back to Races"
      />

      <!-- Debug Panel -->
      <JsonDebugPanel
        :data="entity"
        title="Race Data"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const {
  entity,
  pending,
  error,
  isHalfFeat,
  abilityModifiers,
  grantedProficiencies,
  advantages,
  hasBenefits,
  hasPrerequisites,
  prerequisitesList,
  relatedVariants,
  spells,
  spellChoices,
  hasSpells,
  sources,
  tags
} = useFeatDetail(slug)

// Image path
const { getImagePath } = useEntityImage()
const imagePath = computed(() => {
  if (!entity.value) return null
  return getImagePath('feats', entity.value.slug, 512)
})

// Header badges
const headerBadges = computed(() => {
  const badges: Array<{
    label: string
    color: 'warning' | 'success' | 'primary'
    variant: 'subtle'
    size: 'lg'
  }> = [
    { label: 'Feat', color: 'warning', variant: 'subtle', size: 'lg' }
  ]

  if (isHalfFeat.value) {
    badges.push({ label: 'Half-Feat', color: 'success', variant: 'subtle', size: 'lg' })
  }

  // Add ability modifier badges
  abilityModifiers.value.forEach((mod) => {
    badges.push({
      label: `+${mod.value} ${mod.code}`,
      color: 'primary',
      variant: 'subtle',
      size: 'lg'
    })
  })

  return badges
})

// Accordion items
const accordionItems = computed(() => {
  const items = []

  if (sources.value.length > 0) {
    items.push({
      label: 'Source',
      icon: 'i-heroicons-book-open',
      defaultOpen: false,
      slot: 'source'
    })
  }

  if (tags.value.length > 0) {
    items.push({
      label: 'Tags',
      icon: 'i-heroicons-tag',
      defaultOpen: false,
      slot: 'tags'
    })
  }

  return items
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading -->
    <UiDetailPageLoading
      v-if="pending"
      entity-type="feat"
    />

    <!-- Error -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Feat"
    />

    <!-- Content -->
    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Breadcrumb -->
      <UiDetailBreadcrumb
        list-path="/feats"
        list-label="Feats"
        :current-label="entity.name"
      />

      <!-- Header -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="headerBadges"
      />

      <!-- Prerequisites (full width, only if present) -->
      <UCard v-if="hasPrerequisites">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Prerequisites
          </h2>
        </template>
        <ul class="space-y-2">
          <li
            v-for="(prereq, idx) in prerequisitesList"
            :key="idx"
            class="text-gray-700 dark:text-gray-300"
          >
            • {{ prereq }}
          </li>
        </ul>
      </UCard>

      <!-- Hero Section: Benefits + Spells + Image side-by-side -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Benefits + Spells (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          <FeatBenefitsGrid
            v-if="hasBenefits"
            :ability-modifiers="abilityModifiers"
            :granted-proficiencies="grantedProficiencies"
            :advantages="advantages"
          />
          <FeatGrantedSpells
            v-if="hasSpells"
            :spells="spells"
            :spell-choices="spellChoices"
          />
        </div>

        <!-- Right Column: Image (1/3 width) -->
        <div class="lg:col-span-1">
          <UiDetailEntityImage
            :image-path="imagePath"
            :image-alt="`${entity.name} feat illustration`"
          />
        </div>
      </div>

      <!-- Description -->
      <UiDetailDescriptionCard
        v-if="entity.description"
        :description="entity.description"
      />

      <!-- Related Variants -->
      <FeatVariantsSection
        :variants="relatedVariants"
        :current-slug="entity.slug"
      />

      <!-- Accordions -->
      <UAccordion
        v-if="accordionItems.length > 0"
        :items="accordionItems"
        type="multiple"
      >
        <template #source>
          <UiSourceDisplay :sources="sources" />
        </template>
        <template #tags>
          <UiTagsDisplay :tags="tags" />
        </template>
      </UAccordion>

      <!-- Bottom Nav -->
      <UiDetailPageBottomNav
        to="/feats"
        label="Back to Feats"
      />

      <!-- Debug -->
      <JsonDebugPanel
        :data="entity"
        title="Feat Data"
      />
    </div>
  </div>
</template>

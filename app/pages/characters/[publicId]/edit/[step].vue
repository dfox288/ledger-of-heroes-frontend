<script setup lang="ts">
import type { Component } from 'vue'
import WizardLayout from '~/components/character/wizard/WizardLayout.vue'

/**
 * Character Edit Wizard - Dynamic Step Router
 *
 * Handles editing of existing characters by publicId.
 * Loads character from URL param on page load/refresh.
 *
 * URL: /characters/:publicId/edit/:step
 * Example: /characters/shadow-warden-q3x9/edit/race
 */

// ════════════════════════════════════════════════════════════════
// STEP REGISTRY
// ════════════════════════════════════════════════════════════════

/**
 * Map step URL segments to their corresponding components
 * Using defineAsyncComponent for lazy loading each step
 */
const stepComponents: Record<string, Component> = {
  sourcebooks: defineAsyncComponent(() => import('~/components/character/wizard/StepSourcebooks.vue')),
  race: defineAsyncComponent(() => import('~/components/character/wizard/StepRace.vue')),
  subrace: defineAsyncComponent(() => import('~/components/character/wizard/StepSubrace.vue')),
  class: defineAsyncComponent(() => import('~/components/character/wizard/StepClass.vue')),
  subclass: defineAsyncComponent(() => import('~/components/character/wizard/StepSubclass.vue')),
  background: defineAsyncComponent(() => import('~/components/character/wizard/StepBackground.vue')),
  feats: defineAsyncComponent(() => import('~/components/character/wizard/StepFeats.vue')),
  abilities: defineAsyncComponent(() => import('~/components/character/wizard/StepAbilities.vue')),
  proficiencies: defineAsyncComponent(() => import('~/components/character/wizard/StepProficiencies.vue')),
  languages: defineAsyncComponent(() => import('~/components/character/wizard/StepLanguages.vue')),
  equipment: defineAsyncComponent(() => import('~/components/character/wizard/StepEquipment.vue')),
  spells: defineAsyncComponent(() => import('~/components/character/wizard/StepSpells.vue')),
  details: defineAsyncComponent(() => import('~/components/character/wizard/StepDetails.vue')),
  review: defineAsyncComponent(() => import('~/components/character/wizard/StepReview.vue'))
}

// ════════════════════════════════════════════════════════════════
// ROUTE HANDLING
// ════════════════════════════════════════════════════════════════

const route = useRoute()
const store = useCharacterWizardStore()

/**
 * Extract route params
 */
const publicId = computed(() => route.params.publicId as string)
const stepName = computed(() => route.params.step as string)

/**
 * Resolved component for the current step
 */
const stepComponent = computed(() => stepComponents[stepName.value] ?? null)

/**
 * Handle invalid step - throw 404 error
 */
if (!stepComponent.value) {
  throw createError({
    statusCode: 404,
    message: `Unknown wizard step: ${stepName.value}`
  })
}

// ════════════════════════════════════════════════════════════════
// CHARACTER LOADING
// ════════════════════════════════════════════════════════════════

/**
 * Load character from backend if not already in store
 * This handles page refresh and direct navigation to edit URLs
 */
const { pending: loading, error } = await useAsyncData(
  `character-edit-${publicId.value}`,
  async () => {
    // Only load if not already in store with matching publicId
    if (store.publicId !== publicId.value || !store.characterId) {
      await store.loadCharacter(publicId.value)
    }
    return { loaded: true }
  },
  { immediate: true }
)

// Handle load error
if (error.value) {
  throw createError({
    statusCode: 404,
    message: `Character not found: ${publicId.value}`
  })
}

// ════════════════════════════════════════════════════════════════
// SEO
// ════════════════════════════════════════════════════════════════

/**
 * Capitalize first letter for page title
 */
const stepTitle = computed(() =>
  stepName.value.charAt(0).toUpperCase() + stepName.value.slice(1)
)

const characterName = computed(() =>
  store.selections.name || 'Character'
)

useSeoMeta({
  title: () => `Edit ${characterName.value} - ${stepTitle.value}`
})
</script>

<template>
  <WizardLayout>
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-16"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary-500"
      />
    </div>

    <!-- Step component -->
    <component
      :is="stepComponent"
      v-else
    />
  </WizardLayout>
</template>

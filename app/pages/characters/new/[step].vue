<script setup lang="ts">
import type { Component } from 'vue'
import WizardLayout from '~/components/character/wizard/WizardLayout.vue'

/**
 * Character Creation Wizard - Dynamic Step Router
 *
 * Renders the appropriate wizard step component based on the URL parameter.
 * Uses WizardLayout to provide consistent navigation and progress tracking.
 */

// ════════════════════════════════════════════════════════════════
// STEP REGISTRY
// ════════════════════════════════════════════════════════════════

/**
 * Map step URL segments to their corresponding components
 * Using defineAsyncComponent for lazy loading each step
 */
const stepComponents: Record<string, Component> = {
  'sourcebooks': defineAsyncComponent(() => import('~/components/character/wizard/StepSourcebooks.vue')),
  'race': defineAsyncComponent(() => import('~/components/character/wizard/StepRace.vue')),
  'subrace': defineAsyncComponent(() => import('~/components/character/wizard/StepSubrace.vue')),
  'size': defineAsyncComponent(() => import('~/components/character/wizard/StepSize.vue')),
  'class': defineAsyncComponent(() => import('~/components/character/wizard/StepClass.vue')),
  'subclass': defineAsyncComponent(() => import('~/components/character/wizard/StepSubclass.vue')),
  'background': defineAsyncComponent(() => import('~/components/character/wizard/StepBackground.vue')),
  'feats': defineAsyncComponent(() => import('~/components/character/wizard/StepFeats.vue')),
  'abilities': defineAsyncComponent(() => import('~/components/character/wizard/StepAbilities.vue')),
  'proficiencies': defineAsyncComponent(() => import('~/components/character/wizard/StepProficiencies.vue')),
  'feature-choices': defineAsyncComponent(() => import('~/components/character/wizard/StepFeatureChoices.vue')),
  'languages': defineAsyncComponent(() => import('~/components/character/wizard/StepLanguages.vue')),
  'equipment': defineAsyncComponent(() => import('~/components/character/wizard/StepEquipment.vue')),
  'spells': defineAsyncComponent(() => import('~/components/character/wizard/StepSpells.vue')),
  'details': defineAsyncComponent(() => import('~/components/character/wizard/StepDetails.vue')),
  'review': defineAsyncComponent(() => import('~/components/character/wizard/StepReview.vue'))
}

// ════════════════════════════════════════════════════════════════
// ROUTE HANDLING
// ════════════════════════════════════════════════════════════════

const route = useRoute()

/**
 * Current step name from URL parameter
 */
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
// SEO
// ════════════════════════════════════════════════════════════════

/**
 * Capitalize first letter for page title
 */
const stepTitle = computed(() =>
  stepName.value.charAt(0).toUpperCase() + stepName.value.slice(1)
)

useSeoMeta({
  title: () => `Create Character - ${stepTitle.value}`
})
</script>

<template>
  <WizardLayout>
    <component :is="stepComponent" />
  </WizardLayout>
</template>

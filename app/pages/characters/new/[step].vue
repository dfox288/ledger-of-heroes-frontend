<script setup lang="ts">
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
 * Map step URL segments to their corresponding component names
 * Components are auto-imported by Nuxt
 */
const stepComponents: Record<string, string> = {
  sourcebooks: 'CharacterWizardStepSourcebooks',
  race: 'CharacterWizardStepRace',
  subrace: 'CharacterWizardStepSubrace',
  class: 'CharacterWizardStepClass',
  subclass: 'CharacterWizardStepSubclass',
  background: 'CharacterWizardStepBackground',
  abilities: 'CharacterWizardStepAbilities',
  proficiencies: 'CharacterWizardStepProficiencies',
  languages: 'CharacterWizardStepLanguages',
  equipment: 'CharacterWizardStepEquipment',
  spells: 'CharacterWizardStepSpells',
  details: 'CharacterWizardStepDetails',
  review: 'CharacterWizardStepReview',
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
const stepComponent = computed(() => {
  const componentName = stepComponents[stepName.value]
  return componentName ? resolveComponent(componentName) : null
})

/**
 * Handle invalid step - throw 404 error
 */
if (!stepComponent.value) {
  throw createError({
    statusCode: 404,
    message: `Unknown wizard step: ${stepName.value}`,
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
  title: () => `Create Character - ${stepTitle.value}`,
})
</script>

<template>
  <CharacterWizardWizardLayout>
    <component :is="stepComponent" />
  </CharacterWizardWizardLayout>
</template>

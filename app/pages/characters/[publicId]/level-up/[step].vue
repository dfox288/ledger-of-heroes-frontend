<script setup lang="ts">
import type { Component } from 'vue'
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import { useLevelUpWizard } from '~/composables/useLevelUpWizard'

/**
 * Level-Up Wizard - Dynamic Step Router
 *
 * Renders the appropriate wizard step component based on the URL parameter.
 * URL is the source of truth for current step (matches character creation pattern).
 */

// ════════════════════════════════════════════════════════════════
// STEP REGISTRY
// ════════════════════════════════════════════════════════════════

/**
 * Map step URL segments to their corresponding components
 * Using defineAsyncComponent for lazy loading each step
 */
const stepComponents: Record<string, Component> = {
  // Level-up specific steps
  'class-selection': defineAsyncComponent(() => import('~/components/character/levelup/StepClassSelection.vue')),
  'subclass': defineAsyncComponent(() => import('~/components/character/levelup/StepSubclassChoice.vue')),
  'subclass-variant': defineAsyncComponent(() => import('~/components/character/levelup/StepSubclassVariant.vue')),
  'hit-points': defineAsyncComponent(() => import('~/components/character/levelup/StepHitPoints.vue')),
  'summary': defineAsyncComponent(() => import('~/components/character/levelup/StepSummary.vue')),
  // Level-up specific ASI/Feat step - fixes #690 (choice type mismatch)
  'asi-feat': defineAsyncComponent(() => import('~/components/character/levelup/StepAsiFeat.vue')),
  'feature-choices': defineAsyncComponent(() => import('~/components/character/wizard/StepFeatureChoices.vue')),
  'spells': defineAsyncComponent(() => import('~/components/character/wizard/StepSpells.vue')),
  'languages': defineAsyncComponent(() => import('~/components/character/wizard/StepLanguages.vue')),
  'proficiencies': defineAsyncComponent(() => import('~/components/character/wizard/StepProficiencies.vue'))
}

// ════════════════════════════════════════════════════════════════
// ROUTE HANDLING
// ════════════════════════════════════════════════════════════════

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)
const stepName = computed(() => route.params.step as string)

const store = useCharacterLevelUpStore()

// ════════════════════════════════════════════════════════════════
// WIZARD NAVIGATION
// ════════════════════════════════════════════════════════════════

// Pass refs (not .value) to maintain reactivity when route changes
const {
  activeSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  previousStep,
  progressPercent,
  getStepUrl
} = useLevelUpWizard({
  publicId,
  currentStep: stepName
})

// ════════════════════════════════════════════════════════════════
// GUARDS
// ════════════════════════════════════════════════════════════════

// Redirect to preview if no level-up in progress
if (!store.levelUpResult && !store.pendingChoices.length) {
  await navigateTo(`/characters/${publicId.value}/level-up`)
}

// Redirect to first valid step if current step is invalid
const stepComponent = computed(() => stepComponents[stepName.value] ?? null)
if (!stepComponent.value) {
  throw createError({
    statusCode: 404,
    message: `Unknown level-up step: ${stepName.value}`
  })
}

// ════════════════════════════════════════════════════════════════
// NAVIGATION HANDLERS
// ════════════════════════════════════════════════════════════════

async function handleBack() {
  if (isFirstStep.value) {
    await navigateTo(`/characters/${publicId.value}`)
  } else {
    await previousStep()
  }
}

async function handleNext() {
  await nextStep()
}

function handleComplete() {
  store.reset()
  navigateTo(`/characters/${publicId.value}`)
}

// ════════════════════════════════════════════════════════════════
// SEO
// ════════════════════════════════════════════════════════════════

const stepTitle = computed(() =>
  stepName.value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
)

useSeoMeta({
  title: () => `Level Up - ${stepTitle.value}`
})
</script>

<template>
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar - uses unified WizardSidebar component (#625) -->
    <CharacterWizardWizardSidebar
      title="Level Up"
      :active-steps="activeSteps"
      :current-step="stepName"
      :get-step-url="getStepUrl"
      class="w-64 flex-shrink-0 hidden lg:block"
    />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-heroicons-arrow-left"
            :to="`/characters/${publicId}`"
          />
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            Level Up - {{ stepTitle }}
          </h1>
        </div>
        <div class="text-sm text-gray-500">
          {{ progressPercent }}% complete
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 p-6 overflow-y-auto">
        <Suspense>
          <component
            :is="stepComponent"
            :character-id="store.characterId"
            :public-id="publicId"
            :next-step="nextStep"
            :refresh-after-save="store.refreshChoices"
            @complete="handleComplete"
          />
          <template #fallback>
            <div class="flex items-center justify-center py-12">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-8 h-8 animate-spin text-primary"
              />
            </div>
          </template>
        </Suspense>
      </main>

      <!-- Footer Navigation -->
      <footer class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex justify-between max-w-4xl mx-auto">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-heroicons-arrow-left"
            @click="handleBack"
          >
            {{ isFirstStep ? 'Cancel' : 'Back' }}
          </UButton>

          <UButton
            v-if="!isLastStep && stepName !== 'summary'"
            color="primary"
            trailing-icon="i-heroicons-arrow-right"
            @click="handleNext"
          >
            Continue
          </UButton>
        </div>
      </footer>
    </div>
  </div>
</template>

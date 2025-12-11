<!-- app/pages/characters/[publicId]/level-up/index.vue -->
<script setup lang="ts">
/**
 * Level-Up Wizard Page
 *
 * Page-based level-up flow for existing characters.
 * Handles single-class auto-advancement and step navigation.
 *
 * URL: /characters/:publicId/level-up
 */
import { useCharacterLevelUpStore, type CharacterClassEntry } from '~/stores/characterLevelUp'
import { useLevelUpWizard } from '~/composables/useLevelUpWizard'

const route = useRoute()
const router = useRouter()
const publicId = computed(() => route.params.publicId as string)

const store = useCharacterLevelUpStore()
const { nextStep, previousStep, isFirstStep, isLastStep } = useLevelUpWizard()

// ════════════════════════════════════════════════════════════════
// FETCH CHARACTER DATA
// ════════════════════════════════════════════════════════════════

const { apiFetch } = useApi()

const { data: characterData, pending: loading, error } = await useAsyncData(
  `level-up-character-${publicId.value}`,
  () => apiFetch<{ data: { id: number, public_id: string, name: string, classes: any[], is_complete: boolean } }>(
    `/characters/${publicId.value}`
  )
)

const character = computed(() => characterData.value?.data ?? null)

// ════════════════════════════════════════════════════════════════
// INITIALIZE STORE ON MOUNT
// ════════════════════════════════════════════════════════════════

const isInitializing = ref(true)
const initError = ref<string | null>(null)

// Character stats for HP calculation
const characterStats = ref<{ constitution_modifier: number } | null>(null)

onMounted(async () => {
  if (!character.value) {
    initError.value = 'Character not found'
    isInitializing.value = false
    return
  }

  // Map API classes to store format
  const classEntries: CharacterClassEntry[] = (character.value.classes ?? []).map(c => ({
    class: c.class,
    level: c.level,
    subclass: c.subclass ? { name: c.subclass.name, slug: c.subclass.slug } : null,
    is_primary: c.is_primary
  }))

  const totalLevel = character.value.classes?.reduce((sum, c) => sum + (c.level || 0), 0) ?? 1

  // Initialize the store (without opening modal)
  store.characterId = character.value.id
  store.publicId = character.value.public_id
  store.characterClasses = classEntries
  store.totalLevel = totalLevel
  store.currentStepName = 'class-selection'
  store.levelUpResult = null
  store.selectedClassSlug = null
  store.error = null
  store.isOpen = true // Mark as "open" for step visibility calculations

  // Fetch character stats for HP calculation
  try {
    const statsResponse = await apiFetch<{ data: { constitution_modifier: number } }>(
      `/characters/${publicId.value}/stats`
    )
    characterStats.value = statsResponse.data
  } catch (e) {
    characterStats.value = { constitution_modifier: 0 }
  }

  // Check if character is incomplete (has pending choices from a previous level-up)
  // If so, resume from there instead of triggering a new level-up
  const isCharacterIncomplete = character.value?.is_complete === false

  if (isCharacterIncomplete) {
    // Fetch pending choices to determine which step to resume from
    await store.fetchPendingChoices()

    // Determine the appropriate step based on pending choices (in wizard order)
    const hasSubclassChoice = store.pendingChoices.some(c => c.type === 'subclass')
    const hasHpChoice = store.pendingChoices.some(c => c.type === 'hit_points')
    const hasAsiChoice = store.pendingChoices.some(c => c.type === 'asi_or_feat')
    const hasFeatureChoice = store.pendingChoices.some(c =>
      ['fighting_style', 'expertise', 'optional_feature'].includes(c.type)
    )
    const hasSpellChoice = store.pendingChoices.some(c => c.type === 'spell')
    const hasLanguageChoice = store.pendingChoices.some(c => c.type === 'language')
    const hasProficiencyChoice = store.pendingChoices.some(c => c.type === 'proficiency')

    if (hasSubclassChoice) {
      store.goToStep('subclass')
    } else if (hasHpChoice) {
      store.goToStep('hit-points')
    } else if (hasAsiChoice) {
      store.goToStep('asi-feat')
    } else if (hasFeatureChoice) {
      store.goToStep('feature-choices')
    } else if (hasSpellChoice) {
      store.goToStep('spells')
    } else if (hasLanguageChoice) {
      store.goToStep('languages')
    } else if (hasProficiencyChoice) {
      store.goToStep('proficiencies')
    } else {
      // Default to summary if no specific choices found
      store.goToStep('summary')
    }

    isInitializing.value = false
    return
  }

  // Auto-advance for single-class characters (multiclass not yet supported)
  // When multiclass is implemented, we'll show class selection for level 1 characters
  // and multiclass characters. For now, just auto-level the single class.
  if (classEntries.length === 1) {
    const primaryClass = classEntries[0]
    const classSlug = primaryClass?.class?.full_slug || primaryClass?.class?.slug

    if (classSlug) {
      try {
        await store.levelUp(classSlug)
        store.goToStep('hit-points')
      } catch (e) {
        initError.value = store.error || 'Failed to level up'
      }
    }
  }

  isInitializing.value = false
})

// ════════════════════════════════════════════════════════════════
// HP STEP HELPERS
// ════════════════════════════════════════════════════════════════

const hpGained = ref<number>(0)

const hitDie = computed(() => {
  if (!store.selectedClassSlug || !store.characterClasses.length) return 8
  const cls = store.characterClasses.find(
    c => c.class?.full_slug === store.selectedClassSlug || c.class?.slug === store.selectedClassSlug
  )
  return cls?.class?.hit_die ?? 8
})

const conModifier = computed(() => characterStats.value?.constitution_modifier ?? 0)

const className = computed(() => {
  if (!store.selectedClassSlug || !store.characterClasses.length) return 'Character'
  const cls = store.characterClasses.find(
    c => c.class?.full_slug === store.selectedClassSlug || c.class?.slug === store.selectedClassSlug
  )
  return cls?.class?.name ?? 'Character'
})

function handleHpChoice(hp: number) {
  hpGained.value = hp
}

// ════════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════════

function handleBack() {
  if (isFirstStep.value) {
    // Go back to character sheet
    router.push(`/characters/${publicId.value}`)
  } else {
    previousStep()
  }
}

function handleNext() {
  nextStep()
}

function handleComplete() {
  // Reset store and go back to character sheet
  store.reset()
  router.push(`/characters/${publicId.value}`)
}

// ════════════════════════════════════════════════════════════════
// SEO
// ════════════════════════════════════════════════════════════════

useSeoMeta({
  title: () => `Level Up - ${character.value?.name ?? 'Character'}`
})
</script>

<template>
  <div class="h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <CharacterLevelupLevelUpSidebar class="w-64 flex-shrink-0 hidden lg:block" />

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
            Level Up {{ character?.name }}
          </h1>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 p-6 overflow-y-auto">
        <!-- Loading State -->
        <div
          v-if="loading || isInitializing"
          class="flex flex-col items-center justify-center py-12"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-primary"
          />
          <p class="mt-4 text-gray-500">
            {{ isInitializing ? 'Preparing level up...' : 'Loading character...' }}
          </p>
        </div>

        <!-- Error State -->
        <UAlert
          v-else-if="error || initError"
          color="error"
          icon="i-heroicons-exclamation-circle"
          :title="error?.message || initError || 'An error occurred'"
          class="mb-6"
        >
          <template #actions>
            <UButton
              color="error"
              variant="soft"
              :to="`/characters/${publicId}`"
            >
              Back to Character
            </UButton>
          </template>
        </UAlert>

        <!-- Store Error -->
        <UAlert
          v-else-if="store.error"
          color="error"
          icon="i-heroicons-exclamation-circle"
          :title="store.error"
          class="mb-6"
        />

        <!-- Step Content - Key ensures proper unmount/mount on step change -->
        <div
          v-else
          :key="store.currentStepName"
        >
          <!-- Class Selection Step (placeholder for multiclass) -->
          <div v-if="store.currentStepName === 'class-selection'">
            <div class="max-w-2xl mx-auto text-center py-12">
              <UIcon
                name="i-heroicons-shield-check"
                class="w-16 h-16 mx-auto text-gray-400 mb-4"
              />
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Class Selection
              </h2>
              <p class="text-gray-500 mb-6">
                Multiclass support coming soon. For now, single-class characters level up automatically.
              </p>
              <UButton
                color="primary"
                :to="`/characters/${publicId}`"
              >
                Back to Character
              </UButton>
            </div>
          </div>

          <!-- Subclass Step -->
          <CharacterLevelupStepSubclassChoice
            v-else-if="store.currentStepName === 'subclass'"
            :character-id="store.characterId!"
            :next-step="nextStep"
          />

          <!-- Hit Points Step -->
          <CharacterLevelupStepHitPoints
            v-else-if="store.currentStepName === 'hit-points'"
            :hit-die="hitDie"
            :con-modifier="conModifier"
            @choice-made="handleHpChoice"
          />

          <!-- ASI/Feat Step -->
          <CharacterWizardStepFeats
            v-else-if="store.currentStepName === 'asi-feat'"
          />

          <!-- Feature Choices Step (Fighting Style, Expertise, etc.) -->
          <CharacterWizardStepFeatureChoices
            v-else-if="store.currentStepName === 'feature-choices'"
            :character-id="store.characterId!"
            :next-step="nextStep"
            :refresh-after-save="store.refreshChoices"
          />

          <!-- Spells Step -->
          <CharacterWizardStepSpells
            v-else-if="store.currentStepName === 'spells'"
          />

          <!-- Languages Step -->
          <CharacterWizardStepLanguages
            v-else-if="store.currentStepName === 'languages'"
            :character-id="store.characterId!"
            :next-step="nextStep"
            :refresh-after-save="store.refreshChoices"
          />

          <!-- Proficiencies Step -->
          <CharacterWizardStepProficiencies
            v-else-if="store.currentStepName === 'proficiencies'"
            :character-id="store.characterId!"
            :next-step="nextStep"
            :refresh-after-save="store.refreshChoices"
          />

          <!-- Summary Step (for fresh level-ups with result) -->
          <CharacterLevelupStepLevelUpSummary
            v-else-if="store.currentStepName === 'summary' && store.levelUpResult"
            :level-up-result="store.levelUpResult"
            :class-name="className"
            :hp-gained="hpGained"
            @complete="handleComplete"
          />

          <!-- Summary Step (for resumed level-ups without result) -->
          <div
            v-else-if="store.currentStepName === 'summary' && !store.levelUpResult"
            class="max-w-2xl mx-auto text-center py-12"
          >
            <UIcon
              name="i-heroicons-check-circle"
              class="w-16 h-16 mx-auto text-success-500 mb-4"
            />
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Level-Up Complete!
            </h2>
            <p class="text-gray-500 mb-6">
              All choices have been made. Your character is ready.
            </p>
            <UButton
              color="primary"
              size="lg"
              @click="handleComplete"
            >
              Return to Character
            </UButton>
          </div>

          <!-- Fallback -->
          <div
            v-else
            class="text-center text-gray-500 py-12"
          >
            <p>Unknown step: {{ store.currentStepName }}</p>
          </div>
        </div>
      </main>

      <!-- Footer Navigation -->
      <footer
        v-if="!loading && !isInitializing && !error && !initError"
        class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
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
            v-if="!isLastStep && store.currentStepName !== 'summary'"
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

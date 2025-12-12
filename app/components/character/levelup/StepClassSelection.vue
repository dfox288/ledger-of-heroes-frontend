<!-- app/components/character/levelup/StepClassSelection.vue -->
<script setup lang="ts">
/**
 * Level-Up: Class Selection Step
 *
 * Shown for:
 * 1. Level 1→2 characters to choose between continuing current class or multiclassing
 * 2. Already multiclassed characters to select which class to advance
 */
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import {
  checkMulticlassEligibility,
  type AbilityScoreMap,
  type MulticlassRequirements
} from '~/composables/useMulticlassEligibility'
import { logger } from '~/utils/logger'

interface ClassOption {
  id: number
  slug: string
  name: string
  hit_die: number
  is_base_class: boolean
  multiclass_requirements: MulticlassRequirements | null
}

const props = defineProps<{
  characterId?: number
  publicId?: string
  nextStep?: () => Promise<void>
  availableClasses?: ClassOption[]
  abilityScores?: AbilityScoreMap
}>()

const store = useCharacterLevelUpStore()

// ════════════════════════════════════════════════════════════════
// COMPUTED
// ════════════════════════════════════════════════════════════════

/** Is this a max level character? */
const isMaxLevel = computed(() => store.totalLevel >= 20)

/** Is this the first opportunity to multiclass? (Level 1 → 2) */
const isFirstMulticlass = computed(() => store.isFirstMulticlassOpportunity)

/** Current character classes */
const currentClasses = computed(() => store.characterClasses)

/** Classes available for multiclassing (excludes current classes) */
const multiclassOptions = computed(() => {
  if (!props.availableClasses) return []

  const currentSlugs = currentClasses.value.map(c => c.class?.slug).filter(Boolean)
  return props.availableClasses.filter(c => !currentSlugs.includes(c.slug))
})

/** Default ability scores if not provided */
const scores = computed<AbilityScoreMap>(() => {
  if (!props.abilityScores) {
    logger.warn('StepClassSelection: abilityScores prop missing, using default values (all 10s)')
  }
  return props.abilityScores || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
})

// ════════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════════

/**
 * Check if character meets multiclass prerequisites for a class
 */
function getEligibility(classOption: ClassOption) {
  return checkMulticlassEligibility(scores.value, classOption.multiclass_requirements)
}

/**
 * Select a class to level up
 */
async function selectClass(classSlug: string) {
  if (store.isLoading) return

  try {
    await store.levelUp(classSlug)
    if (props.nextStep) {
      await props.nextStep()
    }
  } catch (err) {
    // Error is stored in store.error, but log for debugging
    logger.error('StepClassSelection: Failed to level up class:', err)
  }
}

/**
 * Get display info for a current class
 */
function getCurrentClassDisplay(classEntry: typeof currentClasses.value[0]) {
  const name = classEntry.class?.name || 'Unknown'
  const level = classEntry.level
  const subclass = classEntry.subclass?.name

  return {
    name,
    level,
    subclass,
    slug: classEntry.class?.slug || '',
    hitDie: classEntry.class?.hit_die || 8,
    displayName: subclass ? `${name} (${subclass})` : name
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-6 px-4">
    <!-- Max Level Message -->
    <div v-if="isMaxLevel" class="text-center py-12">
      <UIcon
        name="i-heroicons-trophy"
        class="w-16 h-16 mx-auto text-yellow-500 mb-4"
      />
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Maximum Level Reached
      </h2>
      <p class="text-gray-500">
        Your character has reached level 20 and cannot level up further.
      </p>
    </div>

    <!-- Class Selection UI -->
    <template v-else>
      <!-- Error State -->
      <UAlert
        v-if="store.error"
        color="error"
        variant="soft"
        class="mb-6"
        :title="store.error"
        icon="i-heroicons-exclamation-triangle"
      />

      <!-- Loading Spinner -->
      <div
        v-if="store.isLoading"
        data-testid="loading-spinner"
        class="flex justify-center py-8"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <!-- Current Class Options -->
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ currentClasses.length > 1 ? 'Continue Leveling' : 'Current Class' }}
        </h2>

        <div class="grid gap-4">
          <button
            v-for="classEntry in currentClasses"
            :key="classEntry.class?.slug"
            :data-testid="`class-option-${classEntry.class?.slug}`"
            :disabled="store.isLoading"
            :aria-disabled="store.isLoading ? 'true' : undefined"
            class="relative p-4 rounded-lg border-2 text-left transition-all
                   ring-2 ring-primary-500 ring-offset-2
                   bg-white dark:bg-gray-800
                   border-primary-500
                   hover:bg-primary-50 dark:hover:bg-primary-900/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
            @click="selectClass(classEntry.class?.slug || '')"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-lg text-gray-900 dark:text-white">
                    Continue as {{ getCurrentClassDisplay(classEntry).displayName }}
                  </span>
                  <UBadge color="primary" variant="soft" size="sm">
                    Current
                  </UBadge>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  Level {{ classEntry.level }} → {{ classEntry.level + 1 }}
                  • Hit Die: d{{ classEntry.class?.hit_die || 8 }}
                </div>
              </div>
              <UIcon
                name="i-heroicons-chevron-right"
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </button>
        </div>
      </section>

      <!-- Multiclass Options -->
      <section v-if="multiclassOptions.length > 0 && !isMaxLevel">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ currentClasses.length > 1 ? 'Add Another Class' : 'Or Multiclass Into' }}
        </h2>
        <p class="text-sm text-gray-500 mb-4">
          Take a level in a new class. You must meet the ability score prerequisites.
        </p>

        <div
          data-testid="multiclass-options"
          class="grid gap-3 sm:grid-cols-2"
        >
          <button
            v-for="classOption in multiclassOptions"
            :key="classOption.slug"
            :data-testid="`class-option-${classOption.slug}`"
            :disabled="store.isLoading || !getEligibility(classOption).eligible"
            :aria-disabled="store.isLoading || !getEligibility(classOption).eligible ? 'true' : undefined"
            class="relative p-4 rounded-lg border text-left transition-all
                   bg-white dark:bg-gray-800
                   hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
            :class="[
              getEligibility(classOption).eligible
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
            ]"
            @click="getEligibility(classOption).eligible && selectClass(classOption.slug)"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ classOption.name }}
                </span>
                <div class="text-xs text-gray-500 mt-0.5">
                  Hit Die: d{{ classOption.hit_die }}
                </div>
              </div>

              <!-- Eligible indicator -->
              <UIcon
                v-if="getEligibility(classOption).eligible"
                name="i-heroicons-check-circle"
                class="w-5 h-5 text-green-500"
              />
              <UIcon
                v-else
                name="i-heroicons-lock-closed"
                class="w-5 h-5 text-gray-400"
              />
            </div>

            <!-- Prerequisite text -->
            <div
              v-if="getEligibility(classOption).requirementText"
              class="mt-2 text-xs"
              :class="[
                getEligibility(classOption).eligible
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              ]"
            >
              {{ getEligibility(classOption).requirementText }}
            </div>
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<!-- app/components/character/levelup/StepAsiFeat.vue -->
<script setup lang="ts">
/**
 * Level-Up ASI/Feat Selection Step
 *
 * Handles the Ability Score Improvement or Feat selection at ASI levels
 * (4, 8, 12, 16, 19 for most classes; extra at Fighter 6, 14; Rogue 10).
 *
 * Fixes #690 - The API returns ASI/Feat choices with:
 * - type: 'ability_score'
 * - subtype: 'asi_or_feat'
 *
 * NOT type: 'asi_or_feat' as the docs suggest, so we filter correctly here.
 */

import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

interface AsiOption {
  type: 'asi'
  label: string
  description: string
}

interface FeatOption {
  type: 'feat'
  slug: string
  name: string
  description?: string
}

type ChoiceOption = AsiOption | FeatOption

const props = defineProps<{
  characterId: number
  publicId: string
  nextStep: () => void
  refreshAfterSave?: () => Promise<void>
}>()

const _store = useCharacterLevelUpStore()

// ════════════════════════════════════════════════════════════════
// CHOICES
// ════════════════════════════════════════════════════════════════

const { choicesByType, fetchChoices, resolveChoice, pending, error } = useUnifiedChoices(
  computed(() => props.characterId)
)

// Find ASI/Feat choice - KEY FIX for #690
// Filter for type='ability_score' AND subtype='asi_or_feat'
const asiOrFeatChoice = computed<PendingChoice | null>(() => {
  const choices = choicesByType.value.abilityScores ?? []
  return choices.find(c => c.subtype === 'asi_or_feat') ?? null
})

// Extract options from choice (cast from unknown[] to ChoiceOption[])
const choiceOptions = computed<ChoiceOption[]>(() => {
  if (!asiOrFeatChoice.value?.options) return []
  return asiOrFeatChoice.value.options as ChoiceOption[]
})

const asiOption = computed<AsiOption | null>(() => {
  const opt = choiceOptions.value.find(o => o.type === 'asi')
  return opt as AsiOption | null
})

const featOptions = computed<FeatOption[]>(() => {
  return choiceOptions.value.filter(o => o.type === 'feat') as FeatOption[]
})

// ════════════════════════════════════════════════════════════════
// CHARACTER STATS (for ASI allocation)
// ════════════════════════════════════════════════════════════════

const { abilityScores } = useCharacterStats(computed(() => props.characterId))

const abilities = computed(() => {
  const codes = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const
  return codes.map((code) => {
    const stat = abilityScores.value?.find(a => a.code === code)
    return {
      code,
      name: getAbilityName(code),
      score: stat?.score ?? 10,
      modifier: stat?.modifier ?? 0
    }
  })
})

function getAbilityName(code: string): string {
  const names: Record<string, string> = {
    STR: 'Strength',
    DEX: 'Dexterity',
    CON: 'Constitution',
    INT: 'Intelligence',
    WIS: 'Wisdom',
    CHA: 'Charisma'
  }
  return names[code] ?? code
}

// ════════════════════════════════════════════════════════════════
// SELECTION STATE
// ════════════════════════════════════════════════════════════════

type SelectionMode = 'none' | 'asi' | 'feat'
const selectionMode = ref<SelectionMode>('none')

// ASI allocation: Map<code, bonus> (max 2 total points)
const asiAllocation = ref<Map<string, number>>(new Map())

// Selected feat slug
const selectedFeat = ref<string | null>(null)

// Total ASI points allocated
const totalAsiPoints = computed(() => {
  let total = 0
  for (const value of asiAllocation.value.values()) {
    total += value
  }
  return total
})

// Can add more ASI points?
const canAddAsiPoint = computed(() => totalAsiPoints.value < 2)

// Get allocated bonus for an ability
function getAllocatedBonus(code: string): number {
  return asiAllocation.value.get(code) ?? 0
}

// Toggle ASI allocation for an ability
function toggleAsi(code: string) {
  const current = asiAllocation.value.get(code) ?? 0
  const ability = abilities.value.find(a => a.code === code)
  if (!ability) return

  // Check if adding would exceed 20
  const wouldExceed = ability.score + current + 1 > 20

  if (current === 0 && canAddAsiPoint.value && !wouldExceed) {
    // Add +1
    asiAllocation.value.set(code, 1)
  } else if (current === 1 && canAddAsiPoint.value && !wouldExceed) {
    // Add another +1 (now +2)
    asiAllocation.value.set(code, 2)
  } else if (current > 0) {
    // Remove allocation
    asiAllocation.value.delete(code)
  }

  // Force reactivity
  asiAllocation.value = new Map(asiAllocation.value)
}

// Select ASI mode
function selectAsi() {
  selectionMode.value = 'asi'
  selectedFeat.value = null
}

// Select Feat mode
function selectFeat() {
  selectionMode.value = 'feat'
  asiAllocation.value = new Map()
}

// Select a specific feat
function selectFeatOption(slug: string) {
  selectedFeat.value = selectedFeat.value === slug ? null : slug
}

// ════════════════════════════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════════════════════════════

const canConfirm = computed(() => {
  if (selectionMode.value === 'asi') {
    return totalAsiPoints.value === 2
  }
  if (selectionMode.value === 'feat') {
    return selectedFeat.value !== null
  }
  return false
})

// ════════════════════════════════════════════════════════════════
// SUBMISSION
// ════════════════════════════════════════════════════════════════

const isSaving = ref(false)
const saveError = ref<string | null>(null)

async function handleConfirm() {
  if (!canConfirm.value || !asiOrFeatChoice.value) return

  isSaving.value = true
  saveError.value = null

  try {
    let payload: Record<string, unknown>

    if (selectionMode.value === 'asi') {
      // Build ability_scores object: { DEX: 2 } or { DEX: 1, CON: 1 }
      const abilityScoresPayload: Record<string, number> = {}
      for (const [code, bonus] of asiAllocation.value.entries()) {
        abilityScoresPayload[code] = bonus
      }
      payload = {
        type: 'asi',
        ability_scores: abilityScoresPayload
      }
    } else {
      payload = {
        type: 'feat',
        selected: selectedFeat.value
      }
    }

    await resolveChoice(asiOrFeatChoice.value.id, payload)

    // Refresh store choices
    if (props.refreshAfterSave) {
      await props.refreshAfterSave()
    }

    props.nextStep()
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to save selection'
  } finally {
    isSaving.value = false
  }
}

// ════════════════════════════════════════════════════════════════
// LIFECYCLE
// ════════════════════════════════════════════════════════════════

onMounted(() => {
  fetchChoices('ability_score')
})
</script>

<template>
  <div class="space-y-8">
    <!-- Error States -->
    <UAlert
      v-if="error || saveError"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error || saveError || 'An error occurred'"
      :close-button="{ icon: 'i-heroicons-x-mark', color: 'error', variant: 'link' }"
      @close="saveError = null"
    />

    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Ability Score Improvement
      </h2>
      <p
        v-if="asiOrFeatChoice"
        class="mt-2 text-gray-600 dark:text-gray-400"
      >
        {{ asiOrFeatChoice.source_name }} Level {{ asiOrFeatChoice.level_granted }}
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!asiOrFeatChoice"
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-trending-up"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <p class="text-gray-600 dark:text-gray-400">
        No ability score improvement available at this level.
      </p>
    </div>

    <!-- Main Selection UI -->
    <template v-else>
      <!-- Choice Cards: ASI vs Feat -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ASI Option -->
        <div
          v-if="asiOption"
          data-testid="asi-option"
          class="p-6 rounded-xl border-2 cursor-pointer transition-all"
          :class="selectionMode === 'asi'
            ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'"
          @click="selectAsi"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-primary/10">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-6 h-6 text-primary"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ asiOption.label }}
            </h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ asiOption.description }}
          </p>
        </div>

        <!-- Feat Option -->
        <div
          data-testid="feat-option"
          class="p-6 rounded-xl border-2 cursor-pointer transition-all"
          :class="selectionMode === 'feat'
            ? 'border-feat bg-feat-50 dark:bg-feat-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-feat/50'"
          @click="selectFeat"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-feat/10">
              <UIcon
                name="i-heroicons-star"
                class="w-6 h-6 text-feat"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Feat
            </h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Choose a feat to gain special abilities and bonuses.
          </p>
        </div>
      </div>

      <!-- ASI Allocation UI -->
      <div
        v-if="selectionMode === 'asi'"
        data-testid="asi-allocation"
        class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-4"
      >
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-gray-900 dark:text-white">
            Allocate Ability Points
          </h4>
          <UBadge
            :color="totalAsiPoints === 2 ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ totalAsiPoints }} / 2 points
          </UBadge>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Click an ability to add +1. Click again for +2 to the same ability, or distribute +1 to two different abilities.
        </p>

        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          <button
            v-for="ability in abilities"
            :key="ability.code"
            type="button"
            :data-testid="`asi-${ability.code}`"
            class="relative p-4 rounded-lg border-2 text-center transition-all"
            :class="{
              'border-primary bg-primary/10': getAllocatedBonus(ability.code) > 0,
              'border-gray-200 dark:border-gray-700 hover:border-primary/50': getAllocatedBonus(ability.code) === 0,
              'opacity-50 cursor-not-allowed': ability.score >= 20 && getAllocatedBonus(ability.code) === 0
            }"
            :disabled="ability.score >= 20 && getAllocatedBonus(ability.code) === 0"
            @click="toggleAsi(ability.code)"
          >
            <div class="font-bold text-lg">
              {{ ability.code }}
            </div>
            <div class="text-sm text-gray-500">
              {{ ability.score }}
              <span
                v-if="getAllocatedBonus(ability.code) > 0"
                class="asi-bonus text-primary font-semibold"
              >
                +{{ getAllocatedBonus(ability.code) }}
              </span>
            </div>
            <div
              v-if="getAllocatedBonus(ability.code) > 0"
              class="text-xs text-primary mt-1"
            >
              = {{ ability.score + getAllocatedBonus(ability.code) }}
            </div>
          </button>
        </div>
      </div>

      <!-- Feat List UI -->
      <div
        v-if="selectionMode === 'feat'"
        data-testid="feat-list"
        class="space-y-4"
      >
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-gray-900 dark:text-white">
            Choose a Feat
          </h4>
          <UBadge
            :color="selectedFeat ? 'success' : 'warning'"
            variant="subtle"
            size="md"
          >
            {{ selectedFeat ? '1' : '0' }} / 1 selected
          </UBadge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          <button
            v-for="feat in featOptions"
            :key="feat.slug"
            type="button"
            :data-testid="`feat-${feat.slug}`"
            class="p-4 rounded-lg border-2 text-left transition-all"
            :class="selectedFeat === feat.slug
              ? 'selected border-feat bg-feat-50 dark:bg-feat-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-feat/50'"
            @click="selectFeatOption(feat.slug)"
          >
            <div class="font-semibold text-gray-900 dark:text-white">
              {{ feat.name }}
            </div>
            <div
              v-if="feat.description"
              class="text-sm text-gray-500 mt-1 line-clamp-2"
            >
              {{ feat.description }}
            </div>
          </button>
        </div>
      </div>
    </template>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-testid="confirm-btn"
        size="lg"
        :disabled="!canConfirm || isSaving"
        :loading="isSaving"
        @click="handleConfirm"
      >
        {{ selectionMode === 'asi' ? 'Confirm Ability Scores' : 'Confirm Feat' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'

const props = defineProps<{
  characterId: number
  publicId: string
  nextStep: () => void
  refreshAfterSave?: () => Promise<void>
}>()

const emit = defineEmits<{
  'choice-made': [hpGained: number]
}>()

const store = useCharacterLevelUpStore()

// Use unified choices for HP choice resolution
const { resolveChoice, fetchChoices, choicesByType } = useUnifiedChoices(
  computed(() => props.characterId)
)

// Derive hitDie from the class being leveled up
const hitDie = computed(() => {
  if (!store.selectedClassSlug) return 10 // Default fallback
  const classEntry = store.characterClasses.find(
    c => c.class?.slug === store.selectedClassSlug
  )
  return classEntry?.class?.hit_die ?? 10
})

// Fetch character stats to get CON modifier
const { abilityScores } = useCharacterStats(
  computed(() => props.characterId)
)

const conModifier = computed(() => {
  const conScore = abilityScores.value?.find(a => a.code === 'CON')
  return conScore?.modifier ?? 0
})

// Local state
const selectedMethod = ref<'roll' | 'average' | null>(null)
const rollResult = ref<number | null>(null)
const hpGained = ref<number | null>(null)
const isSaving = ref(false)
const error = ref<string | null>(null)

// Trigger counter for die roller (increment to trigger a roll)
const rollTrigger = ref(0)

// Calculate average (rounded up per 5e rules)
const averageValue = computed(() => Math.ceil((hitDie.value + 1) / 2))

// Calculate total HP gained
const totalHpGained = computed(() => {
  if (selectedMethod.value === 'average') {
    return averageValue.value + conModifier.value
  }
  if (selectedMethod.value === 'roll' && rollResult.value !== null) {
    return rollResult.value + conModifier.value
  }
  return null
})

function handleRollClick() {
  selectedMethod.value = 'roll'
  rollTrigger.value++ // Increment to trigger the roll
}

function handleRollComplete(result: number) {
  rollResult.value = result
  hpGained.value = result + conModifier.value
}

function handleAverageClick() {
  selectedMethod.value = 'average'
  rollResult.value = averageValue.value
  hpGained.value = averageValue.value + conModifier.value
}

async function handleConfirm() {
  // Capture values before any async operations
  const hpValue = hpGained.value
  const method = selectedMethod.value

  console.log('[HP Step] handleConfirm called, method:', method, 'hpGained:', hpValue)

  if (!method || hpValue === null) {
    console.log('[HP Step] method or hpGained is null, returning early')
    error.value = 'Please select a method (Roll or Average) first.'
    return
  }

  isSaving.value = true
  error.value = null

  try {
    // Find the HP choice and resolve it
    await fetchChoices('hit_points')
    const hpChoices = choicesByType.value.hitPoints
    const firstChoice = hpChoices?.[0]

    console.log('[HP Step] Found HP choices:', hpChoices?.length, 'First choice:', firstChoice?.id)

    if (!firstChoice) {
      // No HP choice available - may have already been resolved or character at max level
      error.value = 'No HP choice available. The character may already be at max level.'
      return
    }

    // Backend expects { selected: ["roll"|"average"|"manual"] } format (same as other choices)
    // The value in selected array determines the method
    const payload = {
      selected: [method]
    }

    console.log('[HP Step] Resolving choice:', firstChoice.id, 'with payload:', JSON.stringify(payload))

    await resolveChoice(firstChoice.id, payload)

    console.log('[HP Step] Choice resolved successfully')

    emit('choice-made', hpValue)
    props.nextStep()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save HP choice. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Fetch HP choices on mount
onMounted(() => {
  fetchChoices('hit_points')
})
</script>

<template>
  <div class="space-y-8">
    <!-- Error Alert -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
      :close-button="{ icon: 'i-heroicons-x-mark', color: 'error', variant: 'link' }"
      @close="error = null"
    />

    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Hit Point Increase
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Your hit die: <span class="font-semibold">d{{ hitDie }}</span>
        &bull; Constitution modifier: <span class="font-semibold">{{ conModifier >= 0 ? '+' : '' }}{{ conModifier }}</span>
      </p>
    </div>

    <!-- Choice Options -->
    <div class="flex flex-col sm:flex-row justify-center items-center gap-6">
      <!-- Roll Option -->
      <div
        class="flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer"
        :class="selectedMethod === 'roll'
          ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'"
        data-testid="roll-button"
        @click="handleRollClick"
      >
        <CharacterLevelupHitDieRoller
          :die-size="hitDie"
          :trigger-roll="rollTrigger"
          @roll-complete="handleRollComplete"
        />
        <span class="mt-3 font-semibold text-gray-900 dark:text-white">
          Roll d{{ hitDie }}
        </span>
        <span class="text-sm text-gray-500">
          Take your chances
        </span>
      </div>

      <!-- Average Option -->
      <div
        class="flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer"
        :class="selectedMethod === 'average'
          ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'"
        data-testid="average-button"
        @click="handleAverageClick"
      >
        <div class="w-24 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
          <span class="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {{ averageValue }}
          </span>
        </div>
        <span class="mt-3 font-semibold text-gray-900 dark:text-white">
          Take Average
        </span>
        <span class="text-sm text-gray-500">
          Guaranteed value
        </span>
      </div>
    </div>

    <!-- Result Display -->
    <div
      v-if="totalHpGained !== null"
      class="text-center p-6 bg-success-50 dark:bg-success-900/20 rounded-xl"
    >
      <p class="text-lg text-gray-700 dark:text-gray-300">
        <span v-if="selectedMethod === 'roll'">
          You rolled <span class="font-bold text-primary">{{ rollResult }}</span>
        </span>
        <span v-else>
          Average: <span class="font-bold">{{ averageValue }}</span>
        </span>
        + {{ conModifier }} (CON) =
        <span class="text-2xl font-bold text-success-600 dark:text-success-400">
          {{ totalHpGained }} HP
        </span>
      </p>
    </div>

    <!-- Confirm Button -->
    <div class="flex justify-center pt-4">
      <UButton
        data-testid="confirm-hp-btn"
        size="lg"
        :disabled="totalHpGained === null || isSaving"
        :loading="isSaving"
        @click="handleConfirm"
      >
        Confirm HP Increase
      </UButton>
    </div>
  </div>
</template>

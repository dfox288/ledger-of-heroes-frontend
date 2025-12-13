<!-- app/components/character/sheet/CombatStatsGrid.vue -->
<script setup lang="ts">
import type { Character, CharacterStats, CharacterCurrency } from '~/types/character'
import type { CurrencyDelta } from '~/components/character/sheet/CurrencyEditModal.vue'

const props = defineProps<{
  character: Character
  stats: CharacterStats
  currency?: CharacterCurrency | null
  editable?: boolean
  /** Live death save failures count (for "DEAD" state display) */
  deathSaveFailures?: number
  /** Live death save successes count (for "STABILIZED" state display) */
  deathSaveSuccesses?: number
  /** Loading state for currency API call (passed to modal) */
  currencyLoading?: boolean
  /** Control currency modal open state from parent (v-model pattern) */
  currencyModalOpen?: boolean
  /** Error message to display in currency modal */
  currencyError?: string | null
}>()

const emit = defineEmits<{
  'hp-change': [delta: number]
  'temp-hp-set': [value: number]
  'temp-hp-clear': []
  'currency-apply': [payload: CurrencyDelta]
  'update:currencyModalOpen': [value: boolean]
  'clear-currency-error': []
}>()

// =========================================================================
// Modal State
// =========================================================================

const isHpModalOpen = ref(false)
const isTempHpModalOpen = ref(false)

/**
 * Currency modal state - supports both internal control and v-model from parent
 * Uses internal ref when parent doesn't provide currencyModalOpen prop
 */
const internalCurrencyModalOpen = ref(false)
const isCurrencyModalOpen = computed({
  get: () => props.currencyModalOpen ?? internalCurrencyModalOpen.value,
  set: (value: boolean) => {
    internalCurrencyModalOpen.value = value
    emit('update:currencyModalOpen', value)
  }
})

// =========================================================================
// HP Cell Click Handler
// =========================================================================

function handleHpCellClick() {
  if (!props.editable) return
  isHpModalOpen.value = true
}

// =========================================================================
// Modal Event Handlers
// =========================================================================

function handleHpChange(delta: number) {
  emit('hp-change', delta)
  isHpModalOpen.value = false
}

function handleTempHpSet(value: number) {
  emit('temp-hp-set', value)
  isTempHpModalOpen.value = false
}

function handleTempHpClear() {
  emit('temp-hp-clear')
  isTempHpModalOpen.value = false
}

// =========================================================================
// Currency Cell Click Handler
// =========================================================================

function handleCurrencyCellClick() {
  if (!props.editable) return
  isCurrencyModalOpen.value = true
}

// =========================================================================
// Currency Modal Event Handler
// =========================================================================

function handleCurrencyApply(payload: CurrencyDelta) {
  emit('currency-apply', payload)
  // Note: Do NOT close modal here - parent controls close on success/failure
}

// =========================================================================
// Utility Functions
// =========================================================================

function formatModifier(value: number | null): string {
  if (value === null) return '—'
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Check if character is at 0 HP (dying/making death saves)
 */
const isAtZeroHp = computed(() => {
  return (props.stats.hit_points?.current ?? 0) === 0
})

/**
 * Check if character is dead
 *
 * Uses the backend's is_dead flag which is the authoritative source.
 * Backend sets is_dead for:
 * - 3 death save failures
 * - Massive damage (damage >= max HP while at 0)
 * - Exhaustion level 6
 * - Instant death effects
 *
 * Falls back to death save calculation if is_dead is not available.
 * @see Issue #544
 */
const isDead = computed(() => {
  // Use backend flag if available
  if (props.character.is_dead !== undefined) {
    return props.character.is_dead
  }
  // Fallback: derive from death saves (legacy behavior)
  const failures = props.deathSaveFailures ?? props.character.death_save_failures ?? 0
  return isAtZeroHp.value && failures >= 3
})

/**
 * Check if character is stabilized (3 successful death saves)
 * Uses prop if provided (live value), falls back to character data
 */
const isStabilized = computed(() => {
  const successes = props.deathSaveSuccesses ?? props.character.death_save_successes ?? 0
  return isAtZeroHp.value && successes >= 3 && !isDead.value
})

/**
 * HP cell status label
 */
const hpStatusLabel = computed(() => {
  if (isDead.value) return 'DEAD'
  if (isStabilized.value) return 'STABLE'
  if (isAtZeroHp.value) return 'DYING'
  return 'HP'
})

/**
 * Get alternate movement speeds (fly, swim, climb) that have values
 * Returns array of { type, speed } for display
 */
const alternateSpeeds = computed(() => {
  if (!props.character.speeds) return []

  const speeds: { type: string, speed: number }[] = []

  if (props.character.speeds.fly) {
    speeds.push({ type: 'fly', speed: props.character.speeds.fly })
  }
  if (props.character.speeds.swim) {
    speeds.push({ type: 'swim', speed: props.character.speeds.swim })
  }
  if (props.character.speeds.climb) {
    speeds.push({ type: 'climb', speed: props.character.speeds.climb })
  }

  return speeds
})

/**
 * Currency display configuration
 * Only includes currencies with non-zero values
 */
const currencyConfig = [
  { key: 'pp', label: 'P', bg: 'bg-gray-300 dark:bg-gray-500', text: 'text-gray-700 dark:text-gray-200' },
  { key: 'gp', label: 'G', bg: 'bg-yellow-400 dark:bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-900' },
  { key: 'ep', label: 'E', bg: 'bg-gray-200 dark:bg-gray-400', text: 'text-gray-600 dark:text-gray-700' },
  { key: 'sp', label: 'S', bg: 'bg-slate-300 dark:bg-slate-400', text: 'text-slate-700 dark:text-slate-800' },
  { key: 'cp', label: 'C', bg: 'bg-orange-400 dark:bg-orange-500', text: 'text-orange-800 dark:text-orange-900' }
] as const

const visibleCurrencies = computed(() => {
  if (!props.currency) return []
  return currencyConfig
    .filter(c => props.currency![c.key as keyof CharacterCurrency] > 0)
    .map(c => ({
      ...c,
      value: props.currency![c.key as keyof CharacterCurrency]
    }))
})

// =========================================================================
// AC Tooltip (#547)
// =========================================================================

/**
 * Check if character has a class with Unarmored Defense
 * Returns the class type: 'barbarian' | 'monk' | null
 */
const unarmoredDefenseClass = computed(() => {
  const classes = props.character.classes
  if (!classes) return null

  for (const entry of classes) {
    const slug = entry.class?.slug?.toLowerCase() ?? ''
    if (slug.includes('barbarian')) return 'barbarian'
    if (slug.includes('monk')) return 'monk'
  }
  return null
})

/**
 * Check if character is wearing armor
 */
const isWearingArmor = computed(() => {
  return props.character.equipped?.armor != null
})

/**
 * Check if character has a shield equipped
 */
const hasShield = computed(() => {
  return props.character.equipped?.shield != null
})

/**
 * Format a modifier for display (+2 or -1)
 */
function formatMod(value: number | null | undefined): string {
  if (value === null || value === undefined) return '+0'
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Get the AC tooltip text based on equipment and class
 *
 * Shows different information based on:
 * - Wearing armor: "Chain Mail (AC 16)" or "Chain Mail + Shield"
 * - Unarmored with Barbarian: "Unarmored Defense: 10 + DEX + CON"
 * - Unarmored with Monk: "Unarmored Defense: 10 + DEX + WIS"
 * - Unarmored without special class: "Unarmored: 10 + DEX"
 *
 * @see Issue #547
 */
const acTooltipText = computed(() => {
  const ac = props.stats.armor_class
  const mods = props.character.modifiers
  const dexMod = formatMod(mods?.DEX)

  // Shield suffix - used for both armored and unarmored cases
  const shieldSuffix = hasShield.value
    ? ` + ${props.character.equipped!.shield!.name} (+2)`
    : ''

  if (isWearingArmor.value) {
    const armor = props.character.equipped!.armor!
    return `${armor.name}${shieldSuffix}`
  }

  // Unarmored - check for special class features
  if (unarmoredDefenseClass.value === 'barbarian') {
    const conMod = formatMod(mods?.CON)
    return `Unarmored Defense: 10 + DEX (${dexMod}) + CON (${conMod})${shieldSuffix} = ${ac}`
  }

  if (unarmoredDefenseClass.value === 'monk') {
    const wisMod = formatMod(mods?.WIS)
    return `Unarmored Defense: 10 + DEX (${dexMod}) + WIS (${wisMod})${shieldSuffix} = ${ac}`
  }

  // Basic unarmored AC (potentially with shield)
  return `Unarmored: 10 + DEX (${dexMod})${shieldSuffix} = ${ac}`
})
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <!-- Row 1: HP, AC, Initiative -->
    <div
      data-testid="hp-cell"
      :class="[
        'rounded-lg p-4 text-center transition-colors',
        isDead
          ? 'bg-gray-900 dark:bg-black ring-2 ring-gray-700'
          : isStabilized
            ? 'bg-info-100 dark:bg-info-900/40 ring-2 ring-info-500'
            : isAtZeroHp
              ? 'bg-error-100 dark:bg-error-900/40 ring-2 ring-error-500'
              : 'bg-gray-50 dark:bg-gray-800',
        editable && !isAtZeroHp ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : '',
        editable && isAtZeroHp && !isDead && !isStabilized ? 'cursor-pointer hover:bg-error-200 dark:hover:bg-error-900/60' : '',
        editable && isStabilized ? 'cursor-pointer hover:bg-info-200 dark:hover:bg-info-900/60' : ''
      ]"
      @click="handleHpCellClick"
    >
      <div
        :class="[
          'text-xs font-semibold uppercase tracking-wider mb-1',
          isDead
            ? 'text-gray-400 dark:text-gray-500'
            : isStabilized
              ? 'text-info-700 dark:text-info-300'
              : isAtZeroHp
                ? 'text-error-700 dark:text-error-300'
                : 'text-gray-500 dark:text-gray-400'
        ]"
      >
        {{ hpStatusLabel }}
      </div>
      <div
        :class="[
          'text-2xl font-bold',
          isDead
            ? 'text-gray-500 dark:text-gray-600'
            : isStabilized
              ? 'text-info-700 dark:text-info-300'
              : isAtZeroHp
                ? 'text-error-700 dark:text-error-300'
                : 'text-gray-900 dark:text-white'
        ]"
      >
        {{ stats.hit_points?.current ?? '—' }}
        <span :class="isDead ? 'text-gray-600' : isStabilized ? 'text-info-400' : isAtZeroHp ? 'text-error-400' : 'text-gray-400'">/</span>
        {{ stats.hit_points?.max ?? '—' }}
      </div>
      <div
        v-if="stats.hit_points?.temporary && stats.hit_points.temporary > 0"
        class="text-sm text-success-600 dark:text-success-400"
      >
        +{{ stats.hit_points.temporary }} temp
      </div>
      <!-- Add Temp HP button (only when editable and conscious) -->
      <UButton
        v-if="editable && !isAtZeroHp"
        data-testid="add-temp-hp-btn"
        size="xs"
        variant="link"
        color="primary"
        class="mt-1"
        @click.stop="isTempHpModalOpen = true"
      >
        + Add Temp HP
      </UButton>
    </div>

    <UTooltip :text="acTooltipText">
      <div
        data-testid="ac-cell"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center cursor-help"
      >
        <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          AC
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ stats.armor_class ?? '—' }}
        </div>
      </div>
    </UTooltip>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Initiative
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ formatModifier(stats.initiative_bonus) }}
      </div>
    </div>

    <!-- Row 2: Speed, Proficiency, Passive Perception -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Speed
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ character.speed ?? '—' }} <span class="text-sm font-normal">ft</span>
      </div>
      <div
        v-if="alternateSpeeds.length > 0"
        class="text-xs text-gray-500 dark:text-gray-400 mt-1"
      >
        <span
          v-for="(alt, index) in alternateSpeeds"
          :key="alt.type"
        >
          {{ alt.type }} {{ alt.speed }}<span v-if="index < alternateSpeeds.length - 1">, </span>
        </span>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Prof Bonus
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ formatModifier(character.proficiency_bonus) }}
      </div>
    </div>

    <!-- Currency -->
    <div
      data-testid="currency-cell"
      :class="[
        'bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors',
        editable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
      ]"
      @click="handleCurrencyCellClick"
    >
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
        Currency
      </div>
      <!-- Show non-zero currencies in a clean grid -->
      <div
        v-if="visibleCurrencies.length > 0"
        class="flex flex-wrap justify-center gap-x-3 gap-y-1"
      >
        <div
          v-for="coin in visibleCurrencies"
          :key="coin.key"
          class="flex items-center gap-1"
        >
          <div
            :class="[coin.bg, 'w-5 h-5 rounded-full flex items-center justify-center']"
          >
            <span :class="[coin.text, 'text-[10px] font-black']">{{ coin.label }}</span>
          </div>
          <span class="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
            {{ coin.value.toLocaleString() }}
          </span>
        </div>
      </div>
      <!-- Empty state when no currency or all zeros -->
      <div
        v-else
        class="text-center text-gray-400 dark:text-gray-500 text-sm"
      >
        —
      </div>
    </div>
  </div>

  <!-- HP Edit Modal -->
  <CharacterSheetHpEditModal
    v-model:open="isHpModalOpen"
    :current-hp="stats.hit_points?.current ?? 0"
    :max-hp="stats.hit_points?.max ?? 0"
    :temp-hp="stats.hit_points?.temporary ?? 0"
    @apply="handleHpChange"
  />

  <!-- Temp HP Modal -->
  <CharacterSheetTempHpModal
    v-model:open="isTempHpModalOpen"
    :current-temp-hp="stats.hit_points?.temporary ?? 0"
    @apply="handleTempHpSet"
    @clear="handleTempHpClear"
  />

  <!-- Currency Edit Modal -->
  <CharacterSheetCurrencyEditModal
    v-model:open="isCurrencyModalOpen"
    :currency="currency ?? null"
    :loading="currencyLoading"
    :error="currencyError"
    @apply="handleCurrencyApply"
    @clear-error="emit('clear-currency-error')"
  />
</template>

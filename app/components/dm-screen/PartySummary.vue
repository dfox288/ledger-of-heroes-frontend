<!-- app/components/dm-screen/PartySummary.vue -->
<script setup lang="ts">
import type { DmScreenPartySummary, DmScreenCharacter } from '~/types/dm-screen'

interface Props {
  summary: DmScreenPartySummary
  characters?: DmScreenCharacter[]
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  characters: () => [],
  collapsed: false
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const isCollapsed = computed({
  get: () => props.collapsed,
  set: val => emit('update:collapsed', val)
})

// Show all languages - they're important for DM planning
const displayLanguages = computed(() => props.summary.all_languages)

// Check if we have characters to calculate stats from
const hasCharacters = computed(() => props.characters.length > 0)

// Average Party Level (APL)
const averagePartyLevel = computed(() => {
  if (!hasCharacters.value) return 0
  const totalLevels = props.characters.reduce((sum, c) => sum + c.total_level, 0)
  return Math.round(totalLevels / props.characters.length)
})

// Total Party HP
const totalHp = computed(() => {
  if (!hasCharacters.value) return { current: 0, max: 0 }
  return props.characters.reduce(
    (acc, c) => ({
      current: acc.current + c.hit_points.current,
      max: acc.max + c.hit_points.max
    }),
    { current: 0, max: 0 }
  )
})

const hpPercentage = computed(() => {
  if (totalHp.value.max === 0) return 0
  return Math.round((totalHp.value.current / totalHp.value.max) * 100)
})

const hpColorClass = computed(() => {
  if (hpPercentage.value > 50) return 'text-emerald-600 dark:text-emerald-400'
  if (hpPercentage.value > 25) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
})
</script>

<template>
  <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
    <!-- Header -->
    <button
      data-testid="summary-toggle"
      class="w-full flex items-center justify-between p-3 text-left"
      @click="isCollapsed = !isCollapsed"
    >
      <span class="font-medium text-neutral-900 dark:text-white">Party Summary</span>
      <UIcon
        :name="isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
        class="w-5 h-5 text-neutral-400"
      />
    </button>

    <!-- Content -->
    <div
      v-show="!isCollapsed"
      class="p-4 pt-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <!-- APL -->
      <div v-if="hasCharacters">
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">
          APL
        </h4>
        <div class="flex items-center gap-2">
          <span
            data-testid="apl-value"
            class="text-2xl font-bold text-neutral-900 dark:text-white"
          >{{ averagePartyLevel }}</span>
        </div>
      </div>

      <!-- Party HP -->
      <div
        v-if="hasCharacters"
        data-testid="party-hp"
      >
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">
          Party HP
        </h4>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ totalHp.current }}/{{ totalHp.max }}
          </span>
          <span
            data-testid="party-hp-percentage"
            class="text-sm font-medium"
            :class="hpColorClass"
          >
            ({{ hpPercentage }}%)
          </span>
        </div>
      </div>

      <!-- Languages -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">
          Languages
        </h4>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="lang in displayLanguages"
            :key="lang"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ lang }}
          </UBadge>
        </div>
      </div>

      <!-- Darkvision -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">
          Darkvision
        </h4>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">{{ summary.darkvision_count }}</span>
          <span class="text-sm text-neutral-500">have it</span>
        </div>
        <div
          v-if="summary.no_darkvision.length > 0"
          class="text-xs text-amber-600 dark:text-amber-400 mt-1"
        >
          ⚠️ {{ summary.no_darkvision.join(', ') }}
        </div>
      </div>

      <!-- Healers -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">
          Healers
        </h4>
        <template v-if="summary.has_healer">
          <div
            v-for="healer in summary.healers"
            :key="healer"
            class="text-sm text-emerald-600 dark:text-emerald-400"
          >
            ✓ {{ healer }}
          </div>
        </template>
        <div
          v-else
          class="text-sm text-rose-600 dark:text-rose-400"
        >
          ⚠️ No healer in party
        </div>
      </div>

      <!-- Utility Spells -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">
          Utility
        </h4>
        <div class="space-y-0.5 text-sm">
          <div
            data-testid="utility-detect-magic"
            :class="summary.has_detect_magic
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400'"
          >
            {{ summary.has_detect_magic ? '✓' : '✗' }} Detect Magic
          </div>
          <div
            data-testid="utility-dispel-magic"
            :class="summary.has_dispel_magic
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400'"
          >
            {{ summary.has_dispel_magic ? '✓' : '✗' }} Dispel Magic
          </div>
          <div
            data-testid="utility-counterspell"
            :class="summary.has_counterspell
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-400'"
          >
            {{ summary.has_counterspell ? '✓' : '✗' }} Counterspell
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

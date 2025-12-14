<!-- app/components/dm-screen/PartySummary.vue -->
<script setup lang="ts">
import type { DmScreenPartySummary } from '~/types/dm-screen'

interface Props {
  summary: DmScreenPartySummary
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const isCollapsed = computed({
  get: () => props.collapsed,
  set: (val) => emit('update:collapsed', val)
})

const displayLanguages = computed(() => props.summary.all_languages.slice(0, 3))
const moreLanguages = computed(() => Math.max(0, props.summary.all_languages.length - 3))
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
      class="p-4 pt-0 grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <!-- Languages -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">Languages</h4>
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
          <UBadge
            v-if="moreLanguages > 0"
            color="neutral"
            variant="outline"
            size="md"
          >
            +{{ moreLanguages }} more
          </UBadge>
        </div>
      </div>

      <!-- Darkvision -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">Darkvision</h4>
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
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">Healers</h4>
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
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-1">Utility</h4>
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

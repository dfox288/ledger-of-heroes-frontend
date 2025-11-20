<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// API configuration
const { apiFetch } = useApi()

// Fetch spell data using useAsyncData for SSR support (via Nitro proxy)
const { data: spell, error, pending } = await useAsyncData(
  `spell-${slug}`,
  async () => {
    const response = await apiFetch(`/spells/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => spell.value ? `${spell.value.name} - D&D 5e Spell` : 'Spell - D&D 5e Compendium'),
  description: computed(() => spell.value?.description?.substring(0, 160)),
})

/**
 * Format spell level for display
 */
const spellLevelText = computed(() => {
  if (!spell.value) return ''
  if (spell.value.level === 0) return 'Cantrip'
  const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']
  return `${spell.value.level}${suffix[spell.value.level]} Level`
})

/**
 * Get badge color for spell level
 */
const getLevelColor = (level: number): string => {
  if (level === 0) return 'primary'
  if (level <= 3) return 'info'
  if (level <= 6) return 'warning'
  return 'error'
}

/**
 * Get badge color for spell school
 */
const getSchoolColor = (schoolCode: string): string => {
  const colorMap: Record<string, string> = {
    'A': 'info',
    'C': 'primary',
    'D': 'info',
    'EN': 'warning',
    'EV': 'error',
    'I': 'primary',
    'N': 'neutral',
    'T': 'success',
  }
  return colorMap[schoolCode] || 'info'
}

/**
 * Format components for display
 */
const componentsText = computed(() => {
  if (!spell.value) return ''
  const parts = []
  if (spell.value.components.includes('V')) parts.push('Verbal')
  if (spell.value.components.includes('S')) parts.push('Somatic')
  if (spell.value.components.includes('M')) parts.push(`Material (${spell.value.material_components})`)
  return parts.join(', ')
})

/**
 * Get damage effects grouped by spell slot level
 */
const damageEffects = computed(() => {
  if (!spell.value?.effects) return []
  return spell.value.effects
    .filter((e: any) => e.effect_type === 'damage')
    .sort((a: any, b: any) => a.min_spell_slot - b.min_spell_slot)
})

// JSON debug toggle
const showJson = ref(false)
const jsonPanelRef = ref<HTMLElement | null>(null)

// Toggle JSON and scroll to it
const toggleJson = () => {
  showJson.value = !showJson.value
  if (showJson.value) {
    // Wait for DOM update, then scroll
    nextTick(() => {
      jsonPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

// Copy JSON to clipboard
const copyJson = () => {
  if (spell.value) {
    navigator.clipboard.writeText(JSON.stringify(spell.value, null, 2))
    // TODO: Show toast notification
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-gray-600 dark:text-gray-400">Loading spell...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Spell Not Found
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            The spell you're looking for doesn't exist or has been removed.
          </p>
          <UButton to="/search" color="primary">
            Back to Search
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Spell Content -->
    <div v-else-if="spell" class="space-y-8">
      <!-- Breadcrumb -->
      <div>
        <UButton to="/spells" variant="ghost" color="gray" icon="i-heroicons-arrow-left" size="sm">
          Back to Spells
        </UButton>
      </div>

      <!-- Header -->
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <UBadge
              :color="getLevelColor(spell.level)"
              variant="subtle"
              size="lg"
            >
              {{ spellLevelText }}
            </UBadge>
            <UBadge
              :color="getSchoolColor(spell.school.code)"
              variant="subtle"
              size="lg"
            >
              {{ spell.school.name }}
            </UBadge>
            <UBadge v-if="spell.is_ritual" color="info" variant="soft" size="sm">
              🔮 Ritual
            </UBadge>
            <UBadge v-if="spell.needs_concentration" color="warning" variant="soft" size="sm">
              ⭐ Concentration
            </UBadge>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {{ spell.name }}
          </h1>
        </div>
        <UButton
          @click="toggleJson"
          variant="ghost"
          color="gray"
          icon="i-heroicons-code-bracket"
          size="sm"
        >
          {{ showJson ? 'Hide' : 'View' }} JSON
        </UButton>
      </div>

      <!-- Quick Stats -->
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Casting Time
              </div>
              <div class="text-lg text-gray-900 dark:text-gray-100">
                {{ spell.casting_time }}
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-arrow-trending-up" class="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Range
              </div>
              <div class="text-lg text-gray-900 dark:text-gray-100">
                {{ spell.range }}
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Components
              </div>
              <div class="text-lg text-gray-900 dark:text-gray-100">
                {{ spell.components }}
              </div>
              <div v-if="spell.material_components" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ spell.material_components }}
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Duration
              </div>
              <div class="text-lg text-gray-900 dark:text-gray-100">
                {{ spell.duration }}
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Description (Always Visible) -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ spell.description }}</p>
        </div>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(spell.higher_levels ? [{
            label: 'At Higher Levels',
            slot: 'higher-levels',
            defaultOpen: false
          }] : []),
          ...(damageEffects.length > 0 ? [{
            label: 'Damage',
            slot: 'damage',
            defaultOpen: false
          }] : []),
          ...(spell.classes && spell.classes.length > 0 ? [{
            label: 'Available to Classes',
            slot: 'classes',
            defaultOpen: false
          }] : []),
          ...(spell.sources && spell.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Higher Levels Slot -->
        <template v-if="spell.higher_levels" #higher-levels>
          <div class="p-4">
            <p class="text-gray-700 dark:text-gray-300">{{ spell.higher_levels }}</p>
          </div>
        </template>

        <!-- Damage Slot -->
        <template v-if="damageEffects.length > 0" #damage>
          <div class="p-4 space-y-3">
            <div
              v-for="effect in damageEffects"
              :key="effect.id"
              class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">
                  {{ effect.description }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Spell Slot Level {{ effect.min_spell_slot }}
                </div>
              </div>
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ effect.dice_formula }}
              </div>
            </div>
          </div>
        </template>

        <!-- Classes Slot -->
        <template v-if="spell.classes && spell.classes.length > 0" #classes>
          <div class="p-4">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="cls in spell.classes"
                :key="cls.id"
                color="primary"
                variant="soft"
              >
                {{ cls.name }}
              </UBadge>
            </div>
          </div>
        </template>

        <!-- Source Slot -->
        <template v-if="spell.sources && spell.sources.length > 0" #source>
          <div class="p-4">
            <div class="flex flex-wrap gap-3">
              <div
                v-for="source in spell.sources"
                :key="source.code"
                class="flex items-center gap-2"
              >
                <UBadge color="gray" variant="soft">
                  {{ source.name }}
                </UBadge>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  p. {{ source.pages }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <div v-if="showJson" ref="jsonPanelRef">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Raw JSON Data
              </h2>
            <div class="flex gap-2">
              <UButton @click="copyJson" size="xs" variant="ghost" icon="i-heroicons-clipboard">
                Copy
              </UButton>
              <UButton @click="showJson = false" size="xs" variant="ghost" icon="i-heroicons-x-mark">
                Close
              </UButton>
            </div>
          </div>
          </template>
          <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ JSON.stringify(spell, null, 2) }}</code></pre>
        </UCard>
      </div>
    </div>
  </div>
</template>

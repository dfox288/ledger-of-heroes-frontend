<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

// Fetch race data using useAsyncData for SSR support (via Nitro proxy)
const { data: race, error, pending } = await useAsyncData(
  `race-${slug}`,
  async () => {
    const response = await apiFetch(`/races/${slug}`)
    return response.data
  }
)

// Set page meta
useSeoMeta({
  title: computed(() => race.value ? `${race.value.name} - D&D 5e Race` : 'Race - D&D 5e Compendium'),
  description: computed(() => race.value?.description?.substring(0, 160) || `Learn about the ${race.value?.name} race in D&D 5e`),
})

/**
 * Get size color based on size code (NuxtUI v4 semantic colors)
 */
const getSizeColor = computed(() => {
  if (!race.value?.size) return 'info'
  const colors: Record<string, string> = {
    'T': 'neutral',    // Tiny - gray
    'S': 'success',    // Small - green
    'M': 'info',       // Medium - blue
    'L': 'warning',    // Large - amber
    'H': 'error',      // Huge - red
    'G': 'error'       // Gargantuan - red
  }
  return colors[race.value.size.code] || 'info'
})

// JSON debug toggle
const showJson = ref(false)

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-gray-600 dark:text-gray-400">Loading race...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-12">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Race Not Found
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            The race you're looking for doesn't exist or has been removed.
          </p>
          <UButton to="/search" color="primary">
            Back to Search
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Race Content -->
    <div v-else-if="race" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <div>
        <NuxtLink to="/races">
          <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left" size="sm">
            Back to Races
          </UButton>
        </NuxtLink>
      </div>

      <!-- Header -->
      <div>
        <div class="flex items-center justify-between mb-3 flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <UBadge v-if="race.size" :color="getSizeColor" variant="subtle" size="lg">
              {{ race.size.name }}
            </UBadge>
            <UBadge v-if="race.parent_race" color="primary" variant="subtle" size="lg">
              Subrace
            </UBadge>
            <UBadge v-else color="info" variant="subtle" size="lg">
              Race
            </UBadge>
          </div>

          <!-- JSON Debug Button -->
          <UButton
            color="gray"
            variant="soft"
            size="sm"
            @click="showJson = !showJson"
          >
            <UIcon :name="showJson ? 'i-heroicons-eye-slash' : 'i-heroicons-code-bracket'" class="w-4 h-4" />
            {{ showJson ? 'Hide JSON' : 'View JSON' }}
          </UButton>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {{ race.name }}
        </h1>
      </div>

      <!-- Quick Stats -->
      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="race.size">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Size
            </div>
            <div class="text-gray-900 dark:text-gray-100">
              {{ race.size.name }}
            </div>
          </div>

          <div v-if="race.speed">
            <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Speed
            </div>
            <div class="text-gray-900 dark:text-gray-100">
              {{ race.speed }} ft.
            </div>
          </div>
        </div>
      </UCard>

      <!-- Description (Always Visible) -->
      <UCard v-if="race.description">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ race.description }}</p>
        </div>
      </UCard>

      <!-- Ability Score Increases (Always Visible) -->
      <UCard v-if="race.ability_score_increases && race.ability_score_increases.length > 0">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ability Score Increases
          </h2>
        </template>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="increase in race.ability_score_increases"
            :key="increase.id"
            class="px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20"
          >
            <span class="font-semibold text-gray-900 dark:text-gray-100">
              {{ increase.ability_score.code }}
            </span>
            <span class="text-primary-600 dark:text-primary-400 ml-1">
              +{{ increase.value }}
            </span>
          </div>
        </div>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(race.parent_race ? [{
            label: 'Parent Race',
            slot: 'parent',
            defaultOpen: false
          }] : []),
          ...(race.subraces && race.subraces.length > 0 ? [{
            label: 'Subraces',
            slot: 'subraces',
            defaultOpen: false
          }] : []),
          ...(race.traits && race.traits.length > 0 ? [{
            label: 'Racial Traits',
            slot: 'traits',
            defaultOpen: false
          }] : []),
          ...(race.modifiers && race.modifiers.length > 0 ? [{
            label: 'Modifiers',
            slot: 'modifiers',
            defaultOpen: false
          }] : []),
          ...(race.languages && race.languages.length > 0 ? [{
            label: 'Languages',
            slot: 'languages',
            defaultOpen: false
          }] : []),
          ...(race.proficiencies && race.proficiencies.length > 0 ? [{
            label: 'Proficiencies',
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(race.spells && race.spells.length > 0 ? [{
            label: 'Spells',
            slot: 'spells',
            defaultOpen: false
          }] : []),
          ...(race.conditions && race.conditions.length > 0 ? [{
            label: 'Conditions',
            slot: 'conditions',
            defaultOpen: false
          }] : []),
          ...(race.sources && race.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Parent Race Slot -->
        <template v-if="race.parent_race" #parent>
          <div class="p-4">
            <NuxtLink :to="`/races/${race.parent_race.slug}`">
              <UButton color="primary" variant="soft">
                View {{ race.parent_race.name }}
              </UButton>
            </NuxtLink>
          </div>
        </template>

        <!-- Subraces Slot -->
        <template v-if="race.subraces && race.subraces.length > 0" #subraces>
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NuxtLink
                v-for="subrace in race.subraces"
                :key="subrace.id"
                :to="`/races/${subrace.slug}`"
                class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="font-medium text-gray-900 dark:text-gray-100">{{ subrace.name }}</div>
                <div v-if="subrace.speed" class="text-sm text-gray-600 dark:text-gray-400">Speed: {{ subrace.speed }} ft</div>
              </NuxtLink>
            </div>
          </div>
        </template>

        <!-- Traits Slot -->
        <template v-if="race.traits && race.traits.length > 0" #traits>
          <div class="p-4 space-y-4">
            <div
              v-for="trait in race.traits"
              :key="trait.id"
              class="border-l-4 border-primary-500 pl-4 py-2"
            >
              <div class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {{ trait.name }}
              </div>
              <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ trait.description }}
              </div>
            </div>
          </div>
        </template>

        <!-- Languages Slot -->
        <template v-if="race.languages && race.languages.length > 0" #languages>
          <div class="p-4">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="lang in race.languages"
                :key="lang.language.id"
                color="neutral"
                variant="soft"
              >
                {{ lang.language.name }}
              </UBadge>
            </div>
          </div>
        </template>

        <!-- Modifiers Slot -->
        <template v-if="race.modifiers && race.modifiers.length > 0" #modifiers>
          <div class="p-4 space-y-3">
            <div
              v-for="modifier in race.modifiers"
              :key="modifier.id"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div class="font-medium text-gray-900 dark:text-gray-100">
                <template v-if="modifier.ability_score">
                  {{ modifier.ability_score.name }} ({{ modifier.ability_score.code }}): {{ modifier.value > 0 ? '+' : '' }}{{ modifier.value }}
                </template>
                <template v-else>
                  {{ modifier.modifier_category }}: {{ modifier.value > 0 ? '+' : '' }}{{ modifier.value }}
                </template>
              </div>
              <div v-if="modifier.condition" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ modifier.condition }}
              </div>
            </div>
          </div>
        </template>

        <!-- Proficiencies Slot -->
        <template v-if="race.proficiencies && race.proficiencies.length > 0" #proficiencies>
          <div class="p-4 space-y-2">
            <div
              v-for="prof in race.proficiencies"
              :key="prof.id"
              class="text-gray-700 dark:text-gray-300"
            >
              • {{ prof.proficiency_name }}
            </div>
          </div>
        </template>

        <!-- Spells Slot -->
        <template v-if="race.spells && race.spells.length > 0" #spells>
          <div class="p-4">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="spell in race.spells"
                :key="spell.id"
                color="primary"
                variant="soft"
              >
                {{ spell.name }}
              </UBadge>
            </div>
          </div>
        </template>

        <!-- Conditions Slot -->
        <template v-if="race.conditions && race.conditions.length > 0" #conditions>
          <div class="p-4 space-y-3">
            <div
              v-for="conditionRelation in race.conditions"
              :key="conditionRelation.id"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div class="flex items-start gap-3">
                <UBadge color="warning" variant="soft">
                  {{ conditionRelation.condition.name }}
                </UBadge>
                <div class="flex-1">
                  <div v-if="conditionRelation.effect_type" class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Effect: {{ conditionRelation.effect_type.charAt(0).toUpperCase() + conditionRelation.effect_type.slice(1) }}
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ conditionRelation.condition.description }}
                  </div>
                  <div v-if="conditionRelation.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    {{ conditionRelation.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Source Slot -->
        <template v-if="race.sources && race.sources.length > 0" #source>
          <SourceDisplay :sources="race.sources" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel
        :data="race"
        :visible="showJson"
        @close="showJson = false"
      />

      <!-- Back Button -->
      <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink to="/races">
          <UButton color="gray" variant="soft" icon="i-heroicons-arrow-left">
            Back to Races
          </UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

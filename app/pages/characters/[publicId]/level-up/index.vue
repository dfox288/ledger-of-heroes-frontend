<!-- app/pages/characters/[publicId]/level-up/index.vue -->
<script setup lang="ts">
/**
 * Level-Up Preview Page
 *
 * Shows character info and preview of upcoming choices.
 * User clicks "Begin Level Up" to trigger the API and start the wizard.
 *
 * URL: /characters/:publicId/level-up
 */
import { useCharacterLevelUpStore, type CharacterClassEntry } from '~/stores/characterLevelUp'

const route = useRoute()
const publicId = computed(() => route.params.publicId as string)

const store = useCharacterLevelUpStore()
const { apiFetch } = useApi()

// ════════════════════════════════════════════════════════════════
// FETCH CHARACTER DATA
// ════════════════════════════════════════════════════════════════

interface CharacterResponse {
  data: {
    id: number
    public_id: string
    name: string
    classes: Array<{
      class: { name: string, slug: string, hit_die: number }
      level: number
      subclass?: { name: string, slug: string } | null
      is_primary: boolean
    }>
    is_complete: boolean
  }
}

const { data: characterData, pending: loading, error } = await useAsyncData(
  `level-up-preview-${publicId.value}`,
  () => apiFetch<CharacterResponse>(`/characters/${publicId.value}`)
)

const character = computed(() => characterData.value?.data ?? null)

const currentLevel = computed(() =>
  character.value?.classes?.reduce((sum, c) => sum + (c.level || 0), 0) ?? 0
)

const targetLevel = computed(() => currentLevel.value + 1)

const primaryClass = computed(() =>
  character.value?.classes?.find(c => c.is_primary) ?? character.value?.classes?.[0] ?? null
)

const isMulticlass = computed(() => (character.value?.classes?.length ?? 0) > 1)

// ════════════════════════════════════════════════════════════════
// LEVEL-UP INITIATION
// ════════════════════════════════════════════════════════════════

const selectedClassSlug = ref<string | undefined>(undefined)
const isStarting = ref(false)
const startError = ref<string | null>(null)

// For single-class, auto-select
watchEffect(() => {
  if (!isMulticlass.value && primaryClass.value) {
    selectedClassSlug.value = primaryClass.value.class?.slug ?? undefined
  }
})

async function beginLevelUp() {
  if (!character.value || !selectedClassSlug.value) return

  isStarting.value = true
  startError.value = null

  try {
    // Initialize store
    const classEntries: CharacterClassEntry[] = (character.value.classes ?? []).map(c => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      class: c.class as any, // API returns partial class data
      level: c.level,
      subclass: c.subclass ? { name: c.subclass.name, slug: c.subclass.slug } : null,
      is_primary: c.is_primary
    }))

    store.characterId = character.value.id
    store.publicId = character.value.public_id
    store.characterClasses = classEntries
    store.totalLevel = currentLevel.value

    // Call level-up API
    await store.levelUp(selectedClassSlug.value)

    // Navigate to first step (hit-points for single-class, or based on pending choices)
    const firstStep = store.hasSubclassChoice ? 'subclass' : 'hit-points'
    await navigateTo(`/characters/${publicId.value}/level-up/${firstStep}`)
  } catch (e) {
    startError.value = e instanceof Error ? e.message : 'Failed to start level-up'
  } finally {
    isStarting.value = false
  }
}

// ════════════════════════════════════════════════════════════════
// RESUME INCOMPLETE LEVEL-UP
// ════════════════════════════════════════════════════════════════

// Check if character has incomplete level-up (pending choices)
const shouldResume = computed(() => character.value?.is_complete === false)

async function resumeLevelUp() {
  if (!character.value) return

  isStarting.value = true

  try {
    // Initialize store
    const classEntries: CharacterClassEntry[] = (character.value.classes ?? []).map(c => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      class: c.class as any, // API returns partial class data
      level: c.level,
      subclass: c.subclass ? { name: c.subclass.name, slug: c.subclass.slug } : null,
      is_primary: c.is_primary
    }))

    store.characterId = character.value.id
    store.publicId = character.value.public_id
    store.characterClasses = classEntries
    store.totalLevel = currentLevel.value

    // Fetch pending choices
    await store.fetchPendingChoices()

    // Determine first step based on pending choices
    // Note: ASI uses type='ability_score' with subtype='asi_or_feat' per API contract
    const hasSubclass = store.pendingChoices.some(c => c.type === 'subclass')
    const hasHp = store.pendingChoices.some(c => c.type === 'hit_points')
    const hasAsi = store.pendingChoices.some(
      c => c.type === 'ability_score' && c.subtype === 'asi_or_feat'
    )
    const hasFeature = store.pendingChoices.some(c =>
      ['fighting_style', 'expertise', 'optional_feature'].includes(c.type)
    )
    const hasSpell = store.pendingChoices.some(c => c.type === 'spell')
    const hasLanguage = store.pendingChoices.some(c => c.type === 'language')
    const hasProficiency = store.pendingChoices.some(c => c.type === 'proficiency')

    let firstStep = 'summary'
    if (hasSubclass) firstStep = 'subclass'
    else if (hasHp) firstStep = 'hit-points'
    else if (hasAsi) firstStep = 'asi-feat'
    else if (hasFeature) firstStep = 'feature-choices'
    else if (hasSpell) firstStep = 'spells'
    else if (hasLanguage) firstStep = 'languages'
    else if (hasProficiency) firstStep = 'proficiencies'

    await navigateTo(`/characters/${publicId.value}/level-up/${firstStep}`)
  } catch (e) {
    startError.value = e instanceof Error ? e.message : 'Failed to resume level-up'
    isStarting.value = false
  }
}

// Auto-resume if character has pending choices
onMounted(() => {
  if (shouldResume.value) {
    resumeLevelUp()
  }
})

// ════════════════════════════════════════════════════════════════
// SEO
// ════════════════════════════════════════════════════════════════

useSeoMeta({
  title: () => `Level Up - ${character.value?.name ?? 'Character'}`
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-2xl mx-auto px-4 py-12">
      <!-- Back Link -->
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left"
        :to="`/characters/${publicId}`"
        class="mb-8"
      >
        Back to Character
      </UButton>

      <!-- Loading State -->
      <div
        v-if="loading || isStarting"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 animate-spin text-primary"
        />
        <p class="mt-4 text-gray-500">
          {{ isStarting ? 'Starting level up...' : 'Loading character...' }}
        </p>
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error || startError"
        color="error"
        icon="i-heroicons-exclamation-circle"
        :title="error?.message || startError || 'An error occurred'"
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

      <!-- Preview Card -->
      <UCard
        v-else-if="character"
        class="text-center"
      >
        <template #header>
          <div class="flex items-center justify-center gap-2">
            <UIcon
              name="i-heroicons-arrow-trending-up"
              class="w-6 h-6 text-primary"
            />
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Level Up
            </h1>
          </div>
        </template>

        <!-- Character Info -->
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ character.name }}
            </h2>
            <p class="text-gray-500">
              {{ primaryClass?.class?.name }} {{ currentLevel }}
            </p>
          </div>

          <!-- Level Transition -->
          <div class="flex items-center justify-center gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-400">
                {{ currentLevel }}
              </div>
              <div class="text-sm text-gray-500">
                Current
              </div>
            </div>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-8 h-8 text-primary"
            />
            <div class="text-center">
              <div class="text-3xl font-bold text-primary">
                {{ targetLevel }}
              </div>
              <div class="text-sm text-gray-500">
                Target
              </div>
            </div>
          </div>

          <!-- Multiclass Selection (if applicable) -->
          <div
            v-if="isMulticlass"
            class="pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Level up which class?
            </label>
            <USelect
              v-model="selectedClassSlug"
              :items="character.classes.map(c => ({
                label: `${c.class.name} (Level ${c.level})`,
                value: c.class.slug ?? ''
              }))"
              placeholder="Select a class"
            />
          </div>

          <!-- What's Ahead Preview -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700 text-left">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's ahead:
            </h3>
            <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-heart"
                  class="w-4 h-4"
                />
                Choose HP increase (roll or average)
              </li>
              <li
                v-if="targetLevel % 4 === 0"
                class="flex items-center gap-2"
              >
                <UIcon
                  name="i-heroicons-arrow-trending-up"
                  class="w-4 h-4"
                />
                Ability Score Improvement or Feat
              </li>
            </ul>
          </div>
        </div>

        <template #footer>
          <UButton
            color="primary"
            size="lg"
            block
            :disabled="!selectedClassSlug"
            @click="beginLevelUp"
          >
            Begin Level Up
          </UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>

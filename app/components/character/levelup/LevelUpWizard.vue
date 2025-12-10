<!-- app/components/character/levelup/LevelUpWizard.vue -->
<script setup lang="ts">
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import { useLevelUpWizard } from '~/composables/useLevelUpWizard'

const store = useCharacterLevelUpStore()
const { nextStep } = useLevelUpWizard()

// Track HP gained for summary
const hpGained = ref<number>(0)

// Get character stats for HP calculation (CON modifier, hit die)
const { apiFetch } = useApi()
const characterStats = ref<{ constitution_modifier: number } | null>(null)
const isLoadingStats = ref(false)

// Fetch character stats when wizard opens
watch(() => store.isOpen, async (open) => {
  if (open && store.publicId) {
    isLoadingStats.value = true
    try {
      const response = await apiFetch<{ data: { constitution_modifier: number } }>(
        `/characters/${store.publicId}/stats`
      )
      characterStats.value = response.data
    } catch (e) {
      // Stats fetch failed - will use default CON mod of 0
      characterStats.value = { constitution_modifier: 0 }
    } finally {
      isLoadingStats.value = false
    }
  }
})

// Get hit die for selected class
const hitDie = computed(() => {
  if (!store.selectedClassSlug || !store.characterClasses.length) return 8
  const cls = store.characterClasses.find(
    c => c.class?.full_slug === store.selectedClassSlug || c.class?.slug === store.selectedClassSlug
  )
  return cls?.class?.hit_die ?? 8
})

const conModifier = computed(() => characterStats.value?.constitution_modifier ?? 0)

// Get class name for summary
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

function handleComplete() {
  emit('level-up-complete')
}

const emit = defineEmits<{
  'level-up-complete': []
}>()
</script>

<template>
  <UModal
    v-if="store.isOpen"
    v-model:open="store.isOpen"
    fullscreen
    :prevent-close="true"
  >
    <div
      data-testid="level-up-wizard"
      class="flex h-full"
    >
      <!-- Sidebar -->
      <div class="w-64 flex-shrink-0">
        <CharacterLevelupLevelUpSidebar />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Header with close button -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            Level Up
          </h1>
          <UButton
            data-testid="close-button"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-x-mark"
            @click="store.closeWizard()"
          />
        </div>

        <!-- Step Content -->
        <div class="flex-1 overflow-y-auto p-8">
          <!-- Error State -->
          <UAlert
            v-if="store.error"
            color="error"
            icon="i-heroicons-exclamation-circle"
            :title="store.error"
            class="mb-6"
          />

          <!-- Loading State -->
          <div
            v-if="store.isLoading"
            data-testid="loading-spinner"
            class="flex justify-center py-12"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-8 h-8 animate-spin text-primary"
            />
          </div>

          <!-- Step Components -->
          <template v-else>
            <!-- Class Selection Step (placeholder for multiclass) -->
            <div v-if="store.currentStepName === 'class-selection'">
              <p class="text-center text-gray-500">
                Class selection coming soon...
              </p>
            </div>

            <!-- Hit Points Step -->
            <template v-else-if="store.currentStepName === 'hit-points'">
              <!-- Show loading while fetching stats -->
              <div
                v-if="isLoadingStats"
                class="flex flex-col items-center justify-center py-12"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="w-8 h-8 animate-spin text-primary"
                />
                <p class="mt-4 text-gray-500">
                  Loading character stats...
                </p>
              </div>
              <CharacterLevelupStepHitPoints
                v-else
                :hit-die="hitDie"
                :con-modifier="conModifier"
                @choice-made="handleHpChoice"
              />
            </template>

            <!-- ASI/Feat Step (reuse existing) -->
            <CharacterWizardStepFeats
              v-else-if="store.currentStepName === 'asi-feat'"
            />

            <!-- Spells Step (reuse existing) -->
            <CharacterWizardStepSpells
              v-else-if="store.currentStepName === 'spells'"
            />

            <!-- Summary Step -->
            <CharacterLevelupStepLevelUpSummary
              v-else-if="store.currentStepName === 'summary' && store.levelUpResult"
              :level-up-result="store.levelUpResult"
              :class-name="className"
              :hp-gained="hpGained"
              @complete="handleComplete"
            />

            <!-- Fallback for unknown step -->
            <div
              v-else
              class="text-center text-gray-500"
            >
              <p>Unknown step: {{ store.currentStepName }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </UModal>
</template>

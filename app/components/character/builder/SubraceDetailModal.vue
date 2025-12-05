<!-- app/components/character/builder/SubraceDetailModal.vue -->
<script setup lang="ts">
import type { Race } from '~/types'

interface Props {
  subrace: Race | null
  open: boolean
  /** Parent race for showing inherited traits */
  parentRace?: Race | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Use local ref for v-model binding
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit('close')
  }
})

/**
 * Get subrace-specific ability score modifiers
 */
const abilityModifiers = computed(() => {
  if (!props.subrace?.modifiers) return []
  return props.subrace.modifiers.filter(m =>
    m.modifier_category === 'ability_score' && m.ability_score
  )
})

/**
 * Get inherited ability modifiers from parent race
 */
const inheritedAbilityModifiers = computed(() => {
  // Check inherited_data first (if subrace was loaded with parent)
  const inherited = props.subrace?.inherited_data?.modifiers
  if (inherited && inherited.length > 0) {
    return inherited.filter(m =>
      m.modifier_category === 'ability_score' && m.ability_score
    )
  }

  // Fall back to parent race modifiers
  if (!props.parentRace?.modifiers) return []
  return props.parentRace.modifiers.filter(m =>
    m.modifier_category === 'ability_score' && m.ability_score
  )
})

/**
 * Format speed display
 */
const speedDisplay = computed(() => {
  if (!props.subrace) return []
  const speeds: string[] = []
  if (props.subrace.speed) speeds.push(`${props.subrace.speed} ft walk`)
  if (props.subrace.fly_speed) speeds.push(`${props.subrace.fly_speed} ft fly`)
  if (props.subrace.swim_speed) speeds.push(`${props.subrace.swim_speed} ft swim`)
  if (props.subrace.climb_speed) speeds.push(`${props.subrace.climb_speed} ft climb`)
  return speeds
})

/**
 * Get subrace-specific traits
 */
const subraceTraits = computed(() => {
  return props.subrace?.traits ?? []
})

/**
 * Get inherited traits from parent race
 */
const inheritedTraits = computed(() => {
  // Check inherited_data first
  const inherited = props.subrace?.inherited_data?.traits
  if (inherited && inherited.length > 0) {
    return inherited
  }

  // Fall back to parent race traits
  return props.parentRace?.traits ?? []
})

/**
 * Get subrace-specific languages
 */
const subraceLanguages = computed(() => {
  return props.subrace?.languages ?? []
})

/**
 * Get inherited languages from parent race
 */
const inheritedLanguages = computed(() => {
  // Check inherited_data first (if subrace was loaded with parent)
  const inherited = props.subrace?.inherited_data?.languages
  if (inherited && inherited.length > 0) {
    return inherited
  }

  // Fall back to parent race languages
  return props.parentRace?.languages ?? []
})

/**
 * Get subrace-specific proficiencies
 */
const subraceProficiencies = computed(() => {
  return props.subrace?.proficiencies ?? []
})

/**
 * Get inherited proficiencies from parent race
 */
const inheritedProficiencies = computed(() => {
  // Check inherited_data first (if subrace was loaded with parent)
  const inherited = props.subrace?.inherited_data?.proficiencies
  if (inherited && inherited.length > 0) {
    return inherited
  }

  // Fall back to parent race proficiencies
  return props.parentRace?.proficiencies ?? []
})

// handleClose function defined for potential future use in template
// Currently the modal uses v-model:open which handles close automatically
function _handleClose() {
  emit('close')
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="subrace?.name ?? 'Subrace Details'"
  >
    <template #body>
      <div
        v-if="subrace"
        class="space-y-6"
      >
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Size
            </h4>
            <p class="text-gray-600 dark:text-gray-400">
              {{ subrace.size?.name || parentRace?.size?.name || 'Medium' }}
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Speed
            </h4>
            <p class="text-gray-600 dark:text-gray-400">
              {{ speedDisplay.join(', ') || 'Unknown' }}
            </p>
          </div>
        </div>

        <!-- Inherited Ability Score Modifiers (from base race) -->
        <div v-if="inheritedAbilityModifiers.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Base Race Ability Increases
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              (from {{ parentRace?.name || 'parent race' }})
            </span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="mod in inheritedAbilityModifiers"
              :key="mod.id"
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ mod.ability_score?.name }} +{{ mod.value }}
            </UBadge>
          </div>
        </div>

        <!-- Subrace Ability Score Modifiers -->
        <div v-if="abilityModifiers.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Subrace Ability Increases
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="mod in abilityModifiers"
              :key="mod.id"
              color="race"
              variant="subtle"
              size="md"
            >
              {{ mod.ability_score?.name }} +{{ mod.value }}
            </UBadge>
          </div>
        </div>

        <!-- Inherited Traits (from base race) -->
        <div v-if="inheritedTraits.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Base Race Traits
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              (from {{ parentRace?.name || 'parent race' }})
            </span>
          </h4>
          <div class="space-y-3">
            <div
              v-for="trait in inheritedTraits"
              :key="trait.id"
              class="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3"
            >
              <h5 class="font-medium text-gray-700 dark:text-gray-300">
                {{ trait.name }}
              </h5>
              <p
                v-if="trait.description"
                class="text-sm text-gray-600 dark:text-gray-400 mt-1"
              >
                {{ trait.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Subrace-specific Traits -->
        <div v-if="subraceTraits.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Subrace Traits
          </h4>
          <div class="space-y-3">
            <div
              v-for="trait in subraceTraits"
              :key="trait.id"
              class="bg-race-50 dark:bg-race-900/30 rounded-lg p-3 border border-race-200 dark:border-race-800"
            >
              <h5 class="font-medium text-gray-900 dark:text-gray-100">
                {{ trait.name }}
              </h5>
              <p
                v-if="trait.description"
                class="text-sm text-gray-600 dark:text-gray-400 mt-1"
              >
                {{ trait.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Inherited Proficiencies (from base race) -->
        <div v-if="inheritedProficiencies.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Base Race Proficiencies
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              (from {{ parentRace?.name || 'parent race' }})
            </span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="prof in inheritedProficiencies"
              :key="prof.id"
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ prof.proficiency_name || prof.skill?.name || prof.item?.name || prof.proficiency_type }}
            </UBadge>
          </div>
        </div>

        <!-- Subrace Proficiencies -->
        <div v-if="subraceProficiencies.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Subrace Proficiencies
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="prof in subraceProficiencies"
              :key="prof.id"
              color="neutral"
              variant="outline"
              size="md"
            >
              {{ prof.proficiency_name || prof.skill?.name || prof.item?.name || prof.proficiency_type }}
            </UBadge>
          </div>
        </div>

        <!-- Inherited Languages (from base race) -->
        <div v-if="inheritedLanguages.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Base Race Languages
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              (from {{ parentRace?.name || 'parent race' }})
            </span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(lang, index) in inheritedLanguages"
              :key="lang.language?.id ?? index"
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ lang.language?.name || 'Language Choice' }}
            </UBadge>
          </div>
        </div>

        <!-- Subrace Languages -->
        <div v-if="subraceLanguages.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Subrace Languages
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(lang, index) in subraceLanguages"
              :key="lang.language?.id ?? index"
              color="neutral"
              variant="outline"
              size="md"
            >
              {{ lang.language?.name || 'Language Choice' }}
            </UBadge>
          </div>
        </div>

        <!-- Source -->
        <div
          v-if="subrace.sources && subrace.sources.length > 0"
          class="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          Source: {{ subrace.sources.map(s => s.name).join(', ') }}
        </div>
      </div>
    </template>
  </UModal>
</template>

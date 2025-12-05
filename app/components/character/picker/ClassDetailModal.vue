<!-- app/components/character/builder/ClassDetailModal.vue -->
<script setup lang="ts">
import type { CharacterClass } from '~/types'

interface Props {
  characterClass: CharacterClass | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Use local ref for v-model binding (matches RaceDetailModal pattern)
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit('close')
  }
})

/**
 * Check if class is a spellcaster
 */
const isCaster = computed(() => {
  return props.characterClass?.spellcasting_ability !== null
    && props.characterClass?.spellcasting_ability !== undefined
})

/**
 * Format hit die
 */
const hitDieText = computed(() => {
  return `d${props.characterClass?.hit_die}`
})

function handleClose() {
  emit('close')
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="characterClass?.name ?? 'Class Details'"
  >
    <template #body>
      <div
        v-if="characterClass"
        class="space-y-6"
      >
        <!-- Description -->
        <p
          v-if="characterClass.description"
          class="text-gray-700 dark:text-gray-300"
        >
          {{ characterClass.description }}
        </p>

        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Hit Die
            </h4>
            <p class="text-gray-600 dark:text-gray-400">
              {{ hitDieText }}
            </p>
          </div>
          <div v-if="characterClass.primary_ability">
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Primary Ability
            </h4>
            <p class="text-gray-600 dark:text-gray-400">
              {{ characterClass.primary_ability }}
            </p>
          </div>
        </div>

        <!-- Proficiencies -->
        <div v-if="characterClass.proficiencies && characterClass.proficiencies.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Proficiencies
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="prof in characterClass.proficiencies.slice(0, 6)"
              :key="prof.id"
              color="class"
              variant="subtle"
              size="md"
            >
              {{ prof.proficiency_type_detail?.name || prof.proficiency_type }}
            </UBadge>
            <UBadge
              v-if="characterClass.proficiencies.length > 6"
              color="neutral"
              variant="subtle"
              size="md"
            >
              +{{ characterClass.proficiencies.length - 6 }} more
            </UBadge>
          </div>
        </div>

        <!-- Spellcasting -->
        <div v-if="isCaster">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Spellcasting
          </h4>
          <div class="bg-spell-50 dark:bg-spell-900/20 rounded-lg p-3">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-sparkles"
                class="w-5 h-5 text-spell-500"
              />
              <span class="text-gray-700 dark:text-gray-300">
                Spellcasting Ability: <strong>{{ characterClass.spellcasting_ability?.name }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

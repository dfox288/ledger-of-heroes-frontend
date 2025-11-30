<script setup lang="ts">
import type { SpellEffect, SpellSavingThrow } from '~/types'
import { getDamageTypeColor } from '~/utils/badgeColors'

interface Props {
  effects: SpellEffect[]
  savingThrows: SpellSavingThrow[]
  areaOfEffect: { type: string, size: number } | null
}

const props = defineProps<Props>()

// Check if component should render (only if combat data exists)
const hasCombatData = computed(() => {
  return (
    props.effects.length > 0
    || props.savingThrows.length > 0
    || props.areaOfEffect !== null
  )
})

// Filter effects that have damage
const damageEffects = computed(() => {
  return props.effects.filter(
    effect => effect.effect_type === 'damage' && effect.damage_type
  )
})

// Filter effects that apply conditions
const conditionEffects = computed(() => {
  return props.effects.filter(effect => effect.effect_type === 'condition')
})

// Format area of effect text
const areaOfEffectText = computed(() => {
  if (!props.areaOfEffect) return null
  const { size, type } = props.areaOfEffect
  return {
    size: `${size} ft.`,
    type: type.charAt(0).toUpperCase() + type.slice(1)
  }
})
</script>

<template>
  <UCard
    v-if="hasCombatData"
    class="border-2 border-spell-200 dark:border-spell-800"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-2">
        <span
          class="text-xl"
          aria-hidden="true"
        >⚔️</span>
        <h2 class="text-lg font-bold tracking-wide">
          COMBAT MECHANICS
        </h2>
      </div>
    </template>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Damage Section -->
      <div
        v-if="damageEffects.length > 0"
        class="space-y-2"
      >
        <div class="flex items-center gap-2 mb-3">
          <span
            class="text-xl"
            aria-hidden="true"
          >💥</span>
          <h3 class="text-sm font-bold text-gray-600 dark:text-gray-400">
            DAMAGE
          </h3>
        </div>

        <div
          v-for="effect in damageEffects"
          :key="effect.id"
          class="space-y-1"
        >
          <div class="text-lg font-semibold">
            {{ effect.dice_formula }}
          </div>
          <UBadge
            v-if="effect.damage_type"
            :color="getDamageTypeColor(effect.damage_type.name)"
            variant="subtle"
            size="md"
          >
            {{ effect.damage_type.name }}
          </UBadge>
        </div>
      </div>

      <!-- Saving Throw Section -->
      <div
        v-if="savingThrows.length > 0"
        class="space-y-2"
      >
        <div class="flex items-center gap-2 mb-3">
          <span
            class="text-xl"
            aria-hidden="true"
          >🎯</span>
          <h3 class="text-sm font-bold text-gray-600 dark:text-gray-400">
            SAVE
          </h3>
        </div>

        <div
          v-for="(save, index) in savingThrows"
          :key="index"
          class="space-y-1"
        >
          <div class="text-lg font-semibold">
            {{ save.ability_score.code }}
          </div>
          <div class="text-sm text-gray-700 dark:text-gray-300">
            {{ save.save_effect }}
          </div>
        </div>
      </div>

      <!-- Area of Effect Section -->
      <div
        v-if="areaOfEffect"
        class="space-y-2"
      >
        <div class="flex items-center gap-2 mb-3">
          <span
            class="text-xl"
            aria-hidden="true"
          >📐</span>
          <h3 class="text-sm font-bold text-gray-600 dark:text-gray-400">
            AREA
          </h3>
        </div>

        <div class="space-y-1">
          <div class="text-lg font-semibold">
            {{ areaOfEffectText?.size }}
          </div>
          <div class="text-sm text-gray-700 dark:text-gray-300">
            {{ areaOfEffectText?.type }}
          </div>
        </div>
      </div>

      <!-- Condition Section -->
      <div
        v-if="conditionEffects.length > 0"
        class="space-y-2"
      >
        <div class="flex items-center gap-2 mb-3">
          <span
            class="text-xl"
            aria-hidden="true"
          >😵</span>
          <h3 class="text-sm font-bold text-gray-600 dark:text-gray-400">
            CONDITION
          </h3>
        </div>

        <div
          v-for="effect in conditionEffects"
          :key="effect.id"
          class="text-sm text-gray-700 dark:text-gray-300"
        >
          {{ effect.description }}
        </div>
      </div>
    </div>
  </UCard>
</template>

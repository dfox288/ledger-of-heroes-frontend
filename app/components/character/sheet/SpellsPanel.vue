<!-- app/components/character/sheet/SpellsPanel.vue -->
<script setup lang="ts">
import type { CharacterSpell, CharacterStats } from '~/types/character'

const props = defineProps<{
  spells: CharacterSpell[]
  stats: CharacterStats
}>()

// Filter out dangling spell references (sourcebook removed)
const validSpells = computed(() => props.spells.filter(s => s.spell !== null))
const cantrips = computed(() => validSpells.value.filter(s => s.spell!.level === 0))
const leveledSpells = computed(() => validSpells.value.filter(s => s.spell!.level > 0))

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}
</script>

<template>
  <div class="space-y-4">
    <!-- Spellcasting stats -->
    <div
      v-if="stats.spellcasting"
      class="flex gap-4 flex-wrap"
    >
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-center">
        <div class="text-xs text-gray-500 uppercase">
          Spell DC
        </div>
        <div class="text-lg font-bold">
          {{ stats.spellcasting.spell_save_dc }}
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-center">
        <div class="text-xs text-gray-500 uppercase">
          Attack
        </div>
        <div class="text-lg font-bold">
          {{ formatModifier(stats.spellcasting.spell_attack_bonus) }}
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-center">
        <div class="text-xs text-gray-500 uppercase">
          Ability
        </div>
        <div class="text-lg font-bold">
          {{ stats.spellcasting.ability }}
        </div>
      </div>
    </div>

    <!-- Cantrips -->
    <div v-if="cantrips.length > 0">
      <h4 class="text-sm font-semibold text-gray-500 uppercase mb-2">
        Cantrips
      </h4>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="spell in cantrips"
          :key="spell.id"
          color="spell"
          variant="subtle"
          size="md"
        >
          {{ spell.spell!.name }}
        </UBadge>
      </div>
    </div>

    <!-- Leveled Spells -->
    <div v-if="leveledSpells.length > 0">
      <h4 class="text-sm font-semibold text-gray-500 uppercase mb-2">
        Spells
      </h4>
      <ul class="space-y-1">
        <li
          v-for="spell in leveledSpells"
          :key="spell.id"
          class="flex items-center gap-2"
        >
          <UIcon
            :name="spell.is_prepared ? 'i-heroicons-check-circle' : 'i-heroicons-minus-circle'"
            :class="spell.is_prepared ? 'text-success-500' : 'text-gray-400'"
            class="w-4 h-4"
          />
          <span class="text-gray-900 dark:text-white">{{ spell.spell!.name }}</span>
          <UBadge
            color="neutral"
            variant="subtle"
            size="xs"
          >
            Lvl {{ spell.spell!.level }}
          </UBadge>
        </li>
      </ul>
    </div>

    <div
      v-if="validSpells.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      No spells known
    </div>
  </div>
</template>

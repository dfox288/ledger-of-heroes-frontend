<!-- app/components/character/sheet/SpellsPanel.vue -->
<script setup lang="ts">
/**
 * Spells Panel
 *
 * Displays character's spellcasting stats, spell slots, and spell lists.
 * Integrates with characterPlayStateStore for interactive spell slots
 * and preparation toggling.
 *
 * @see Issue #556 - Spells Tab
 * @see Issue #616 - Spell slot tracking
 * @see Issue #631 - Multiclass spellcasting support
 */
import { storeToRefs } from 'pinia'
import type { CharacterSpell, CharacterStats } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import { getPrimarySpellcasting } from '~/utils/classColors'
import { formatModifier } from '~/utils/formatModifier'

const props = defineProps<{
  spells: CharacterSpell[]
  stats: CharacterStats
  characterId: number
  editable: boolean
}>()

const store = useCharacterPlayStateStore()
const { atPreparationLimit } = storeToRefs(store)

// Filter out dangling spell references (sourcebook removed)
const validSpells = computed(() => props.spells.filter(s => s.spell !== null))
const cantrips = computed(() => validSpells.value.filter(s => s.spell!.level === 0))
const leveledSpells = computed(() => validSpells.value.filter(s => s.spell!.level > 0))

// Extract primary spellcasting info (for multiclass, uses first class)
const primarySpellcasting = computed(() => getPrimarySpellcasting(props.stats.spellcasting))
</script>

<template>
  <div class="space-y-4">
    <!-- Spellcasting stats -->
    <div
      v-if="primarySpellcasting"
      class="flex gap-4 flex-wrap"
    >
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-center">
        <div class="text-xs text-gray-500 uppercase">
          Spell DC
        </div>
        <div class="text-lg font-bold">
          {{ primarySpellcasting.info.spell_save_dc }}
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-center">
        <div class="text-xs text-gray-500 uppercase">
          Attack
        </div>
        <div class="text-lg font-bold">
          {{ formatModifier(primarySpellcasting.info.spell_attack_bonus) }}
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 text-center">
        <div class="text-xs text-gray-500 uppercase">
          Ability
        </div>
        <div class="text-lg font-bold">
          {{ primarySpellcasting.info.ability }}
        </div>
      </div>
    </div>

    <!-- Preparation counter -->
    <div
      v-if="stats.preparation_limit !== null"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      Prepared: {{ stats.prepared_spell_count }} / {{ stats.preparation_limit }}
    </div>

    <!-- Interactive Spell Slots Manager -->
    <CharacterSheetSpellSlotsManager
      v-if="stats.spell_slots && (Array.isArray(stats.spell_slots) ? stats.spell_slots.some(s => s > 0) : Object.values(stats.spell_slots).some(s => s > 0))"
      :character-id="characterId"
      :editable="editable"
    />

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

    <!-- Leveled Spells (grouped by level) -->
    <CharacterSheetSpellsByLevel
      v-if="leveledSpells.length > 0"
      :spells="leveledSpells"
      :character-id="characterId"
      :editable="editable"
      :at-prep-limit="atPreparationLimit"
    />

    <div
      v-if="validSpells.length === 0"
      data-testid="empty-state"
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      <UIcon
        name="i-heroicons-sparkles"
        class="w-8 h-8 mx-auto mb-2"
      />
      <p>No spells known</p>
    </div>
  </div>
</template>

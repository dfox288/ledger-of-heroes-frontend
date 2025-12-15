<!-- app/components/character/sheet/SpellbookView.vue -->
<script setup lang="ts">
/**
 * Two-column spellbook view for wizards
 *
 * Main container showing spellbook (left) and prepared spells (right).
 * Handles toggle preparation logic via store.
 *
 * @see Issue #680 - Wizard Spellbook Phase 2
 */
import { storeToRefs } from 'pinia'
import type { CharacterSpell } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  spells: CharacterSpell[]
  preparedCount: number
  preparationLimit: number
  characterId: number
}>()

const store = useCharacterPlayStateStore()
const { atPreparationLimit } = storeToRefs(store)

async function handleToggle(spell: CharacterSpell) {
  try {
    await store.toggleSpellPreparation(spell.id, spell.is_prepared)
  } catch {
    // Error handled by store (shows toast)
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Spellbook Column (unprepared) -->
    <div data-testid="spellbook-column">
      <CharacterSheetSpellbookColumn
        :spells="spells"
        :at-prep-limit="atPreparationLimit"
        @toggle="handleToggle"
      />
    </div>

    <!-- Prepared Column -->
    <div data-testid="prepared-column">
      <CharacterSheetPreparedColumn
        :spells="spells"
        :prepared-count="preparedCount"
        :preparation-limit="preparationLimit"
        @toggle="handleToggle"
      />
    </div>
  </div>
</template>
